// Mock data for The Racing API integration
export const mockRacecards = {
    meetings: [
        {
            id: "mt_1",
            name: "Ascot",
            races: [
                {
                    id: "rc_101",
                    raceNo: 1,
                    distance: "1200m",
                    startTime: new Date(Date.now() + 600000).toISOString(), // 10 mins from now
                    horses: [
                        { id: "hrs_1", name: "Lightning Bolt", number: 1 },
                        { id: "hrs_2", name: "Mystic Runner", number: 2 },
                        { id: "hrs_3", name: "Golden Hoof", number: 3 },
                    ],
                    result: { winner: "hrs_1", placings: ["hrs_1", "hrs_2", "hrs_3"] }
                },
                {
                    id: "rc_102",
                    raceNo: 2,
                    distance: "1600m",
                    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                    horses: [
                        { id: "hrs_4", name: "Silver Streak", number: 4 },
                        { id: "hrs_5", name: "Night Rider", number: 5 },
                    ],
                    result: { winner: "hrs_4", placings: ["hrs_4", "hrs_5"] }
                },
            ]
        },
    ]
};

export const mockOdds = {
    raceId: "rc_101",
    market: [
        { horseId: "hrs_1", winOdds: 2.5, volume: 1000 },
        { horseId: "hrs_2", winOdds: 5.0, volume: 500 },
        { horseId: "hrs_3", winOdds: 10.0, volume: 200 },
    ]
};

export const mockHorseHistory = {
    horseId: "hrs_1",
    stats: {
        days_since_last_race: 14,
        prev_race_won: 1,
        win_streak: 2,
    },
    recentRaces: [
        { date: "2025-11-01", result: "1st" },
        { date: "2025-10-15", result: "1st" },
        { date: "2025-09-01", result: "3rd" },
    ]
};
