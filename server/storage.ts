import { 
  users, 
  creditApplications, 
  accounts, 
  payments,
  type User, 
  type InsertUser,
  type CreditApplication,
  type InsertCreditApplication,
  type Account,
  type InsertAccount,
  type Payment,
  type InsertPayment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Credit application operations
  createCreditApplication(application: InsertCreditApplication): Promise<CreditApplication>;
  getCreditApplicationsByUserId(userId: string): Promise<CreditApplication[]>;
  getCreditApplicationById(id: string): Promise<CreditApplication | undefined>;
  updateCreditApplicationStatus(id: string, status: "pending" | "approved" | "rejected", rejectionReason?: string): Promise<void>;

  // Account operations
  createAccount(account: InsertAccount): Promise<Account>;
  getAccountsByUserId(userId: string): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | undefined>;
  updateAccountBalance(id: string, newBalance: number, nextPaymentDate?: Date): Promise<void>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByAccountId(accountId: string): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Credit application operations
  async createCreditApplication(application: InsertCreditApplication): Promise<CreditApplication> {
    const [app] = await db
      .insert(creditApplications)
      .values({
        ...application,
        updatedAt: new Date(),
      })
      .returning();
    return app;
  }

  async getCreditApplicationsByUserId(userId: string): Promise<CreditApplication[]> {
    return await db
      .select()
      .from(creditApplications)
      .where(eq(creditApplications.userId, userId))
      .orderBy(desc(creditApplications.createdAt));
  }

  async getCreditApplicationById(id: string): Promise<CreditApplication | undefined> {
    const [app] = await db.select().from(creditApplications).where(eq(creditApplications.id, id));
    return app;
  }

  async updateCreditApplicationStatus(
    id: string, 
    status: "pending" | "approved" | "rejected", 
    rejectionReason?: string
  ): Promise<void> {
    await db
      .update(creditApplications)
      .set({ 
        status, 
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(creditApplications.id, id));
  }

  // Account operations
  async createAccount(account: InsertAccount): Promise<Account> {
    const [acc] = await db
      .insert(accounts)
      .values({
        ...account,
        updatedAt: new Date(),
      })
      .returning();
    return acc;
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(desc(accounts.createdAt));
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async updateAccountBalance(id: string, newBalance: number, nextPaymentDate?: Date): Promise<void> {
    const updateData: any = { 
      outstandingBalance: newBalance.toString(),
      updatedAt: new Date(),
    };
    
    if (nextPaymentDate) {
      updateData.nextPaymentDate = nextPaymentDate;
    }

    await db
      .update(accounts)
      .set(updateData)
      .where(eq(accounts.id, id));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [pay] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return pay;
  }

  async getPaymentsByAccountId(accountId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.accountId, accountId))
      .orderBy(desc(payments.paymentDate));
  }
}

export const storage = new DatabaseStorage();
