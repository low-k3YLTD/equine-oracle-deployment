import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def prepare_ranking_data(processed_data_path, raw_data_path):
    """
    Prepares data for a Learning-to-Rank model by:
    1. Re-loading the raw data to get race-level grouping information.
    2. Merging with the processed data to get features.
    3. Creating a 'race_id' and 'group_id' for the ranking model.
    4. Creating a numerical 'rank' target (lower is better).
    """
    logger.info("Starting data preparation for Learning-to-Rank model...")

    # 1. Load raw data to get race-level grouping
    try:
        df_raw = pd.read_csv(raw_data_path, header=None)
        df_raw.columns = ["horse_name", "date", "track", "race_type", "distance", "position", "details", "stakes"]
    except FileNotFoundError:
        logger.error(f"Raw data file not found at {raw_data_path}. Exiting.")
        return None

    # 2. Load processed data (features)
    try:
        df_processed = pd.read_csv(processed_data_path)
    except FileNotFoundError:
        logger.error(f"Processed data file not found at {processed_data_path}. Exiting.")
        return None

    # 3. Merge dataframes to link features with race-level info
    # We need to re-run the date parsing and cleaning on the raw data to align the indices/rows
    
    # Re-run minimal cleaning on raw data to create a unique race identifier
    from data_analysis_and_feature_engineering_final import parse_date, clean_position
    
    df_raw["date_parsed"] = df_raw["date"].apply(parse_date)
    df_raw["position_numeric"] = df_raw["position"].apply(clean_position)
    
    # Create a unique race ID: Date + Track + Race Type + Distance
    df_raw['race_id'] = df_raw['date_parsed'].dt.strftime('%Y%m%d') + '_' + df_raw['track'].astype(str) + '_' + df_raw['race_type'].astype(str) + '_' + df_raw['distance'].astype(str)
    
    # Filter out rows where date parsing failed or position is missing
    df_raw = df_raw.dropna(subset=['date_parsed', 'position_numeric'])
    
    # The processed data has already been filtered and sorted.
    # We need to ensure the processed data is aligned with the raw data's race_id and position_numeric.
    
    # For simplicity and to avoid complex re-merging, we will assume the processed data
    # has the same number of rows and order as the raw data after filtering/sorting.
    # This is a strong assumption, but necessary without the full original pipeline.
    
    # We will use the 'race_id' and 'position_numeric' from the raw data.
    
    # The processed data has already been sorted by horse_name and date_parsed.
    # We need to re-sort the raw data in the same way to align the indices.
    df_raw = df_raw.sort_values(by=["horse_name", "date_parsed"]).reset_index(drop=True)
    
    # Align the processed data with the raw data's race_id and position_numeric
    if len(df_raw) != len(df_processed):
        logger.error("Data length mismatch after minimal cleaning. Cannot proceed with ranking preparation.")
        return None
        
    df_ranking = df_processed.copy()
    df_ranking['horse_name'] = df_raw['horse_name'] # ADDED: Horse name for evaluation
    df_ranking['race_id'] = df_raw['race_id']
    df_ranking['position_numeric'] = df_raw['position_numeric']
    
    # 4. Create the target rank: 1 for 1st, 2 for 2nd, etc.
    # For ranking models, the target is often the inverse of the rank (higher is better)
    # or the rank itself (lower is better). We will use the rank itself.
    # We will filter to only races where the horse finished (position_numeric < 998)
    df_ranking = df_ranking[df_ranking['position_numeric'] < 998].copy()
    
    # The target for LightGBM Ranker is the relevance score.
    # A lower position number means higher relevance (e.g., 1st is more relevant than 4th).
    # We will use the inverse of the rank as the relevance score.
    # Relevance Score: Inverse of position (higher is better, integer for LightGBM)
    # 1st -> 4, 2nd -> 3, 3rd -> 2, 4th -> 1, 5th+ -> 0
    df_ranking['relevance_score'] = np.where(df_ranking['position_numeric'] <= 4, 5 - df_ranking['position_numeric'], 0)
    
    # 5. Create the group_id (number of items per query/race)
    # LightGBM Ranker requires a 'group' column which specifies the number of items in each query.
    df_ranking['group_id'] = df_ranking.groupby('race_id')['race_id'].transform('count')
    
    # Sort by race_id and then by relevance_score (descending)
    df_ranking = df_ranking.sort_values(by=['race_id', 'relevance_score'], ascending=[True, False]).reset_index(drop=True)
    
    # Final check: group sizes for LightGBM
    group_sizes = df_ranking.groupby('race_id').size().values
    
    logger.info(f"Total rows for ranking: {len(df_ranking)}")
    logger.info(f"Number of unique races (groups): {len(group_sizes)}")
    logger.info(f"Group sizes array created for LightGBM: {group_sizes}")
    
    # Save the final ranking data
    output_path = "/home/ubuntu/racebase_ranking_data.csv"
    df_ranking.to_csv(output_path, index=False)
    logger.info(f"Ranking data saved to {output_path}")
    
    # Save the group sizes array for the training script
    np.save('/home/ubuntu/ranking_group_sizes.npy', group_sizes)
    logger.info("Ranking group sizes saved to /home/ubuntu/ranking_group_sizes.npy")
    
    return df_ranking

if __name__ == "__main__":
    # Assuming the processed data is in the root directory after the last phase
    processed_data_path = "/home/ubuntu/racebase_processed_data_final_v2.csv"
    # Assuming the raw data is still in the unzipped directory
    raw_data_path = "/home/ubuntu/user_files/predictor_app_refining/racebase_historical_data_v3.csv"
    
    # Need to import the utility functions from the other script
    # Since the utility functions are not in a package, we'll execute the script
    # and then run the main function.
    
    # Temporarily add the directory to the path to import the utility functions
    import sys
    sys.path.append('/home/ubuntu/user_files/predictor_app_refining')
    
    prepare_ranking_data(processed_data_path, raw_data_path)
