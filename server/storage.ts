import { db } from "./db";
import { users, plans, transactions, type User, type InsertUser, type Plan, type Transaction } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: Partial<Transaction>): Promise<Transaction>;
  
  seedPlans(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user && !user.activePlanIds) {
      user.activePlanIds = [];
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans).orderBy(plans.price);
  }
  
  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }
  
  async createTransaction(transaction: any): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(transaction).returning();
    return tx;
  }
  
  async seedPlans(): Promise<void> {
    const existing = await this.getPlans();
    if (existing.length > 0) return;
    
    await db.insert(plans).values([
      { name: "Starter", price: "49.00", powerKw: "2.89", dailyMin: "7.00", dailyMax: "26.00", description: "Entry level wind power" },
      { name: "Advanced", price: "99.00", powerKw: "5.78", dailyMin: "14.00", dailyMax: "52.00", description: "Enhanced solar array" },
      { name: "Pro", price: "149.00", powerKw: "9.44", dailyMin: "23.00", dailyMax: "85.00", description: "Hydroelectric dam access" },
      { name: "Elite", price: "199.00", powerKw: "13.33", dailyMin: "33.00", dailyMax: "120.00", description: "Geothermal plant share" },
      { name: "Black", price: "249.00", powerKw: "17.78", dailyMin: "44.00", dailyMax: "160.00", description: "Nuclear fusion prototype" },
    ]);
  }

  async makeAdmin(email: string): Promise<void> {
    await db.update(users).set({ isAdmin: true }).where(eq(users.email, email));
  }
}

export const storage = new DatabaseStorage();
