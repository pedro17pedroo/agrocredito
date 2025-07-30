import { Express } from "express";
import { createServer, type Server } from "http";

// Import route modules
import authRoutes from "./auth";
import creditApplicationRoutes from "./creditApplications";
import accountRoutes from "./accounts";
import notificationRoutes from "./notifications";
import userRoutes from "./users";
import profileRoutes from "./profiles";

export function registerRoutes(app: Express): Server {
  // Register all API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/applications", creditApplicationRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/profiles", profileRoutes);

  return createServer(app);
}