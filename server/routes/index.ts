import { Express } from "express";
import { createServer, type Server } from "http";

// Import route modules
import authRoutes from "./auth";
import creditApplicationRoutes from "./creditApplications";
import accountRoutes from "./accounts";
import notificationRoutes from "./notifications";
import userRoutes from "./users";
import profileRoutes from "./profiles";
import adminRoutes from "./admin";

export function registerRoutes(app: Express): Server {
  // Register all API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/applications", creditApplicationRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/profiles", profileRoutes);
  app.use("/api/admin", adminRoutes);

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