# Supabase Integration Setup Guide

This guide will walk you through setting up Supabase in your Next.js application.

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. You'll need two values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 2: Create Environment Variables

1. In your project root (`crfix/`), create a file named `.env.local`
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser

## Step 3: Verify Database Setup

Make sure you've run all three SQL migration files in Supabase SQL Editor:
- ✅ `001_initial_schema.sql`
- ✅ `002_rls_policies.sql`
- ✅ `003_user_stats_view.sql`

## Step 4: Test the Connection

You can test if everything is working by:

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. The middleware will automatically handle authentication sessions

## What's Been Set Up

### Files Created:

1. **`lib/supabase/client.ts`** - Client-side Supabase client
   - Use this in Client Components and browser code
   - Example: `const supabase = createClient()`

2. **`lib/supabase/server.ts`** - Server-side Supabase client
   - Use this in Server Components, Server Actions, and API routes
   - Example: `const supabase = await createClient()`

3. **`middleware.ts`** - Next.js middleware for auth
   - Automatically refreshes user sessions
   - Handles cookie management

4. **`lib/supabase/auth.ts`** - Authentication helpers
   - `getUser()` - Get current authenticated user
   - `getUserProfile()` - Get current user's profile
   - `signOut()` - Sign out user

5. **`lib/supabase/queries.ts`** - Database query helpers
   - `getTrades()` - Get all trades with ratings
   - `getTradeById()` - Get single trade
   - `createTrade()` - Create new trade
   - `updateTrade()` - Update trade
   - `deleteTrade()` - Delete trade
   - `getUserRankings()` - Get leaderboard
   - `getUserStats()` - Get user statistics
   - `createRating()` - Rate a trade
   - `updateRating()` - Update rating
   - `deleteRating()` - Delete rating

## Next Steps

Now you're ready to:

1. **Create authentication pages:**
   - Sign up page (`/signup`)
   - Sign in page (`/signin`)
   - Profile page (`/profile`)

2. **Build trade features:**
   - Trade submission form
   - Trade feed page
   - Trade detail page

3. **Add ratings:**
   - Rating component
   - Rating display

## Usage Examples

### In a Server Component:
```typescript
import { getUser } from '@/lib/supabase/auth'
import { getTrades } from '@/lib/supabase/queries'

export default async function TradesPage() {
  const user = await getUser()
  const { data: trades } = await getTrades()
  
  return (
    <div>
      {trades?.map(trade => (
        <div key={trade.id}>{trade.asset_pair}</div>
      ))}
    </div>
  )
}
```

### In a Client Component:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])
  
  return <div>{user?.email}</div>
}
```

## Troubleshooting

### "Missing NEXT_PUBLIC_SUPABASE_URL"
- Make sure `.env.local` exists in the project root
- Restart your dev server after creating/updating `.env.local`

### "Row Level Security policy violation"
- Check that you've run `002_rls_policies.sql`
- Verify the user is authenticated if trying to write data

### "Function does not exist"
- Make sure you've run `003_user_stats_view.sql`
- Check that all migrations ran successfully

## Additional Resources

- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

