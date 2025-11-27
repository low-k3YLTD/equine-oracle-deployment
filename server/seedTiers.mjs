import { drizzle } from "drizzle-orm/mysql2";
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

const subscriptionTiers = mysqlTable("subscriptionTiers", {
  id: int("id").autoincrement().primaryKey(),
  name: mysqlEnum("name", ["free", "basic", "premium", "elite"]).notNull().unique(),
  displayName: varchar("displayName", { length: 64 }).notNull(),
  price: int("price").notNull(),
  predictionsPerDay: int("predictionsPerDay").notNull(),
  features: text("features").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const db = drizzle(process.env.DATABASE_URL);

const tiers = [
  {
    name: "free",
    displayName: "Free",
    price: 0,
    predictionsPerDay: 5,
    features: JSON.stringify(["Basic predictions", "Single model (LightGBM)"]),
  },
  {
    name: "basic",
    displayName: "Basic",
    price: 999, // $9.99
    predictionsPerDay: 50,
    features: JSON.stringify([
      "50 predictions per day",
      "Single model (LightGBM)",
      "Prediction history",
    ]),
  },
  {
    name: "premium",
    displayName: "Premium",
    price: 2999, // $29.99
    predictionsPerDay: 500,
    features: JSON.stringify([
      "500 predictions per day",
      "Ensemble predictions (3 models)",
      "Advanced analytics",
      "Prediction history",
      "Priority support",
    ]),
  },
  {
    name: "elite",
    displayName: "Elite",
    price: 9999, // $99.99
    predictionsPerDay: 999999,
    features: JSON.stringify([
      "Unlimited predictions",
      "Ensemble predictions (3 models)",
      "Advanced analytics",
      "Full prediction history",
      "Priority support",
      "API access",
    ]),
  },
];

async function seed() {
  console.log("Seeding subscription tiers...");

  for (const tier of tiers) {
    try {
      await db.insert(subscriptionTiers).values(tier).onDuplicateKeyUpdate({
        set: {
          displayName: tier.displayName,
          price: tier.price,
          predictionsPerDay: tier.predictionsPerDay,
          features: tier.features,
        },
      });
      console.log(`✓ Seeded tier: ${tier.displayName}`);
    } catch (error) {
      console.error(`✗ Failed to seed tier ${tier.displayName}:`, error.message);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
