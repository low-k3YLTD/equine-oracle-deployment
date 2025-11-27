import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import ndcg_score
import joblib
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def train_and_evaluate_ranker(data_path, group_sizes_path):
    """
    Trains a LightGBM Ranker model and evaluates its performance.
    """
    logger.info("Starting LightGBM Ranker training and evaluation...")

    # --- 1. Load Data ---
    try:
        df = pd.read_csv(data_path)
        group_sizes = np.load(group_sizes_path)
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}. Exiting.")
        return

    # --- 2. Prepare Features and Target ---
    TARGET_COL = 'relevance_score'
    GROUP_COL = 'race_id'
    
    # Features: Exclude target, group, intermediate, and non-numeric columns
    feature_cols = [col for col in df.columns if col not in [TARGET_COL, GROUP_COL, 'position_numeric', 'group_id', 'horse_name']]
    
    X = df[feature_cols]
    y = df[TARGET_COL]
    
    # --- 3. Split Data (Time-Series Split) ---
    # Since the data is already sorted by race_id (which is based on date), 
    # we can use a simple split based on index for a time-series-like split.
    
    # Find the cumulative sum of group sizes to determine split point
    cum_groups = np.cumsum(group_sizes)
    
    # Split point: 80% for training, 20% for testing (based on number of races/groups)
    split_race_index = int(len(group_sizes) * 0.8)
    
    # The split row is the cumulative sum up to the split_race_index
    split_row = cum_groups[split_race_index - 1] if split_race_index > 0 else 0
    
    X_train, X_test = X.iloc[:split_row], X.iloc[split_row:]
    y_train, y_test = y.iloc[:split_row], y.iloc[split_row:]
    
    # Split group sizes
    group_train = group_sizes[:split_race_index]
    group_test = group_sizes[split_race_index:]
    
    logger.info(f"Training set size: {len(X_train)} rows, {len(group_train)} races")
    logger.info(f"Test set size: {len(X_test)} rows, {len(group_test)} races")

    # --- 4. Train LightGBM Ranker ---
    lgb_params = {
        'objective': 'lambdarank',
        'metric': 'ndcg',
        'ndcg_eval_at': [1, 2, 3, 4], # Evaluate for Trifecta (Top 3) and First Four (Top 4)
        'boosting_type': 'gbdt',
        'n_estimators': 500,
        'learning_rate': 0.05,
        'num_leaves': 31,
        'verbose': -1,
        'n_jobs': -1,
        'seed': 42
    }
    
    ranker = lgb.LGBMRanker(**lgb_params)
    
    # LightGBM requires the group sizes for training
    ranker.fit(X_train, y_train, group=group_train)
    
    # --- 5. Evaluate ---
    y_pred = ranker.predict(X_test)
    
    # Calculate NDCG@k for the test set
    ndcg_results = {}
    
    # Group test data by race_id
    test_races = df.iloc[split_row:].copy()
    test_races['predicted_score'] = y_pred
    
    # Calculate NDCG for each race and average
    for k in [1, 2, 3, 4]:
        ndcg_list = []
        for race_id, group in test_races.groupby(GROUP_COL):
            # True relevance scores (y_true)
            y_true = group[TARGET_COL].values
            # Predicted scores (y_pred)
            y_score = group['predicted_score'].values
            
            # Ensure there are at least 2 items to calculate NDCG (as required by sklearn)
            if len(y_true) > 1:
                # ndcg_score expects y_true and y_score to be 2D arrays
                ndcg = ndcg_score([y_true], [y_score], k=k)
                ndcg_list.append(ndcg)
        
        ndcg_results[f'NDCG@{k}'] = np.mean(ndcg_list)

    # --- 6. Top-K Accuracy (Trifecta/First Four Accuracy) ---
    # Top-K Accuracy: How often is the true top-K set of horses predicted as the top-K set?
    
    # The true top-K horses are those with the highest relevance_score (lowest position_numeric)
    # The predicted top-K horses are those with the highest predicted_score
    
    top_k_accuracy = {}
    for k in [3, 4]: # Trifecta (3) and First Four (4)
        correct_predictions = 0
        total_races = 0
        
        for race_id, group in test_races.groupby(GROUP_COL):
            total_races += 1
            
            # True top K horses (based on relevance_score)
            true_top_k_indices = group[TARGET_COL].nlargest(k).index
            true_top_k_horses = set(group.loc[true_top_k_indices, 'horse_name'])
            
            # Predicted top K horses (based on predicted_score)
            pred_top_k_indices = group['predicted_score'].nlargest(k).index
            pred_top_k_horses = set(group.loc[pred_top_k_indices, 'horse_name'])
            
            # Check if the sets are identical (order doesn't matter for this simple metric)
            if true_top_k_horses == pred_top_k_horses:
                correct_predictions += 1
                
        top_k_accuracy[f'Top-{k} Set Accuracy'] = correct_predictions / total_races
        
    # --- 7. Save Results and Model ---
    
    # Save the model
    model_path = '/home/ubuntu/ranking_model.pkl'
    joblib.dump(ranker, model_path)
    logger.info(f"Ranking model saved to {model_path}")
    
    # Create a report
    report_content = f"""# LightGBM Ranker Performance Report

**Training Date:** {datetime.now().isoformat()}
**Data Path:** {data_path}
**Number of Features:** {len(feature_cols)}
**Training Races:** {len(group_train)}
**Test Races:** {len(group_test)}

## Evaluation Metrics

### Normalized Discounted Cumulative Gain (NDCG)
NDCG measures the quality of the ranking, where a higher score is better (max 1.0).

| Metric | Score |
| :--- | :--- |
| NDCG@1 | {ndcg_results['NDCG@1']:.4f} |
| NDCG@2 | {ndcg_results['NDCG@2']:.4f} |
| NDCG@3 (Trifecta) | {ndcg_results['NDCG@3']:.4f} |
| NDCG@4 (First Four) | {ndcg_results['NDCG@4']:.4f} |

### Top-K Set Accuracy
Measures how often the predicted set of top K horses matches the true set of top K horses (order ignored).

| Metric | Score |
| :--- | :--- |
| Top-3 Set Accuracy (Trifecta) | {top_k_accuracy['Top-3 Set Accuracy']:.4f} |
| Top-4 Set Accuracy (First Four) | {top_k_accuracy['Top-4 Set Accuracy']:.4f} |

## Feature Importance

| Feature | Importance |
| :--- | :--- |
"""
    
    # Get feature importance
    feature_importance = pd.Series(ranker.feature_importances_, index=feature_cols).sort_values(ascending=False)
    
    for feature, importance in feature_importance.head(10).items():
        report_content += f"| {feature} | {importance} |\n"
        
    report_path = '/home/ubuntu/ranking_model_report.md'
    with open(report_path, 'w') as f:
        f.write(report_content)
    logger.info(f"Ranking model report saved to {report_path}")
    
    return ndcg_results, top_k_accuracy

if __name__ == "__main__":
    from datetime import datetime
    data_path = "/home/ubuntu/racebase_ranking_data.csv"
    group_sizes_path = "/home/ubuntu/ranking_group_sizes.npy"
    
    train_and_evaluate_ranker(data_path, group_sizes_path)
