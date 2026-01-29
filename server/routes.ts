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
      store: new pgSessionStore({ 
        pool, 
        createTableIfMissing: process.env.NODE_ENV !== "production" 
      }),
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
    const user = req.user as any;
    const activePlans = await Promise.all(
      (user.activePlanIds || []).map((id: number) => storage.getPlan(id))
    );
    
    const validPlans = activePlans.filter((p): p is Plan => p !== undefined);
    
    let totalPowerKw = 0;
    for (const plan of validPlans) {
      totalPowerKw += parseFloat(plan.powerKw.toString());
    }

    // Determine Rank based on power
    let bonusMultiplier = 1.0;
    if (totalPowerKw >= 100) bonusMultiplier = 1.20; // 20% bonus
    else if (totalPowerKw >= 50) bonusMultiplier = 1.15; // 15% bonus
    else if (totalPowerKw >= 25) bonusMultiplier = 1.10; // 10% bonus
    else if (totalPowerKw >= 10) bonusMultiplier = 1.05; // 5% bonus

    if (validPlans.length === 0) return res.status(200).json({ earnedAmount: 0, newBalance: Number(user.balance), energyProduced: 0 });

    const seconds = req.body.connectedSeconds || 1;
    
    const gainPerSecond = (totalPowerKw * 1.50 * bonusMultiplier) / 3600;
    const energyPerSecond = totalPowerKw / 3600;

    const earnedAmount = gainPerSecond * seconds;
    const energyProduced = energyPerSecond * seconds;
    
    // Crucial: Use more decimals for the intermediate sum before rounding
    const currentBalance = parseFloat(user.balance.toString());
    const currentEnergy = parseFloat(user.energyBalance.toString());
    
    const newBalance = currentBalance + earnedAmount;
    const newEnergy = currentEnergy + energyProduced;
    const newTime = (user.totalConnectedTime || 0) + seconds;
    
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance.toFixed(8), 
      energyBalance: newEnergy.toFixed(8),
      totalConnectedTime: newTime,
      lastHeartbeat: new Date(),
    });
    
    res.json({
      earnedAmount,
      newBalance: parseFloat(newBalance.toFixed(8)),
      energyProduced,
      rank: totalPowerKw >= 100 ? "Diamond" : totalPowerKw >= 50 ? "Platinum" : totalPowerKw >= 25 ? "Gold" : totalPowerKw >= 10 ? "Silver" : "Bronze",
      bonus: bonusMultiplier > 1 ? `${Math.round((bonusMultiplier - 1) * 100)}%` : "0%"
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
    
    // Deduct balance and add to active plans
    const newBalance = Number(user.balance) - Number(plan.price);
    const activePlanIds = [...(user.activePlanIds || []), plan.id];

    await storage.updateUser(user.id, {
      balance: newBalance.toFixed(2),
      activePlanIds: activePlanIds,
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
    // Retrait de la vérification isAdmin pour permettre l'accès via /admin
    if (!req.isAuthenticated()) return res.status(403).send();
    const txs = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    res.json(txs);
  });

  app.patch("/api/admin/transactions/:id", async (req, res) => {
    // Retrait de la vérification isAdmin
    if (!req.isAuthenticated()) return res.status(403).send();
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

  return httpServer;
}
