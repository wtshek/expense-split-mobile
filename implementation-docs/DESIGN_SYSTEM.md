# Expense Splitter - Design System & Style Guide

## Overview

This design system is inspired by modern fintech applications, emphasizing clean aesthetics, professional typography, and intuitive user interactions. It provides a consistent visual language across the entire expense splitting application.

## 🎨 Color Palette

### Primary Colors

- **Primary**: `#000000` - Used for primary actions, active states, and emphasis
- **Secondary**: `#374151` - Supporting text and secondary elements
- **Background**: `#FFFFFF` - Main app background
- **Surface**: `#F9FAFB` - Card backgrounds and elevated surfaces

### Text Colors

- **Primary Text**: `#111827` - Main content, headings
- **Secondary Text**: `#374151` - Supporting text, captions, inactive states
- **Tertiary Text**: `#6B7280` - Subtle information, metadata
- **Inverse Text**: `#FFFFFF` - Text on dark backgrounds

### Card Backgrounds

- **Light Card**: `#FFFFFF` - Standard cards with subtle shadows
- **Dark Card**: `#1F2937` - Featured cards, balance displays
- **Border**: `#E5E7EB` - Dividers, input borders

### Accent Colors

- **Accent**: `#3B82F6` - Links, highlights
- **Success**: `#10B981` - Positive actions, completed states
- **Warning**: `#F59E0B` - Attention, pending states
- **Error**: `#EF4444` - Errors, destructive actions

## 📝 Typography

### Hierarchy

```typescript
h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 }    // Large numbers, main headings
h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 }    // Section headings
h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 }    // Card titles
body: { fontSize: 16, fontWeight: '400', lineHeight: 24 }  // Regular text
bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 } // Emphasized text
caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 }    // Supporting text
captionMedium: { fontSize: 14, fontWeight: '500', lineHeight: 20 } // Menu items
small: { fontSize: 12, fontWeight: '400', lineHeight: 16 }       // Metadata
smallMedium: { fontSize: 12, fontWeight: '500', lineHeight: 16 } // Tags, badges
```

### Usage Examples

- **Balance displays**: Use `h1` for large amounts (€ 6,815.53)
- **Section titles**: Use `h3` for "Quick Actions", "Recent Activity"
- **Card content**: Use `body` for descriptions, `caption` for labels
- **Tab labels**: Use `captionMedium` with proper spacing

## 📐 Spacing System

```typescript
xs: 4px    // Fine adjustments, icon gaps
sm: 8px    // Small gaps between related elements
md: 16px   // Standard content padding
lg: 24px   // Section spacing
xl: 32px   // Large section breaks
xxl: 48px  // Major layout divisions
```

### Layout Guidelines

- **Screen padding**: Use `md` (16px) for main content areas
- **Card padding**: Use `lg` (24px) for comfortable reading
- **Element spacing**: Use `sm` (8px) between related items
- **Section breaks**: Use `lg` (24px) between different sections

## 🔲 Border Radius

```typescript
sm: 8px    // Input fields, small buttons
md: 12px   // Cards, larger buttons
lg: 16px   // Modal dialogs, large cards
xl: 24px   // Hero sections, featured content
full: 9999px // Circular elements, pills
```

## 🌟 Shadows & Elevation

### Shadow Levels

```typescript
sm: { shadowOffset: {0, 1}, shadowOpacity: 0.05, shadowRadius: 2 }  // Subtle depth
md: { shadowOffset: {0, 4}, shadowOpacity: 0.1, shadowRadius: 8 }   // Standard cards
lg: { shadowOffset: {0, 8}, shadowOpacity: 0.15, shadowRadius: 16 } // Floating elements
```

### Usage

- **Standard cards**: Use `sm` shadows for gentle elevation
- **Featured cards**: Use `md` shadows for prominence
- **Modals/overlays**: Use `lg` shadows for clear hierarchy

## 🃏 Component Styles

### Cards

```typescript
// Standard Card
card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 20,
  ...shadows.sm
}

// Featured/Dark Card
darkCard: {
  backgroundColor: '#1F2937',
  borderRadius: 12,
  padding: 20,
  ...shadows.md
}
```

### Buttons

```typescript
// Primary Button
button.primary: {
  backgroundColor: '#111827',
  borderRadius: 8,
  paddingHorizontal: 24,
  paddingVertical: 12
}

// Secondary Button
button.secondary: {
  backgroundColor: 'transparent',
  borderRadius: 8,
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB'
}
```

### Input Fields

```typescript
inputField: {
  backgroundColor: '#F9FAFB',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB'
}
```

## 📱 Screen Layouts

### Pattern: Feature Screen

1. **Top section**: Featured card with primary metric/balance
2. **Quick actions**: Grid of action buttons (2x2 or horizontal)
3. **Content sections**: Organized by functionality
4. **Empty states**: Helpful messaging when no content

### Pattern: Card-Based Layout

- Use consistent card spacing (`lg` margin bottom)
- Maintain visual hierarchy with typography
- Group related actions within cards
- Use empty states to guide user behavior

## 🎯 Usage Examples

### Balance Display

```tsx
<View style={AppStyles.darkCard}>
  <Text
    style={[
      AppStyles.typography.caption,
      { color: AppStyles.colors.text.inverse },
    ]}
  >
    Current Balance
  </Text>
  <Text
    style={[AppStyles.typography.h1, { color: AppStyles.colors.text.inverse }]}
  >
    6,815.53
  </Text>
</View>
```

### Action Grid

```tsx
<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
  <TouchableOpacity style={[AppStyles.card, { width: "48%" }]}>
    <Text style={AppStyles.typography.captionMedium}>Add Expense</Text>
  </TouchableOpacity>
</View>
```

### Section with Title

```tsx
<View style={{ marginBottom: AppStyles.spacing.lg }}>
  <Text
    style={[AppStyles.typography.h3, { marginBottom: AppStyles.spacing.md }]}
  >
    Recent Activity
  </Text>
  <View style={AppStyles.card}>{/* Content */}</View>
</View>
```

## 🎨 Tab Bar Styling

### Bottom Navigation

- **Height**: 88px (iOS), 64px (Android)
- **Background**: Pure white with subtle border
- **Active color**: Black (#000000)
- **Inactive color**: Medium gray (#374151) - improved contrast
- **Typography**: Small medium weight (12px, 500)
- **Shadow**: Subtle elevation for depth

## ✅ Best Practices

### Do's

- ✅ Use consistent spacing from the spacing system
- ✅ Apply appropriate typography hierarchy
- ✅ Maintain card-based layouts for organization
- ✅ Use dark cards for featured/important content
- ✅ Include empty states with helpful messaging
- ✅ Apply subtle shadows for depth perception
- ✅ Ensure sufficient color contrast for readability

### Don'ts

- ❌ Mix custom spacing values with system values
- ❌ Use more than 3 typography weights in one screen
- ❌ Create cards without padding or with inconsistent padding
- ❌ Use bright colors for large background areas
- ❌ Skip empty states for data-dependent sections
- ❌ Apply heavy shadows to small elements
- ❌ Use low-contrast text colors that are hard to read

## 🔧 Implementation

### Import the Design System

```tsx
import { AppStyles } from "@/constants/AppStyles";
```

### Apply Styles

```tsx
// Use predefined component styles
<View style={AppStyles.card}>

// Combine with typography
<Text style={[AppStyles.typography.h2, { color: AppStyles.colors.text.primary }]}>

// Apply spacing
<View style={{ marginBottom: AppStyles.spacing.lg }}>
```

### Custom Combinations

```tsx
// Dark card with inverse text
<View style={AppStyles.darkCard}>
  <Text
    style={[
      AppStyles.typography.caption,
      {
        color: AppStyles.colors.text.inverse,
        opacity: 0.8,
      },
    ]}
  >
    Label
  </Text>
</View>
```

This design system ensures consistency across all screens while maintaining the professional, clean aesthetic of modern financial applications with improved readability and contrast.
