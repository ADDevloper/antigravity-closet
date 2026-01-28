# Desktop Layout Redesign - Task List

## Overview
Redesign the navigation from horizontal (bottom nav) to vertical (sidebar) for desktop, while merging Home + Assistant into a single "Stylist Chat" landing page.

## Navigation Structure
- **Stylist Chat** (landing) - Merged Home + Assistant
- **My Wardrobe** - Current Closet page
- **Daily Outfits** - Current Calendar/Outfit Planner
- **Dashboard** - Current Me/Profile page

---

## Task Breakdown

### Phase 1: Component Architecture ✅
- [x] **Task 1.1**: Create `DesktopSidebar.tsx` component
  - Vertical navigation with icons and labels
  - Active state styling
  - Responsive (hidden on mobile <1024px)
  
- [x] **Task 1.2**: Update `BottomNav.tsx` component
  - Remove "Home" and "Assistant" tabs
  - Add "Stylist Chat" tab
  - Update navigation links
  - Hidden on desktop (≥1024px)

- [x] **Task 1.3**: Create `AppLayout.tsx` wrapper component
  - Conditionally renders DesktopSidebar or BottomNav
  - Handles responsive breakpoints
  - Manages layout structure

### Phase 2: Page Consolidation ✅
- [x] **Task 2.1**: Create new `StylistChat.tsx` page
  - Hero section: "Hello, Style Icon" with sparkle icon
  - Subheading: "I've analyzed your closet. What are we styling today?"
  - Quick action cards (2x2 grid on desktop, stacked on mobile):
    - "What should I wear today?"
    - "Create an outfit for [occasion]"
    - "Analyze my wardrobe"
    - "Style a specific item"
  - AI chat interface below
  - Combine functionality from current Home and Assistant pages

- [x] **Task 2.2**: Update routing in `App.tsx` or routing config
  - Set `/` (root) to new StylistChat page
  - Remove `/home` and `/assistant` routes (or redirect to `/`)
  - Keep `/wardrobe`, `/outfits`, `/dashboard` routes
  - Update any internal navigation links

### Phase 3: Styling & Responsiveness ✅
- [x] **Task 3.1**: Update global layout styles
  - Add sidebar width variable (e.g., 240px)
  - Adjust main content area padding for desktop
  - Ensure proper spacing and alignment

- [x] **Task 3.2**: Implement responsive breakpoints
  - Mobile (<1024px): Bottom nav, full-width content
  - Desktop (≥1024px): Sidebar + main content area
  - Test tablet sizes (768px-1024px)

- [x] **Task 3.3**: Style DesktopSidebar
  - Match reference design aesthetic
  - Purple accent for active state
  - Smooth hover effects
  - Proper icon sizing and spacing

- [x] **Task 3.4**: Style StylistChat page
  - Hero section typography and spacing
  - Quick action cards with hover effects
  - Chat interface positioning
  - Responsive grid for action cards

### Phase 4: Feature Integration ✅
- [x] **Task 4.1**: Add wardrobe upload to My Wardrobe page
  - Upload button in wardrobe view
  - Maintain existing onboarding upload flow
  - Ensure both paths work correctly

- [x] **Task 4.2**: Implement quick action card functionality
  - Click handlers for each card
  - Pre-populate chat with relevant prompts
  - Smooth scroll to chat input

- [x] **Task 4.3**: Update top bar (if needed)
  - "Fashion Assistant" title with online indicator
  - User profile icon
  - Responsive behavior

### Phase 5: Testing & Polish ✅
- [x] **Task 5.1**: Test navigation flow
  - All sidebar links work correctly
  - Bottom nav works on mobile
  - Active states update properly
  - No broken routes

- [x] **Task 5.2**: Test responsive behavior
  - Smooth transition between mobile/desktop layouts
  - No layout breaks at breakpoints
  - Content remains accessible

- [x] **Task 5.3**: Test existing features
  - Wardrobe upload (both locations)
  - Outfit generation
  - Shopping recommendations
  - Profile/settings functionality
  - Calendar/outfit planner

- [x] **Task 5.4**: Visual polish
  - Consistent spacing and alignment
  - Smooth animations/transitions
  - Accessibility (keyboard navigation, ARIA labels)
  - Dark mode compatibility (if applicable)

### Phase 6: Cleanup
- [ ] **Task 6.1**: Remove old Home and Assistant components (if fully merged)
  - Archive or delete unused files
  - Clean up imports

- [ ] **Task 6.2**: Update documentation
  - Update README if needed
  - Document new navigation structure

- [ ] **Task 6.3**: Final review
  - Code review for best practices
  - Performance check
  - Browser compatibility test

---

## Design Reference
- Sidebar navigation (left)
- Clean, spacious layout
- Purple accent color
- Hero section with quick actions
- Bottom-anchored chat input

## Technical Notes
- Breakpoint: 1024px (desktop vs mobile)
- Maintain all existing functionality
- Mobile-first approach, enhanced for desktop
- Use existing design system and components where possible

---

## Success Criteria
✅ Desktop users see vertical sidebar navigation  
✅ Mobile users see updated bottom nav with 4 tabs  
✅ Stylist Chat is the landing page for all users  
✅ All existing features work as before  
✅ Smooth, responsive transitions between layouts  
✅ Visually matches reference design aesthetic  
