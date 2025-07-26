import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertCreditApplicationSchema } from "@shared/schema";
import { z } from "zod";

// JWT secret - in production this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(userData.phone) || 
                          (userData.email ? await storage.getUserByEmail(userData.email) : null);
      
      if (existingUser) {
        return res.status(400).json({ message: "Utilizador já existe com este telefone ou email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { loginIdentifier, password } = req.body;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ message: "Email/telefone e palavra-passe são obrigatórios" });
      }

      // Find user by email or phone
      let user = null;
      if (loginIdentifier.includes("@")) {
        user = await storage.getUserByEmail(loginIdentifier);
      } else {
        user = await storage.getUserByPhone(loginIdentifier);
      }

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({
      id: req.user.id,
      fullName: req.user.fullName,
      phone: req.user.phone,
      email: req.user.email,
      userType: req.user.userType,
    });
  });

  // Credit application routes
  app.post("/api/credit-applications", authenticateToken, async (req: any, res) => {
    try {
      const applicationData = insertCreditApplicationSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const application = await storage.createCreditApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Credit application error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/credit-applications", authenticateToken, async (req: any, res) => {
    try {
      const applications = await storage.getCreditApplicationsByUserId(req.user.id);
      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/credit-applications/:id", authenticateToken, async (req: any, res) => {
    try {
      const application = await storage.getCreditApplicationById(req.params.id);
      if (!application || application.userId !== req.user.id) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }
      res.json(application);
    } catch (error) {
      console.error("Get application error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Account routes
  app.get("/api/accounts", authenticateToken, async (req: any, res) => {
    try {
      const accounts = await storage.getAccountsByUserId(req.user.id);
      res.json(accounts);
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Credit simulation endpoint
  app.post("/api/simulate-credit", async (req, res) => {
    try {
      const { amount, term, projectType } = req.body;

      if (!amount || !term) {
        return res.status(400).json({ message: "Montante e prazo são obrigatórios" });
      }

      // Simple interest rate calculation based on project type and term
      let baseRate = 15; // 15% base rate
      
      // Adjust rate based on project type (some projects are riskier)
      const rateAdjustments: { [key: string]: number } = {
        cattle: -2, // Lower risk
        corn: -1,
        cassava: 0,
        horticulture: 1,
        poultry: 2,
        other: 3, // Higher risk
      };

      const interestRate = baseRate + (rateAdjustments[projectType] || 0);
      
      // Calculate monthly payment using compound interest formula
      const monthlyRate = interestRate / 100 / 12;
      const numPayments = parseInt(term);
      const principal = parseFloat(amount);
      
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      const totalAmount = monthlyPayment * numPayments;

      res.json({
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(totalAmount),
        interestRate,
        totalInterest: Math.round(totalAmount - principal),
      });
    } catch (error) {
      console.error("Simulation error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
