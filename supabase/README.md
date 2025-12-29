# Supabase Database Setup

This directory contains SQL migration files for setting up the database schema for the Crypto Trade Sharing Platform.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:

### Step 1: Create Tables and Functions
Run `001_initial_schema.sql` - This creates:
- `profiles` table (extends auth.users)
- `trades` table
- `ratings` table
- Indexes for performance
- Functions for auto-creating profiles, calculating PnL, etc.

### Step 2: Enable Row Level Security
Run `002_rls_policies.sql` - This:
- Enables RLS on all tables
- Creates policies for public read access
- Creates policies for users to manage their own data
- Prevents users from rating their own trades

### Step 3: Create Views and Stats Functions
Run `003_user_stats_view.sql` - This creates:
- `user_rankings` view for leaderboard
- `get_user_stats()` function
- `get_trade_with_stats()` function

## Database Schema Overview

### Tables

#### `profiles`
- Extends Supabase `auth.users`
- Stores username, avatar, bio
- Auto-created when user signs up

#### `trades`
- Stores all trade information
- Auto-calculates PnL when exit price is set
- Supports Open/Closed status

#### `ratings`
- Stores ratings (1-5 stars) for trades
- One rating per user per trade (enforced by UNIQUE constraint)
- Cannot rate own trades (enforced by trigger)

### Security

All tables use Row Level Security (RLS):
- **Public Read**: Anyone can view trades, profiles, and ratings
- **Authenticated Write**: Users can only create/update/delete their own data
- **Self-Rating Prevention**: Database-level enforcement prevents users from rating their own trades

### Views and Functions

- `user_rankings`: Materialized view for leaderboard with weighted scoring
- `get_user_stats(user_id)`: Function to get user statistics
- `get_trade_with_stats(trade_id)`: Function to get trade with aggregated rating data

## Testing the Setup

After running migrations, you can test:

1. **Create a test user** via Supabase Auth
2. **Check profile creation**: The trigger should auto-create a profile
3. **Insert a trade**: Use SQL editor to test trade creation
4. **Test RLS**: Try to insert a trade with a different user_id (should fail)

## Next Steps

After database setup:
1. Install Supabase client in Next.js
2. Set up environment variables
3. Create API routes or server actions for data fetching
4. Build authentication pages
5. Build trade submission forms

