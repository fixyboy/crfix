# Authentication Testing Guide

## Prerequisites

Before testing, make sure:
1. ✅ Your Supabase project is set up
2. ✅ Database migrations have been run
3. ✅ Your `.env.local` file has the correct credentials
4. ✅ Your dev server is running (`npm run dev`)

## Important: Email Confirmation

By default, Supabase requires email confirmation for new signups. For testing, you have two options:

### Option 1: Disable Email Confirmation (Recommended for Development)
1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, toggle off **"Enable email confirmations"**
4. Save changes

This allows you to sign in immediately after signup without email verification.

### Option 2: Use Email Confirmation
- After signing up, check your email for the confirmation link
- Click the link to verify your account
- Then sign in

## Testing Steps

### 1. Test Sign Up

1. Navigate to: `http://localhost:3000/signup`
2. Fill in the form:
   - **Username**: `testuser` (3-20 chars, letters/numbers/underscores only)
   - **Email**: `test@example.com` (use a real email if email confirmation is enabled)
   - **Password**: `password123` (at least 6 characters)
3. Click **"Sign Up"**
4. You should see:
   - Success message (if email confirmation is disabled)
   - Redirect to sign in page with success message
   - OR email confirmation message (if email confirmation is enabled)

### 2. Test Sign In

1. Navigate to: `http://localhost:3000/signin`
2. Enter your credentials:
   - **Email**: The email you used to sign up
   - **Password**: Your password
3. Click **"Sign In"**
4. You should:
   - Be redirected to the home page (`/`)
   - See your username in the header (top right)
   - See a user menu dropdown when clicking your avatar

### 3. Test User Menu

1. While signed in, click on your avatar/username in the header
2. You should see a dropdown menu with:
   - **View Profile** (links to your profile page)
   - **Settings** (links to settings page - not built yet)
   - **Sign Out** (signs you out)

### 4. Test Sign Out

1. Click on your avatar/username
2. Click **"Sign Out"**
3. You should:
   - Be redirected to the home page
   - See "Sign In" and "Get Started" buttons in the header
   - No longer see your username

### 5. Test Protected Navigation

1. While signed in, check the header navigation:
   - **Feed** link should be visible
   - **Rankings** link should be visible
   - **Profile** link should be visible (only when signed in)

2. While signed out:
   - **Profile** link should NOT be visible
   - Only **Feed** and **Rankings** should be visible

## Testing Edge Cases

### Invalid Username
- Try: `ab` (too short) → Should show error
- Try: `user@name` (invalid characters) → Should show error
- Try: `verylongusernamethatexceeds20characters` (too long) → Should show error

### Invalid Email
- Try: `notanemail` → Browser validation should catch this
- Try: `test@` → Browser validation should catch this

### Invalid Password
- Try: `12345` (too short) → Should show error
- Try: `pass` (too short) → Should show error

### Duplicate Username/Email
- Sign up with `testuser` and `test@example.com`
- Try to sign up again with the same username → Should show error
- Try to sign up again with the same email → Should show error

### Wrong Credentials
- Try signing in with wrong password → Should show error
- Try signing in with non-existent email → Should show error

## Verify Database

After signing up, you can verify in Supabase:

1. Go to **Authentication** → **Users**
   - You should see your new user
   - Email should be verified (if email confirmation is disabled)

2. Go to **Table Editor** → **profiles**
   - You should see a new profile row
   - `id` should match the user's ID
   - `username` should match what you entered

## Troubleshooting

### "User already registered"
- The email is already in use
- Try a different email or delete the user from Supabase dashboard

### "Invalid login credentials"
- Check your email and password
- Make sure email is verified (if email confirmation is enabled)

### "Username already taken"
- The username is already in use
- Try a different username

### Profile not created
- Check Supabase logs for trigger errors
- Verify the `handle_new_user()` trigger exists in your database

### Header not updating after sign in
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

## Next Steps After Testing

Once authentication is working:
1. ✅ Test creating a trade (when trade submission is built)
2. ✅ Test viewing your profile
3. ✅ Test the rankings page
4. ✅ Test rating trades

## Quick Test Checklist

- [ ] Can sign up with valid credentials
- [ ] Can sign in with correct credentials
- [ ] Cannot sign in with wrong credentials
- [ ] Username validation works
- [ ] Password validation works
- [ ] Header shows username when signed in
- [ ] Header shows "Sign In" when signed out
- [ ] User menu dropdown works
- [ ] Sign out works
- [ ] Profile is created in database
- [ ] Navigation links show/hide correctly

