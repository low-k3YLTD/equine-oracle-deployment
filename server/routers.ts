import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  prediction: router({
    create: protectedProcedure
      .input((raw: unknown) => {
        if (typeof raw !== "object" || raw === null) throw new Error("Invalid input");
        const input = raw as Record<string, unknown>;
        return {
          horseName: String(input.horseName || ""),
          track: String(input.track || ""),
          raceType: String(input.raceType || ""),
          distance: Number(input.distance || 0),
          raceDate: String(input.raceDate || ""),
          daysSinceLastRace: input.daysSinceLastRace ? Number(input.daysSinceLastRace) : undefined,
          winningStreak: input.winningStreak ? Number(input.winningStreak) : undefined,
          losingStreak: input.losingStreak ? Number(input.losingStreak) : undefined,
          details: input.details ? String(input.details) : undefined,
          stakes: input.stakes ? String(input.stakes) : undefined,
        };
      })
      .mutation(async ({ ctx, input }) => {
        const { makePrediction, validatePredictionInput } = await import(
          "./services/predictionService"
        );
        const { createPrediction, getUserSubscription, createUserSubscription } = await import(
          "./db"
        );

        // Validate input
        const validationError = validatePredictionInput(input);
        if (validationError) {
          throw new Error(validationError);
        }

        // Get or create user subscription
        let subscription = await getUserSubscription(ctx.user.id);
        if (!subscription) {
          await createUserSubscription(ctx.user.id, "free");
          subscription = await getUserSubscription(ctx.user.id);
        }

        const tier = subscription?.tierName || "free";

        // Make prediction
        const result = makePrediction(input, tier);

        // Save to database
        await createPrediction({
          userId: ctx.user.id,
          horseName: input.horseName,
          track: input.track,
          raceType: input.raceType,
          distance: input.distance,
          raceDate: input.raceDate,
          daysSinceLastRace: input.daysSinceLastRace || null,
          winningStreak: input.winningStreak || null,
          losingStreak: input.losingStreak || null,
          lightgbmProbability: result.lightgbmProbability,
          xgboostProbability: result.xgboostProbability || null,
          randomForestProbability: result.randomForestProbability || null,
          ensembleProbability: result.ensembleProbability,
          confidence: result.confidence,
        });

        return {
          success: true,
          prediction: {
            horseName: result.horseName,
            lightgbm: result.lightgbmProbability / 100, // Convert to percentage
            xgboost: result.xgboostProbability ? result.xgboostProbability / 100 : undefined,
            randomForest: result.randomForestProbability
              ? result.randomForestProbability / 100
              : undefined,
            ensemble: result.ensembleProbability / 100,
            confidence: result.confidence,
          },
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPredictions } = await import("./db");
      const predictions = await getUserPredictions(ctx.user.id);
      return predictions.map((p) => ({
        id: p.id,
        horseName: p.horseName,
        track: p.track,
        raceType: p.raceType,
        distance: p.distance,
        raceDate: p.raceDate,
        lightgbm: p.lightgbmProbability ? p.lightgbmProbability / 100 : 0,
        xgboost: p.xgboostProbability ? p.xgboostProbability / 100 : undefined,
        randomForest: p.randomForestProbability ? p.randomForestProbability / 100 : undefined,
        ensemble: p.ensembleProbability ? p.ensembleProbability / 100 : 0,
        confidence: p.confidence,
        createdAt: p.createdAt,
      }));
    }),
  }),

  races: router({    todaysMeetings: publicProcedure.query(async () => {
      const { getTodaysMeetings } = await import("./services/tabApiService");
      return getTodaysMeetings();
    }),

    todaysRaces: publicProcedure.query(async () => {
      const { getTodaysRaces } = await import("./services/tabApiService");
      return getTodaysRaces();
    }),

    raceDetails: publicProcedure
      .input((raw: unknown) => {
        if (typeof raw !== "object" || raw === null) throw new Error("Invalid input");
        const input = raw as Record<string, unknown>;
        return {
          raceId: String(input.raceId || ""),
        };
      })
      .query(async ({ input }) => {
        const { getRaceDetails } = await import("./services/tabApiService");
        return getRaceDetails(input.raceId);
      }),

    uniqueTracks: publicProcedure.query(async () => {
      const { getTodaysRaces, getUniqueTracksFromRaces } = await import(
        "./services/tabApiService"
      );
      const races = await getTodaysRaces();
      return getUniqueTracksFromRaces(races);
    }),

    uniqueRaceTypes: publicProcedure.query(async () => {
      const { getTodaysRaces, getUniqueRaceTypes } = await import("./services/tabApiService");
      const races = await getTodaysRaces();
      return getUniqueRaceTypes(races);
    }),
    runners: publicProcedure
      .input((raw: unknown) => {
        if (typeof raw !== "object" || raw === null) throw new Error("Invalid input");
        const input = raw as Record<string, unknown>;
        return {
          raceId: String(input.raceId || ""),
        };
      })
      .query(async ({ input }) => {
        const { getRaceRunners } = await import("./services/tabApiService");
        return getRaceRunners(input.raceId);
      }),

    racesByMeeting: publicProcedure
      .input((raw: unknown) => {
        if (typeof raw !== "object" || raw === null) throw new Error("Invalid input");
        const input = raw as Record<string, unknown>;
        return {
          meetingId: String(input.meetingId || ""),
        };
      })
      .query(async ({ input }) => {
        const { getTodaysRaces } = await import("./services/tabApiService");
        const races = await getTodaysRaces();
        return races.filter((r) => r.meeting_id === input.meetingId);
      }),
  }),

  subscription: router({
    current: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSubscription, createUserSubscription } = await import("./db");
      let subscription = await getUserSubscription(ctx.user.id);
      if (!subscription) {
        await createUserSubscription(ctx.user.id, "free");
        subscription = await getUserSubscription(ctx.user.id);
      }
      return subscription;
    }),

    tiers: publicProcedure.query(async () => {
      const { getSubscriptionTiers } = await import("./db");
      const tiers = await getSubscriptionTiers();
      return tiers.map((tier) => ({
        ...tier,
        features: JSON.parse(tier.features),
      }));
    }),
  }),
});

export type AppRouter = typeof appRouter;
