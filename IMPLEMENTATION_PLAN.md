# Implementation Plan: Advanced Closet & Batch Processing

## Phase 1: Batch Importing & Advanced Metadata (COMPLETED)
- **Features**: Batch Image Importing, Advanced Metadata Schema (`brand`, `size`, `occasions`), UI Enhancements (Tags, Filter Panel).
- **Fixes**: Robust Database Persistence (`clothing-closet-v2`).

## Phase 2A: The Logic (AI Enhancements & Carousels) (COMPLETED)
- **AI Brain Upgrade**: Updated Gemini prompts to generate structured JSON with `stylingTips` and `outfit` suggestions.
- **Carousel UI**: Implemented horizontally scrolling outfit suggestions in the chat.
- **Enhanced Cards**: Updated `OutfitCard` to display AI-generated styling tips, brand badges, and action buttons ("Schedule", "Wear Now").

## Phase 2B: Calendar & Outfit Planning (COMPLETED)
- **Calendar View**: Interactive monthly grid (`/calendar`) using `date-fns`.
- **Daily Planning**: Date Detail Panel for managing daily outfits.
- **Closet Picker**: specialized modal for selecting multiple items from the closet.
- **Integration**: Seamless flow from Closet -> Calendar.

## Phase 3: Weather Integration & Polish (NEXT)
- **Objectives**:
    - Fetch real-time weather data for the user's location.
    - Display weather icons on the Calendar grid.
    - Use weather context in AI outfit suggestions ("It's raining tomorrow, wear this...").
- **Technical Tasks**:
    - Integrate OpenWeatherMap or similar free API.
    - Add location permission request.
    - Update `CalendarPage` to show weather icons.
