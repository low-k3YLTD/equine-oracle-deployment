import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Subscription tier queries
export async function getSubscriptionTiers() {
  const db = await getDb();
  if (!db) return [];
  const { subscriptionTiers } = await import("../drizzle/schema");
  return db.select().from(subscriptionTiers);
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const { userSubscriptions } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(userSubscriptions.createdAt)
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createUserSubscription(userId: number, tierName: "free" | "basic" | "premium" | "elite") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { userSubscriptions } = await import("../drizzle/schema");
  const subscription = {
    userId,
    tierName,
    startDate: new Date(),
    endDate: null,
    isActive: 1,
  };
  await db.insert(userSubscriptions).values(subscription);
}

// Prediction queries
export async function createPrediction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { predictions } = await import("../drizzle/schema");
  const result = await db.insert(predictions).values(data);
  return result;
}

export async function getUserPredictions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const { predictions } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  return db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId))
    .orderBy(desc(predictions.createdAt))
    .limit(limit);
}

export async function getPredictionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { predictions } = await import("../drizzle/schema");
  const result = await db.select().from(predictions).where(eq(predictions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
