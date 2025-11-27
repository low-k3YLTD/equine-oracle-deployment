CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`horseName` varchar(255) NOT NULL,
	`track` varchar(255) NOT NULL,
	`raceType` varchar(64) NOT NULL,
	`distance` int NOT NULL,
	`raceDate` varchar(64) NOT NULL,
	`daysSinceLastRace` int,
	`winningStreak` int,
	`losingStreak` int,
	`lightgbmProbability` int,
	`xgboostProbability` int,
	`randomForestProbability` int,
	`ensembleProbability` int,
	`confidence` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('free','basic','premium','elite') NOT NULL,
	`displayName` varchar(64) NOT NULL,
	`price` int NOT NULL,
	`predictionsPerDay` int NOT NULL,
	`features` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptionTiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptionTiers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tierName` enum('free','basic','premium','elite') NOT NULL,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`)
);
