import pandas as pd
import numpy as np
import logging
logger = logging.getLogger(__name__)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def debug_data_split(data_path, group_sizes_path):
    logger.info("Starting LightGBM Group Size Debugger...")

    # --- 1. Load Data ---
    try:
        df = pd.read_csv(data_path)
        group_sizes = np.load(group_sizes_path)
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}. Exiting.")
        return

    # --- 2. Verify Data Integrity ---
    logger.info(f"Total records in DataFrame: {len(df)}")
    logger.info(f"Sum of group sizes (total expected records): {np.sum(group_sizes)}")
    
    if len(df) != np.sum(group_sizes):
        logger.error("CRITICAL ERROR: DataFrame length does not match sum of group sizes.")
        logger.error(f"DataFrame Length: {len(df)}")
        logger.error(f"Sum of Group Sizes: {np.sum(group_sizes)}")
        return

    # --- 3. Verify Split Logic ---
    # Split point: 80% for training, 20% for testing (based on number of races/groups)
    split_index = int(len(group_sizes) * 0.8)
    
    # Find the cumulative sum of group sizes to determine split point
    cum_groups = np.cumsum(group_sizes)
    split_row = cum_groups[split_index]
    
    # Split group sizes
    group_train = group_sizes[:split_index]
    group_test = group_sizes[split_index:]
    
    # Split data
    X_train = df.iloc[:split_row]
    X_test = df.iloc[split_row:]
    
    logger.info(f"Total number of groups (races): {len(group_sizes)}")
    logger.info(f"Split index (80% of groups): {split_index}")
    logger.info(f"Split row index (cumulative records): {split_row}")
    
    logger.info(f"Training Groups: {len(group_train)}")
    logger.info(f"Test Groups: {len(group_test)}")
    
    logger.info(f"Sum of Training Group Sizes: {np.sum(group_train)}")
    logger.info(f"Length of Training Data (iloc split): {len(X_train)}")
    
    logger.info(f"Sum of Test Group Sizes: {np.sum(group_test)}")
    logger.info(f"Length of Test Data (iloc split): {len(X_test)}")
    
    # --- 4. Final Check for LightGBM Error ---
    if len(X_train) != np.sum(group_train):
        logger.error("LightGBM Training Data Mismatch Detected!")
        logger.error(f"Sum of query counts (group_train sum): {np.sum(group_train)}")
        logger.error(f"Length of #data (X_train length): {len(X_train)}")
    else:
        logger.info("Training Data Split is Consistent.")

if __name__ == "__main__":
    data_path = "/home/ubuntu/racebase_ranking_data.csv"
    group_sizes_path = "/home/ubuntu/ranking_group_sizes.npy"
    debug_data_split(data_path, group_sizes_path)
