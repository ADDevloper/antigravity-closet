# Implementation Plan: Advanced Closet & Batch Processing

## Phase 1: Batch Importing & Advanced Metadata (COMPLETED)

### Features Implemented
1.  **Batch Image Importing**
    - **Multi-File Selection**: Users can now select or drag-and-drop multiple images at once.
    - **Parallel Processing**: AI analysis runs in parallel for all uploaded items.
    - **Progress Tracking**: Individual progress bars show the status (Compressing -> Analyzing -> Complete) for each item.
    - **Queue Management**: Users can remove items from the queue before saving.

2.  **Advanced Metadata Schema**
    - **Database Upgrade**: Migrated to `clothing-closet-v2` to support new fields.
    - **New Fields**: 
        - `brand`: Track clothing brands.
        - `size`: Store size information (XS, S, M, L, XL, etc.).
        - `occasions`: Expanded list (casual, formal, business, party, gym, beach, date night, everyday).
        - `seasons`: More granular season tagging.

3.  **UI Enhancements**
    - **Item Card**: Updated to display brand, size badges, and colorful occasion/season tags.
    - **Filter Panel**: New advanced filtering section in the Closet view to filter by Brand, Size, Occasion, and Season.
    - **Closet Statistics**: Header now displays the total count of items.

4.  **Bug Fixes**
    - **Database Persistence**: Resolved a critical issue where items were not saving to IndexedDB by stabilizing the database initialization logic.

### Verification Results
- **Batch Upload**: Verified successfully with multiple files.
- **AI Analysis**: Confirmed items are correctly categorized and tagged by Gemini.
- **Persistence**: Verified via direct database query that items are saved and counts increment correctly.
- **Filtering**: Confirmed filter dropdowns populate dynamically based on available closet data.

## Phase 2: Calendar & Outfit Planning (NEXT)

### Objectives
1.  **Calendar View**: Implement a monthly/weekly calendar view to plan outfits.
2.  **Outfit Creation**: Allow users to group items into "Outfits" and save them.
3.  **Scheduling**: Enable dragging and dropping outfits onto specific dates.
4.  **Weather Integration**: (Optional) Display weather forecasts on the calendar to aid planning.

### Technical Tasks
- [ ] Create `Outfit` and `PlannedOutfit` components.
- [ ] Implement `Calendar` page using `date-fns`.
- [ ] Add drag-and-drop functionality for scheduling outfits.
- [ ] Integrate weather API for calendar dates.

