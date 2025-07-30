import { sql } from "drizzle-orm";
import { pgTable, varchar, text, decimal, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userTypeEnum = pgEnum("user_type", ["farmer", "company", "cooperative", "financial_institution", "admin"]);
export const projectTypeEnum = pgEnum("project_type", ["corn", "cassava", "cattle", "poultry", "horticulture", "other"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "under_review", "approved", "rejected"]);

// Profiles table for role management
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(false), // System profiles cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  module: varchar("module", { length: 50 }).notNull(), // e.g., 'applications', 'accounts', 'reports', 'admin'
  action: varchar("action", { length: 50 }).notNull(), // e.g., 'create', 'read', 'update', 'delete', 'approve'
  createdAt: timestamp("created_at").defaultNow(),
});

// Profile permissions junction table
export const profilePermissions = pgTable("profile_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  permissionId: varchar("permission_id").notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  bi: varchar("bi", { length: 50 }).notNull().unique(), // Bilhete de Identidade
  nif: varchar("nif", { length: 50 }), // NIF is optional
  phone: varchar("phone", { length: 20 }).notNull().unique(), // Angola phone format
  email: varchar("email", { length: 255 }).unique(), // Email is optional
  password: text("password").notNull(),
  userType: userTypeEnum("user_type").notNull(),
  profileId: varchar("profile_id").references(() => profiles.id), // Link to profile for permissions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit applications table
export const creditApplications = pgTable("credit_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  projectType: projectTypeEnum("project_type").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // AOA amount
  term: integer("term").notNull(), // months
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }), // percentage
  status: applicationStatusEnum("status").default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id), // Financial institution that reviewed this application
  approvedBy: varchar("approved_by").references(() => users.id), // Financial institution that approved this application
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accounts table for managing approved credits
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => creditApplications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  financialInstitutionId: varchar("financial_institution_id").notNull().references(() => users.id), // Which institution approved and manages this account
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  outstandingBalance: decimal("outstanding_balance", { precision: 15, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 15, scale: 2 }).notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment history table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedId: varchar("related_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditApplicationSchema = createInsertSchema(creditApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  rejectionReason: true,
  interestRate: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertProfilePermissionSchema = createInsertSchema(profilePermissions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CreditApplication = typeof creditApplications.$inferSelect;
export type InsertCreditApplication = z.infer<typeof insertCreditApplicationSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type ProfilePermission = typeof profilePermissions.$inferSelect;
export type InsertProfilePermission = z.infer<typeof insertProfilePermissionSchema>;
