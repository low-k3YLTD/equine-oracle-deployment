import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Subscription tiers table
export const subscriptionTiers = mysqlTable("subscriptionTiers", {
  id: int("id").autoincrement().primaryKey(),
  name: mysqlEnum("name", ["free", "basic", "premium", "elite"]).notNull().unique(),
  displayName: varchar("displayName", { length: 64 }).notNull(),
  price: int("price").notNull(), // in cents
  predictionsPerDay: int("predictionsPerDay").notNull(),
  features: text("features").notNull(), // JSON array of feature names
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = typeof subscriptionTiers.$inferInsert;

// User subscriptions table
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tierName: mysqlEnum("tierName", ["free", "basic", "premium", "elite"]).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// Predictions table
export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  horseName: varchar("horseName", { length: 255 }).notNull(),
  track: varchar("track", { length: 255 }).notNull(),
  raceType: varchar("raceType", { length: 64 }).notNull(),
  distance: int("distance").notNull(),
  raceDate: varchar("raceDate", { length: 64 }).notNull(),
  daysSinceLastRace: int("daysSinceLastRace"),
  winningStreak: int("winningStreak"),
  losingStreak: int("losingStreak"),
  // Prediction results
  lightgbmProbability: int("lightgbmProbability"), // stored as percentage (0-10000 for 0.00% to 100.00%)
  xgboostProbability: int("xgboostProbability"),
  randomForestProbability: int("randomForestProbability"),
  ensembleProbability: int("ensembleProbability"),
  confidence: varchar("confidence", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;