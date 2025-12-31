# Personal Color Analysis (PCA) Feature

## Overview
Korean Personal Color Analysis (PCA) helps users discover their seasonal color palette (Warm Spring, Cool Summer, Warm Autumn, or Cool Winter) through a hybrid quiz + AI selfie analysis.

## User Flow

1. **Onboarding (`/pca`)**
   - **Welcome**: Explains the process (3 mins).
   - **Quiz**: 8 questions about veins, jewelry, white preference, sun reaction, etc.
   - **Selfie**: Capture photo in natural light.
   - **Analysis**: Gemini Vision analyzes selfie.
   - **Conflict Check**: 
     - If quiz and photo agree → Results.
     - If they disagree → **Conflict Resolution Screen** (User chooses their preferred result).
   - **Results**: Detailed interactive dashboard.

2. **Results Dashboard**
   - **Hero**: Season confirmation ("You're a Warm Spring! 🌸").
   - **Perfect Colors**: 12 curated colors.
   - **Why These Colors**: AI or preset reasoning about undertones.
   - **Best Neutrals**: 6 foundation colors (cream, camel, etc. vs black/white).
   - **Style Carefully**: 5 colors to avoid or wear strategically.
   - **Quick Tips**: 4 bullet points specific to the season.

## Color Palettes (Korean 4-Season System)

### 🌸 Warm Spring
- **Undertone**: Warm, bright, clear.
- **Best**: Peach (#FFB347), Coral (#FF6B6B), Gold (#FFD700), Aqua (#98D8C8).
- **Neutrals**: Ivory (#FFFAF0), Wheat (#F5DEB3), Camel (#DEB887).
- **Avoid**: Pure Black (#000000), Pure White (#FFFFFF), Cool Purple (#4B0082).
- **Style Tip**: "Gold jewelry is your secret weapon."

### 🌊 Cool Summer
- **Undertone**: Cool, soft, muted.
- **Best**: Powder Blue (#B0E0E6), Lavender (#E6E6FA), Soft Pink (#FFB6C1), Slate (#708090).
- **Neutrals**: Soft White (#F5F5F5), Silver (#C0C0C0), Charcoal (#2F4F4F).
- **Avoid**: Orange (#FF8C00), Gold (#FFD700).
- **Style Tip**: "Gray is your best neutral, not black or brown."

### 🍂 Warm Autumn
- **Undertone**: Warm, rich, earthy.
- **Best**: Rust (#CD5C5C), Olive (#6B8E23), Mustard (#DAA520), Chocolate (#D2691E).
- **Neutrals**: Cream (#FFF8DC), Antique White (#FAEBD7), Coffee (#8B7355).
- **Avoid**: Hot Pink (#FF1493), Cyan (#00FFFF).
- **Style Tip**: "Brown is your black - it's more harmonious."

### ❄️ Cool Winter
- **Undertone**: Cool, bright, high-contrast.
- **Best**: Pure Black (#000000), Pure White (#FFFFFF), Royal Blue (#4169E1), Magenta (#8B008B).
- **Neutrals**: Navy (#000080), Slate (#2F4F4F).
- **Avoid**: Gold (#FFD700), Khaki (#F0E68C).
- **Style Tip**: "High contrast is your signature - embrace it."

## Fashion Assistant Integration

The AI Stylist ("Closet AI") is aware of the user's season and follows these rules:

1.  **In-Palette**: Highlights matching items ("This powder blue blouse is perfect for your Cool Summer palette").
2.  **Out-of-Palette**: Suggests styling hacks ("Wear this orange top with a navy jacket to balance the warmth").
3.  **Wardrobe Gaps**: Suggests shopping items in the user's best neutrals ("A camel blazer would be a versatile addition").
4.  **Tone**: Encouraging, educational, never judgmental.

## Technical Implementation

- **Data**: `src/lib/pcaUtils.ts` stores exact hex codes and text assets.
- **Logic**: `calculateQuizSeason` scores warmth/brightness.
- **AI**: `analyzePCAImage` (Gemini Vision) returns JSON analysis.
- **Storage**: IndexedDB (`pcaProfile` store).
- **Styling**: Tailwind CSS gradients and animations.
