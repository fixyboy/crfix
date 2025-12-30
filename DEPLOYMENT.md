# Deployment Guide for Vercel

## Prerequisites

1. ✅ All database migrations have been run in Supabase
2. ✅ Your code is pushed to GitHub
3. ✅ You have a Vercel account

## Step 1: Set Environment Variables in Vercel

**This is the most important step!** Without these, your app will fail to build or run.

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following two variables:

### Required Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Where to find these values:**
- Go to your Supabase project: https://app.supabase.com
- Navigate to **Settings** → **API**
- Copy the **Project URL** and **anon public** key

### Important Notes:
- ✅ Make sure to add these for **Production**, **Preview**, and **Development** environments
- ✅ The values should NOT contain quotes
- ✅ Do NOT include `your-project-url` or `your-anon-key` - use actual values
- ✅ After adding variables, you may need to trigger a new deployment

## Step 2: Verify Database Migrations

Make sure you've run ALL migrations in Supabase SQL Editor:

1. ✅ `001_initial_schema.sql` - Creates tables (profiles, trades, ratings)
2. ✅ `002_rls_policies.sql` - Sets up Row Level Security
3. ✅ `003_user_stats_view.sql` - Creates views and functions
4. ✅ `004_social_features.sql` - Creates likes and comments tables
5. ✅ `005_social_rls.sql` - Sets up RLS for social features

## Step 3: Deploy

1. Push your code to GitHub (if not already done)
2. In Vercel, go to **Deployments**
3. Click **Redeploy** on the latest deployment (or create a new one)
4. Watch the build logs for any errors

## Common Build Errors and Solutions

### Error: "Missing Supabase environment variables"
**Solution:** Make sure you've added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables.

### Error: "Environment variables still contain placeholder values"
**Solution:** Check that your environment variables in Vercel don't contain `your-project-url` or `your-anon-key`. They should contain actual Supabase credentials.

### Error: TypeScript compilation errors
**Solution:** Run `npm run build` locally first to catch any TypeScript errors before deploying.

### Error: Module not found
**Solution:** Make sure all dependencies are listed in `package.json` and committed to git.

## Step 4: Test Your Deployment

After successful deployment:

1. Visit your Vercel URL
2. Test sign up / sign in
3. Test creating a trade
4. Test liking and commenting
5. Check that all pages load correctly

## Troubleshooting

### Build succeeds but app doesn't work
- Check browser console for errors
- Verify environment variables are set correctly
- Check Supabase logs for database errors

### Authentication not working
- Verify Supabase URL and key are correct
- Check that email confirmation is configured correctly in Supabase
- Verify RLS policies are set up

### Database errors
- Make sure all migrations have been run
- Check Supabase logs for specific error messages
- Verify table names match your queries

## Need Help?

If you encounter errors:
1. Check the full build log in Vercel
2. Check browser console for runtime errors
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly

