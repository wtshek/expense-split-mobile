# Environment Variables Setup

## Create your `.env` file

Create a `.env` file in your project root with the following content:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://aydqdyxvntqpsyrpfhyp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZHFkeXh2bnRxcHN5cnBmaHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDg3NTcsImV4cCI6MjA2NjEyNDc1N30.GjRQFLfQulqrojTTe-NDFhk2k90Cfu1kylP5q13CXpc
```

## Important Security Notes

- ✅ **EXPO*PUBLIC*** prefix is required for Expo to expose these variables to your app
- ✅ The anon key shown above is safe to use in client-side code when RLS is properly configured
- ❌ **NEVER** use your `service_role` key in client-side code
- ❌ **NEVER** commit your `.env` file to version control

## Verification

After creating your `.env` file, restart your development server:

```bash
npm start
# or
npx expo start
```

The app will now use environment variables instead of hardcoded values. If you see an error about missing environment variables, double-check that:

1. Your `.env` file is in the project root
2. The variable names match exactly (including the `EXPO_PUBLIC_` prefix)
3. You've restarted your development server

## .gitignore

Make sure your `.env` file is listed in your `.gitignore` to prevent committing sensitive data:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```
