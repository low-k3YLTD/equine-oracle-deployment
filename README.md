# Equine Oracle Consolidated Project Archive

This archive contains the consolidated and organized files for the Equine Oracle project. All duplicate files have been eliminated, and the contents are structured into logical directories.

## Project Structure

| Directory | Contents |
| :--- | :--- |
| `backend/` | TypeScript files for data collection, scheduling, and API services (e.g., `racingApiDataService.ts`, `sync_scheduler_simple.ts`). |
| `frontend/` | Frontend application source code (React/TypeScript) including components, pages, and configuration (e.g., `CSVUpload.tsx`, `package.json`, `src/`). |
| `ml_models/` | Python scripts and serialized model files for the ensemble and ranking prediction systems (e.g., `ensemble_prediction_system_large.py`, `ranking_model.pkl`). |
| `data/` | Raw and processed data files (e.g., `racebase_historical_data_v3.csv`). |
| `docs/` | Project documentation and planning PDFs (e.g., R&D Workflow, API Integration Plan). |
| `config/` | Configuration files (e.g., `.env.example`). |

## Version Control and Reproducibility

This entire directory is a **Git repository**, which provides a complete history, accurate records, and the capability for rollbacks, as requested.

### Key Git Commands

1.  **Check History**: To view the full commit history and find the commit hash for a specific version:
    ```bash
    git log --oneline
    ```

2.  **Rollback to Initial State**: To revert the entire project back to the state it was in when this archive was first created (the initial commit):
    ```bash
    # Replace <INITIAL_COMMIT_HASH> with the actual hash from 'git log'
    git checkout <INITIAL_COMMIT_HASH>
    ```

3.  **Adding New Files / Updating the Archive**:
    If you add or modify files, you can easily record the changes:
    ```bash
    # Add new/modified files to staging
    git add .
    # Commit the changes with a descriptive message
    git commit -m "Added new feature X and updated file Y"
    ```
    To create a new, updated zip archive, simply zip the directory again.

## Initial Commit Hash

The initial commit hash for this consolidated archive is: **f01017023fdfd79a842c4cbc6fbb846a5c818949**.
(Note: This placeholder will be replaced with the actual hash in the next step.)
