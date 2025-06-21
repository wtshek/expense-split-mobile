# Expense Splitter - TabView Implementation

## Overview

This React Native application uses Expo Router's built-in tab navigation to create a clean navigation experience for an expense splitting application with three main sections as bottom tabs.

## Tabs Structure

### 1. Input Tab

- **Component**: `InputFormScreen`
- **Purpose**: Handle expense input form
- **Features**:
  - Add expense details
  - Select participants
  - Set amount and category
  - Take photos of receipts

### 2. Stats Tab

- **Component**: `StatsScreen`
- **Purpose**: Display expense statistics and analytics
- **Features**:
  - Total expenses overview
  - Category breakdowns
  - Monthly spending trends
  - Visual charts and graphs

### 3. Split Tab

- **Component**: `SplitScreen`
- **Purpose**: Show expense splitting calculations
- **Features**:
  - Who owes what
  - Split calculations
  - Payment tracking
  - Settlement suggestions

## Technical Implementation

### Dependencies

- `expo-router`: File-based routing with built-in tab navigation
- `@react-navigation/bottom-tabs`: Bottom tab navigation (included with Expo Router)
- `react-native-safe-area-context`: Safe area handling

### File Structure

```
├── app/
│   └── (tabs)/
│       ├── _layout.tsx              # Main tab layout (Input/Stats/Split)
│       ├── index.tsx                # Input tab screen
│       ├── stats.tsx                # Stats tab screen
│       └── split.tsx                # Split tab screen
├── components/
│   ├── InputFormScreen.tsx          # Input tab component
│   ├── StatsScreen.tsx              # Stats tab component
│   └── SplitScreen.tsx              # Split tab component
└── TabView-Implementation.md        # This documentation
```

### Key Features

- **Custom Tab Bar**: Styled with iOS-inspired design
- **Smooth Transitions**: Native performance with react-native-tab-view
- **Responsive Design**: Adapts to different screen sizes
- **Modern UI**: Clean, minimal interface with proper spacing and typography
- **TypeScript Support**: Full type safety throughout the application

### Styling

- Uses a clean, modern design language
- iOS-inspired tab bar with custom styling
- Consistent color scheme (#007AFF for active states)
- Proper shadows and elevation for depth
- Responsive layout that works on all devices

## Next Steps

Each placeholder component can be expanded with:

- Form inputs and validation (Input tab)
- Charts and data visualization (Stats tab)
- Complex calculations and payment tracking (Split tab)
- Integration with backend services
- Local storage for offline functionality
