# Equine Oracle TODO

## Database Schema & Backend Infrastructure
- [x] Create database schema for predictions, races, and subscriptions
- [x] Setup prediction history table
- [x] Create subscription tiers table
- [x] Add race data table

## Prediction API & ML Integration
- [x] Copy ML models and preprocessing files from backend package
- [x] Create prediction service with feature engineering
- [x] Implement tRPC procedures for predictions
- [x] Add model loading and caching logic
- [x] Create health check endpoint

## Frontend UI
- [x] Design premium dark theme with gold accents
- [x] Create landing page with hero section
- [x] Build prediction input form
- [x] Create prediction results display with confidence scores
- [x] Add prediction history page
- [x] Build responsive navigation

## User Features & Subscription Management
- [x] Implement subscription tier system (free, basic, premium, elite)
- [x] Create subscription management page
- [x] Add rate limiting based on subscription tier
- [x] Build user dashboard
- [x] Add saved predictions feature

## Testing & Deployment
- [x] Test prediction flow end-to-end
- [x] Test subscription features
- [x] Verify responsive design
- [x] Create checkpoint
- [x] Generate user guide

## Live Feed Integration & UX Improvements
- [x] Research TAB API endpoints for live race data
- [x] Create TAB API integration service
- [x] Implement live race feed component
- [x] Add dropdown for track selection with live tracks
- [x] Add dropdown for race type selection
- [x] Auto-populate race details from selected race
- [x] Add race selection from live feed
- [x] Update prediction form with simplified workflow
- [x] Test live feed integration
- [x] Create checkpoint with live feed features

## Horse Name Auto-Population
- [x] Fetch race runners from TAB API when race selected
- [x] Add horse name dropdown to prediction form
- [x] Auto-populate horse dropdown from live race data
- [x] Test horse selection workflow
- [x] Create checkpoint with horse dropdown feature

## Prediction Screen Redesign
- [x] Analyze TAB API structure for meeting/race/horse hierarchy
- [x] Redesign prediction form with cascading selectors (Meet → Race → Horse)
- [x] Simplify form layout for easier navigation
- [x] Update LiveFeed to show meeting and race numbers clearly
- [x] Test simplified prediction workflow
- [x] Create checkpoint with redesigned prediction screen

## Debugging & Testing
- [x] Compile all TypeScript files
- [x] Check database schema and migrations
- [x] Test live feed data loading
- [x] Test meeting selection and race filtering
- [x] Test race selection and horse loading
- [x] Test prediction creation workflow
- [x] Test prediction history display
- [x] Test subscription tier selection
- [x] Verify responsive design on mobile
- [x] Test error handling and edge cases
- [x] Optimize UI/UX for elegance and ease of use
- [x] Create final checkpoint after debugging
