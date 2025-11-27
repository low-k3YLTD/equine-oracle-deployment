# LightGBM Ranker Performance Report

**Training Date:** 2025-11-03T08:59:43.017211
**Data Path:** /home/ubuntu/racebase_ranking_data.csv
**Number of Features:** 56
**Training Races:** 180
**Test Races:** 46

## Evaluation Metrics

### Normalized Discounted Cumulative Gain (NDCG)
NDCG measures the quality of the ranking, where a higher score is better (max 1.0).

| Metric | Score |
| :--- | :--- |
| NDCG@1 | 1.0000 |
| NDCG@2 | 1.0000 |
| NDCG@3 (Trifecta) | 1.0000 |
| NDCG@4 (First Four) | 1.0000 |

### Top-K Set Accuracy
Measures how often the predicted set of top K horses matches the true set of top K horses (order ignored).

| Metric | Score |
| :--- | :--- |
| Top-3 Set Accuracy (Trifecta) | 1.0000 |
| Top-4 Set Accuracy (First Four) | 1.0000 |

## Feature Importance

| Feature | Importance |
| :--- | :--- |
| horse_rank_rolling_mean_10 | 212 |
| is_top3 | 192 |
| prev_perf_index | 182 |
| horse_perf_avg_rolling_mean_5 | 172 |
| track_dist_avg_pos | 144 |
| horse_name_decay_form_90 | 128 |
| is_winner | 96 |
| days_since_last_race | 86 |
| horse_perf_avg_rolling_std_5 | 83 |
| horse_top3_rate_rolling_std_5 | 78 |
