# PCA Integration Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────┘

1. USER CLICKS "COLORS" IN NAVBAR
   │
   ├─→ Routes to /pca
   │
   └─→ PCA Onboarding Page Loads

2. WELCOME SCREEN
   │
   ├─→ Explains PCA concept
   ├─→ Shows 3-step process
   └─→ User clicks "Let's Start!"

3. QUIZ (8 Questions)
   │
   ├─→ Q1: Vein color (undertone)
   ├─→ Q2: Jewelry preference
   ├─→ Q3: White shade
   ├─→ Q4: Sun reaction
   ├─→ Q5: Hair color
   ├─→ Q6: Eye color
   ├─→ Q7: Contrast level
   └─→ Q8: Best colors
   │
   └─→ calculateQuizSeason() runs
       │
       ├─→ Warmth score calculated
       ├─→ Brightness score calculated
       ├─→ Season determined
       └─→ Confidence calculated (0-100%)

4. SELFIE CAPTURE
   │
   ├─→ User takes photo with camera
   ├─→ Image converted to base64
   └─→ Quality check performed

5. AI ANALYSIS
   │
   ├─→ analyzePCAImage() called
   │   │
   │   ├─→ Sends to Gemini Vision API
   │   ├─→ Includes quiz results for validation
   │   └─→ Receives JSON response
   │
   └─→ AI analyzes:
       ├─→ Skin undertone (warm/cool)
       ├─→ Contrast level (high/medium/low)
       ├─→ Hair tone (warm/cool/neutral)
       ├─→ Eye color description
       ├─→ Recommended season
       ├─→ Confidence score (0-1)
       └─→ Reasoning explanation

6. RESULTS DISPLAYED
   │
   ├─→ Season name shown
   ├─→ Description displayed
   ├─→ 8 best colors shown (color swatches)
   ├─→ 5 avoid colors shown
   ├─→ Confidence metrics displayed
   └─→ AI reasoning explained

7. PROFILE SAVED
   │
   └─→ savePCAProfile() to IndexedDB
       │
       └─→ Stored in 'pcaProfile' object store

8. USER CONTINUES TO CHAT
   │
   └─→ Fashion Assistant now color-aware!


┌─────────────────────────────────────────────────────────────────┐
│                   DATA FLOW                                     │
└─────────────────────────────────────────────────────────────────┘

Quiz Answers
    │
    ├─→ pcaUtils.ts::calculateQuizSeason()
    │   │
    │   └─→ Returns: { season, confidence, scores }
    │
    └─→ Combined with Selfie
        │
        └─→ gemini.ts::analyzePCAImage()
            │
            ├─→ Gemini Vision API
            │   │
            │   └─→ Returns: {
            │         skinUndertone,
            │         contrastLevel,
            │         recommendedSeason,
            │         confidence,
            │         reasoning,
            │         ...
            │       }
            │
            └─→ Merged with Color Palettes
                │
                └─→ pcaUtils.ts::getSeasonColors()
                    │
                    └─→ Returns: { best: [...], avoid: [...] }
                        │
                        └─→ Complete PCAProfile Object
                            │
                            └─→ db.ts::savePCAProfile()
                                │
                                └─→ IndexedDB Storage


┌─────────────────────────────────────────────────────────────────┐
│              CHAT INTEGRATION FLOW                              │
└─────────────────────────────────────────────────────────────────┘

User Opens Chat
    │
    └─→ ChatInterface.tsx::loadPCAProfile()
        │
        └─→ db.ts::getPCAProfile()
            │
            ├─→ If exists: Load profile
            │   │
            │   └─→ Store in state: setPcaProfile(profile)
            │
            └─→ If not exists: pcaProfile = null

User Sends Message
    │
    └─→ ChatInterface.tsx::handleSend()
        │
        └─→ gemini.ts::getFashionAdvice(
              apiKey,
              closet,
              messages,
              userInput,
              pcaProfile  ← PCA data passed here
            )
            │
            └─→ System Prompt Generated:
                │
                ├─→ Fashion Knowledge (existing)
                ├─→ User's Closet (existing)
                │
                └─→ PCA Context (NEW!):
                    │
                    ├─→ "Season: Warm Spring"
                    ├─→ "Undertone: warm"
                    ├─→ "Contrast: high"
                    ├─→ "Best Colors: #FFB347, #FFD700..."
                    ├─→ "Avoid Colors: #000000, #2F4F4F..."
                    │
                    └─→ "IMPORTANT: Prioritize best colors!"
                        │
                        └─→ Gemini AI Response
                            │
                            └─→ Color-Aware Outfit Suggestions!


┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────┘

IndexedDB: clothing-closet-v2
│
├─ items (Object Store)
│  ├─ key: id (auto-increment)
│  ├─ indexes: by-category, by-brand, by-size
│  └─ value: ClothingItem
│
├─ conversations (Object Store)
│  ├─ key: id (auto-increment)
│  ├─ indexes: by-updated
│  └─ value: Conversation
│
├─ plannedOutfits (Object Store)
│  ├─ key: id (auto-increment)
│  ├─ indexes: by-date
│  └─ value: PlannedOutfit
│
└─ pcaProfile (Object Store) ← NEW in v2!
   ├─ key: id (auto-increment)
   └─ value: PCAProfile {
        id: number,
        quizSeason: ColorSeason,
        quizConfidence: number,
        quizAnswers: Record<string, string>,
        selfieDataUrl: string,
        skinUndertone: 'warm' | 'cool',
        skinUndertoneConfidence: number,
        contrastLevel: 'high' | 'medium' | 'low',
        hairTone: 'warm' | 'cool' | 'neutral',
        eyeColor: string,
        recommendedSeason: ColorSeason,
        confidence: number,
        reasoning: string,
        agreesWithQuiz: boolean,
        bestColors: string[],
        avoidColors: string[],
        createdAt: number,
        updatedAt: number
      }


┌─────────────────────────────────────────────────────────────────┐
│                  COLOR SEASON MATRIX                            │
└─────────────────────────────────────────────────────────────────┘

                    BRIGHT/CLEAR
                         │
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │   WARM SPRING  │  COOL WINTER   │
        │                │                │
        │  • Warm tone   │  • Cool tone   │
        │  • Bright      │  • Bright      │
        │  • Clear       │  • High contrast│
        │                │                │
WARM ───┼────────────────┼────────────────┼─── COOL
        │                │                │
        │  WARM AUTUMN   │  COOL SUMMER   │
        │                │                │
        │  • Warm tone   │  • Cool tone   │
        │  • Muted       │  • Muted       │
        │  • Rich        │  • Soft        │
        │                │                │
        └────────────────┼────────────────┘
                         │
                         │
                    MUTED/SOFT


┌─────────────────────────────────────────────────────────────────┐
│                  FILE STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────┘

src/
├── app/
│   ├── pca/
│   │   └── page.tsx ..................... PCA Onboarding UI
│   └── globals.css ...................... Animations
│
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx ............ Loads PCA profile
│   └── ui/
│       └── Navbar.tsx ................... PCA navigation link
│
└── lib/
    ├── db.ts ............................ PCAProfile schema & CRUD
    ├── gemini.ts ........................ AI analysis & chat integration
    └── pcaUtils.ts ...................... Quiz logic & color palettes

docs/
├── PCA_FEATURE_DOCUMENTATION.md ......... Technical docs
├── PCA_IMPLEMENTATION_SUMMARY.md ........ Quick reference
├── PCA_COMPLETE.md ...................... User guide
└── PCA_ARCHITECTURE.md .................. This file!


┌─────────────────────────────────────────────────────────────────┐
│                  API INTEGRATION                                │
└─────────────────────────────────────────────────────────────────┘

Gemini Vision API Call:

POST https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent

Headers:
  Content-Type: application/json

Body:
  {
    "contents": [{
      "parts": [
        {
          "text": "You are an expert in Korean PCA..."
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "<base64_selfie>"
          }
        }
      ]
    }]
  }

Response:
  {
    "candidates": [{
      "content": {
        "parts": [{
          "text": "{
            \"skinUndertone\": \"warm\",
            \"contrastLevel\": \"high\",
            \"recommendedSeason\": \"warm_spring\",
            \"confidence\": 0.87,
            ...
          }"
        }]
      }
    }]
  }


┌─────────────────────────────────────────────────────────────────┐
│                  SCORING ALGORITHM                              │
└─────────────────────────────────────────────────────────────────┘

Quiz Scoring Logic:

warmth = 0
brightness = 0

For each question:
  Q1 (Veins):
    green → warmth += 2
    blue → warmth -= 2
    both → no change
  
  Q2 (Jewelry):
    gold → warmth += 2
    silver → warmth -= 2
    both → no change
  
  Q3 (White):
    ivory → warmth += 1
    pure → warmth -= 1
    unsure → no change
  
  Q4 (Sun):
    tan → warmth += 1, brightness += 1
    burn_tan → no change
    burn → warmth -= 1, brightness -= 1
  
  Q5 (Hair):
    golden → warmth += 2
    ash → warmth -= 2
    black → brightness += 1
    medium → no change
  
  Q6 (Eyes):
    warm_brown → warmth += 1
    cool_blue → warmth -= 1
    dark → brightness += 1
    green → no change
  
  Q7 (Contrast):
    high → brightness += 2
    low → brightness -= 2
    medium → no change
  
  Q8 (Colors):
    warm_bright → warmth += 2, brightness += 2
    cool_soft → warmth -= 2, brightness -= 2
    warm_rich → warmth += 2, brightness -= 2
    cool_bright → warmth -= 2, brightness += 2

Season Determination:
  if (warmth > 0 && brightness > 0) → Warm Spring
  if (warmth < 0 && brightness < 0) → Cool Summer
  if (warmth > 0 && brightness < 0) → Warm Autumn
  if (warmth < 0 && brightness > 0) → Cool Winter
  
  Tie-breaker: Use strongest signal

Confidence:
  maxScore = totalQuestions × 2
  actualScore = |warmth| + |brightness|
  confidence = (actualScore / maxScore) × 100


┌─────────────────────────────────────────────────────────────────┐
│                  SUCCESS METRICS                                │
└─────────────────────────────────────────────────────────────────┘

✅ 8 Quiz Questions
✅ 4 Color Seasons
✅ 32 Best Colors (8 per season)
✅ 20 Avoid Colors (5 per season)
✅ Gemini Vision AI Integration
✅ IndexedDB Persistence
✅ Chat Integration
✅ Mobile-Responsive UI
✅ Smooth Animations
✅ Comprehensive Documentation

Total Lines of Code: ~1,200
Files Created: 4
Files Modified: 6
Database Version: v2
API: Gemini 2.5 Flash Vision
