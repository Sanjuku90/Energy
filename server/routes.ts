import { db, pool } from "./db";
import { users, plans, transactions, type User, type InsertUser, type Plan, type Transaction } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import pgSession from "connect-pg-simple";

const scryptAsync = promisify(scrypt);
const pgSessionStore = pgSession(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === AUTH SETUP ===
  app.use(
    session({
      store: new pgSessionStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) return done(null, false, { message: "Invalid credentials" });
        if (!(await comparePasswords(password, user.password)))
          return done(null, false, { message: "Invalid credentials" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === ROUTES ===

  // Auth
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        next(err);
      }
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.status(200).send();
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    res.json(req.user);
  });

  // Mining Heartbeat
  app.post(api.mining.heartbeat.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    
    // Logic: Calculate earnings based on plan and time
    // This is a simplified simulation
    const user = req.user as any;
    const plan = await storage.getPlan(user.currentPlanId);
    
    if (!plan) return res.status(500).json({ message: "Plan not found" });

    // Use seconds from request to calculate precise earnings
    const seconds = req.body.connectedSeconds || 60;
    
    // Earnings calculation: 
    // Daily Min is based on ~2h (7200s), Max on ~6h (21600s)
    // Let's use an average hourly rate derived from DailyMax / 6h
    const hourlyRate = Number(plan.dailyMax) / 6;
    const earnedAmount = (hourlyRate / 3600) * seconds;
    
    // Energy: 1 kW * 1h = 1 kWh. 
    // Let's say powerKw is the rate per hour.
    const energyProduced = (Number(plan.powerKw) / 3600) * seconds;

    // Update user
    const newBalance = Number(user.balance) + earnedAmount;
    const newEnergy = Number(user.energyBalance) + energyProduced;
    const newTime = user.totalConnectedTime + seconds;
    
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance.toFixed(2),
      energyBalance: newEnergy.toFixed(4),
      totalConnectedTime: newTime,
      lastHeartbeat: new Date(),
    });
    
    // Create 'mining' transaction periodically or just accumulate?
    // For simplicity, we just update balance here. 
    // A real app might batch transactions.
    
    res.json({
      earnedAmount,
      newBalance: Number(updatedUser.balance),
      energyProduced,
    });
  });

  // Plans
  app.get(api.plans.list.path, async (req, res) => {
    const plans = await storage.getPlans();
    res.json(plans);
  });

  app.post(api.plans.purchase.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    const { planId } = req.body;
    
    const plan = await storage.getPlan(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    
    if (Number(user.balance) < Number(plan.price)) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    
    // Deduct balance and update plan
    const newBalance = Number(user.balance) - Number(plan.price);
    await storage.updateUser(user.id, {
      balance: newBalance.toFixed(2),
      currentPlanId: plan.id,
    });
    
    await storage.createTransaction({
      userId: user.id,
      amount: plan.price,
      type: "purchase",
      status: "completed",
      metadata: { planName: plan.name }
    });
    
    const updatedUser = await storage.getUser(user.id);
    res.json(updatedUser);
  });

  app.post("/api/transactions/deposit", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    const { amount, transactionHash } = req.body;

    const tx = await storage.createTransaction({
      userId: user.id,
      amount: amount.toString(),
      type: "deposit",
      status: "pending",
      metadata: { transactionHash }
    });

    res.status(201).json(tx);
  });

  // Admin
  app.get("/api/admin/transactions", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) return res.status(403).send();
    const txs = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    res.json(txs);
  });

  app.patch("/api/admin/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) return res.status(403).send();
    const { status } = req.body;
    const [tx] = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, parseInt(req.params.id)))
      .returning();
    
    if (status === "completed") {
      const user = await storage.getUser(tx.userId);
      if (user) {
        if (tx.type === "deposit") {
          await storage.updateUser(user.id, {
            balance: (Number(user.balance) + Number(tx.amount)).toFixed(2)
          });
        }
        // Withdrawal balance is already deducted at request time in this implementation
      }
    } else if (status === "failed" && tx.type === "withdrawal") {
      // Refund if rejected
      const user = await storage.getUser(tx.userId);
      if (user) {
        await storage.updateUser(user.id, {
          balance: (Number(user.balance) + Number(tx.amount)).toFixed(2)
        });
      }
    }
    res.json(tx);
  });

  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const txs = await storage.getTransactions((req.user as any).id);
    res.json(txs);
  });
  
  app.post(api.transactions.withdraw.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    const { amount, method, destination } = req.body;
    
    if (amount > Number(user.balance)) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    
    // Deduct balance immediately
    const newBalance = Number(user.balance) - amount;
    await storage.updateUser(user.id, { balance: newBalance.toFixed(2) });
    
    const tx = await storage.createTransaction({
      userId: user.id,
      amount: amount.toString(),
      type: "withdrawal",
      status: "pending",
      metadata: { method, destination }
    });
    
    res.status(201).json(tx);
  });

  // Seed plans on startup
  await storage.seedPlans();
  await storage.makeAdmin("sjuku19@gmail.con");

  return httpServer;
}
