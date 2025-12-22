/**
 * Service to interact with the Railway-deployed ML Prediction API
 */

const ML_API_URL = process.env.ML_API_URL || "https://equine-oracle-system-production.up.railway.app";

interface PredictionFeatures {
  distance?: number;
  distance_numeric?: number;
  year?: number;
  month?: number;
  day?: number;
  day_of_week?: number;
  week_of_year?: number;
  days_since_last_race?: number;
  PREV_RACE_WON?: number;
  WIN_STREAK?: number;
  IMPLIED_PROBABILITY?: number;
  NORMALIZED_VOLUME?: number;
  MARKET_ACTIVITY_WINDOW_HOURS?: number;
}

interface PredictionResult {
  probability: number;
  confidence: number;
}

export async function callMlApi(features: PredictionFeatures): Promise<PredictionResult> {
  try {
    const response = await fetch(`${ML_API_URL}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authentication if needed
        // "Authorization": `Bearer ${process.env.ML_API_KEY}`
      },
      body: JSON.stringify({
        raceId: "generated",
        horseId: "generated",
        features: features,
      }),
    });

    if (!response.ok) {
      throw new Error(`ML API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      probability: data.prediction || 0,
      confidence: data.confidence || 0,
    };
  } catch (error) {
    console.error("Error calling ML API:", error);
    throw new Error(`Failed to get prediction from ML API: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function getMlApiInfo() {
  try {
    const response = await fetch(`${ML_API_URL}/api/model_info`);
    
    if (!response.ok) {
      throw new Error(`ML API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting ML API info:", error);
    return null;
  }
}
