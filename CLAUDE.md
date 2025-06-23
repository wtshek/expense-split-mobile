# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo-based React Native application called "Expense Split" - a mobile expense tracking and splitting app with PWA capabilities. The app supports both individual expense tracking and group expense management with Supabase as the backend.

## Key Technologies

- **Framework**: Expo ~53.0.12 with React Native 0.79.4
- **Navigation**: Expo Router with file-based routing
- **Database**: Supabase (PostgreSQL) with TypeScript types
- **Language**: TypeScript with strict mode
- **UI**: React Native with custom components and themed styling
- **State Management**: React hooks and context (no external state library)
- **Package Manager**: pnpm (specified in package.json)

## Development Commands

### Core Development
- `pnpm start` or `npx expo start` - Start development server
- `pnpm run android` - Run on Android emulator
- `pnpm run ios` - Run on iOS simulator  
- `pnpm run web` - Run web version
- `pnpm run lint` - Run ESLint

### PWA & Production
- `pnpm run web:prod` - Export web build for production
- `pnpm run pwa:build` - Build PWA (exports web + optimization)
- `pnpm run pwa:serve` - Serve built PWA locally

### Database & Setup
- `pnpm run init-categories` - Initialize default expense categories (runs TypeScript script)
- `pnpm run reset-project` - Reset to blank project structure

## Architecture Overview

### File Structure
- `app/` - Expo Router file-based routing (main application screens)
  - `(tabs)/` - Tab-based navigation screens (index, split, stats)
  - `_layout.tsx` - Root layout with authentication wrapper
- `components/` - Reusable React components
  - Main screens: `AddExpenseFormScreen`, `SplitScreen`, `StatsScreen`
  - Auth: `AuthWrapper`, `ErrorBoundary`
  - UI components: `ThemedText`, `ThemedView`, custom date picker
- `lib/` - Core configuration (Supabase client setup)
- `types/` - TypeScript type definitions (comprehensive database schema)
- `utils/` - Business logic utilities organized by domain:
  - `auth.ts` - Authentication helpers
  - `expenses.ts` - Expense CRUD operations
  - `groups.ts` - Group management 
  - `profiles.ts` - User profile management
  - `categories.ts` - Expense categories
  - `database.ts` - Common database utilities
  - `pwa.ts` - PWA installation helpers
- `constants/` - App styling and color themes
- `hooks/` - Custom React hooks (theme, color scheme, PWA)

### Database Schema
The app uses Supabase with a well-defined schema including:
- `profiles` - User profiles linked to auth.users
- `expenses` - Individual and group expenses with split details
- `groups` - Expense sharing groups with members
- `categories` - Predefined expense categories
- Split details stored as JSONB supporting equal, percentage, and custom splits

### Authentication Flow
- Uses Supabase Auth with session persistence
- `AuthWrapper` component handles authentication state
- All screens are protected and require authentication
- User profiles are automatically created and managed

### Key Features
- Individual expense tracking with categories
- Group expense creation and management  
- Flexible expense splitting (equal, percentage, custom amounts)
- Statistics and analytics with date filtering
- PWA support with offline capabilities
- Cross-platform (iOS, Android, Web)

## Environment Setup

Required environment variables (set via Expo's environment system):
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development Notes

- Uses Expo's new architecture (`newArchEnabled: true`)
- TypeScript paths configured with `@/*` alias for root imports
- Supports both light and dark themes with automatic detection
- Error boundaries implemented for robust error handling
- Haptic feedback integration for better UX
- Tab navigation with custom styling and backgrounds