import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(), // Hashed
  username: text("username").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(), // In USD
  energyBalance: decimal("energy_balance", { precision: 10, scale: 4 }).default("0").notNull(), // In kWh
  totalConnectedTime: integer("total_connected_time").default(0).notNull(), // In seconds
  currentPlanId: integer("current_plan_id"), // Null means no active plan
  isAdmin: boolean("is_admin").default(false).notNull(),
  lastHeartbeat: timestamp("last_heartbeat"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  powerKw: decimal("power_kw", { precision: 10, scale: 2 }).notNull(),
  dailyMin: decimal("daily_min", { precision: 10, scale: 2 }).notNull(), // Min earnings 2h
  dailyMax: decimal("daily_max", { precision: 10, scale: 2 }).notNull(), // Max earnings 6h
  description: text("description"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'mining', 'purchase'
  status: text("status").default("completed").notNull(), // 'pending', 'completed', 'failed'
  metadata: jsonb("metadata"), // Extra info
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  username: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// === EXPLICIT API TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Plan = typeof plans.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = InsertUser;

export type UpdateProfileRequest = Partial<Pick<User, "username" | "email">>;

export type MiningHeartbeatRequest = {
  connectedSeconds: number; // Seconds since last heartbeat
};

export type MiningStatsResponse = {
  currentPower: number;
  todayEarnings: number;
  totalEnergy: number;
  isConnected: boolean;
};

export type WithdrawRequest = {
  amount: number;
  method: string; // 'paypal', 'usdt', etc.
  destination: string; // address or email
};

export type PlanPurchaseRequest = {
  planId: number;
};
