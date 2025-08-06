import { Express, Router } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { CreditProgramController } from "../controllers/CreditProgramController";

// Import route modules
import authRoutes from "./auth";
import creditApplicationRoutes from "./creditApplications";
import accountRoutes from "./accounts";
import notificationRoutes from "./notifications";
import userRoutes from "./users";
import profileRoutes from "./profiles";
import adminRoutes from "./admin";
import financialUserRoutes from "./financialUsers";

export function registerRoutes(app: Express): Server {
  // Middleware to verify JWT token
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // Import storage here to avoid circular dependencies
      const { storage } = await import("../storage");
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

  // Credit Programs Routes
  const creditProgramRouter = Router();
  creditProgramRouter.use(authenticateToken);
  creditProgramRouter.get("/", CreditProgramController.getPrograms);
  creditProgramRouter.get("/:id", CreditProgramController.getProgram);
  creditProgramRouter.post("/", CreditProgramController.createProgram);
  creditProgramRouter.put("/:id", CreditProgramController.updateProgram);
  creditProgramRouter.delete("/:id", CreditProgramController.deleteProgram);
  creditProgramRouter.patch("/:id/toggle-status", CreditProgramController.toggleActiveStatus);

  // Register all API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/credit-applications", creditApplicationRoutes);
  app.use("/api/credit-programs", creditProgramRouter);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/profiles", profileRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/financial-users", financialUserRoutes);

  // Add credit simulator as a public route
  app.post("/api/simulate-credit", (req, res) => {
    const { amount, term, projectType } = req.body;

    if (!amount || !term) {
      return res.status(400).json({ message: "Amount and term are required" });
    }

    // Base interest rate calculation based on project type
    let baseRate = 15;
    const rateAdjustments: { [key: string]: number } = {
      cattle: -2,
      corn: -1, 
      cassava: 0,
      horticulture: 1,
      poultry: 2,
      other: 3,
    };

    const interestRate = baseRate + (rateAdjustments[projectType] || 0);
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                          (Math.pow(1 + monthlyRate, term) - 1);

    const totalAmount = monthlyPayment * term;
    const totalInterest = totalAmount - amount;

    res.json({
      amount: parseFloat(amount),
      term: parseInt(term),
      interestRate: parseFloat(interestRate.toFixed(2)),
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
    });
  });

  return createServer(app);
}