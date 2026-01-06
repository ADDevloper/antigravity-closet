import { ClothingItem, Outfit, getUserPreferences, UserProfile } from './db';
import { ClosetSnapshot, createGapAnalysisPrompt } from './gapAnalysis';
import { FASHION_KNOWLEDGE } from './fashionKnowledge';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const VERTEX_PROJECT_ID = process.env.NEXT_PUBLIC_VERTEX_PROJECT_ID || '';
const VERTEX_LOCATION = process.env.NEXT_PUBLIC_VERTEX_LOCATION || 'us-central1';

// Native Gemini File Search URIs (Uploaded Knowledge Bases)
// Update these URIs whenever you run `node src/scripts/upload-knowledge.js`
const GLOBAL_KNOWLEDGE_URI = 'https://generativelanguage.googleapis.com/v1beta/files/etkj0ok086b7';
const INDIAN_KNOWLEDGE_URI = 'https://generativelanguage.googleapis.com/v1beta/files/xzld3llnjcmk';

// Use v1beta for native File API support
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
export async function analyzeClothingImage(apiKey: string = API_KEY, base64Image: string) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
    Analyze this clothing item and return a JSON object with:
    - category: (choose from: shirt, pants, dress, shoes, jacket, accessories, skirt, sweater, activewear)
    - colors: array of main colors
    - suggestedOccasions: array (choose from: casual, formal, business, party, gym, beach, date night, everyday)
    - suggestedSeasons: array (choose from: spring, summer, fall, winter, all-season)
    - brand: detected brand (or null if not clearly visible)

    Be very specific about seasons based on fabric and style.
    Return ONLY the JSON.
  `;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64Image.split(',')[1]
                    }
                }
            ]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error:', response.status, errorText);

            // If Google AI Studio fails, try Vertex AI
            if (VERTEX_PROJECT_ID) {
                console.log('Trying Vertex AI endpoint...');
                return await analyzeClothingImageVertex(base64Image);
            }

            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        try {
            const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gemini response', text);
            return null;
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return null;
    }
}

// Vertex AI implementation (requires OAuth or service account)
async function analyzeClothingImageVertex(base64Image: string) {
    // Note: Vertex AI requires proper authentication which is complex in browser
    // This is a placeholder showing the endpoint structure
    const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/gemini-1.5-flash:generateContent`;

    console.warn('Vertex AI requires service account authentication which cannot be done securely from the browser.');
    console.warn('Please use Google AI Studio API key instead, or implement a backend proxy.');

    return null;
}

export async function getFashionAdvice(
    apiKey: string = API_KEY,
    closet: ClothingItem[],
    history: { role: 'user' | 'assistant'; content: string }[],
    userInput: string,
    pcaProfile?: any, // PCAProfile from db.ts
    userProfile?: UserProfile | null
) {
    const url = `${BASE_URL}/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const closetContext = closet.map(item => ({
        id: item.id,
        category: item.category,
        colors: item.colors,
        occasions: item.occasions,
        seasons: item.seasons,
        brand: item.brand,
    }));

    // Build PCA context if available
    let pcaContext = '';
    if (pcaProfile) {
        const seasonNames: Record<string, string> = {
            warm_spring: 'Warm Spring',
            cool_summer: 'Cool Summer',
            warm_autumn: 'Warm Autumn',
            cool_winter: 'Cool Winter'
        };

        pcaContext = `
    ═══════════════════════════════════════════════════════════════════════════════
    ## USER'S PERSONAL COLOR ANALYSIS (PCA)
    ═══════════════════════════════════════════════════════════════════════════════
    Season: ${seasonNames[pcaProfile.recommendedSeason] || pcaProfile.recommendedSeason}
    Skin Undertone: ${pcaProfile.skinUndertone}
    Contrast Level: ${pcaProfile.contrastLevel}
    
    BEST COLORS (prioritize these in outfit suggestions):
    ${pcaProfile.bestColors?.join(', ') || 'N/A'}
    
    COLORS TO AVOID:
    ${pcaProfile.avoidColors?.join(', ') || 'N/A'}
    
    **IMPORTANT**: When suggesting outfits, ALWAYS prioritize items that match the user's best colors. 
    Explain how the colors complement their ${pcaProfile.skinUndertone} undertones and ${pcaProfile.contrastLevel} contrast.
    If suggesting items in their "avoid" colors, warn them gently and suggest alternatives.
        `;
    }

    // Build Learning Context
    const prefs = await getUserPreferences();
    const likedColors = Object.entries(prefs.colorStats).filter(([_, s]) => s > 0).map(([c]) => c);
    const dislikedColors = Object.entries(prefs.colorStats).filter(([_, s]) => s < 0).map(([c]) => c);
    const likedCombos = Object.entries(prefs.combinationStats).filter(([_, s]) => s > 0).map(([c]) => c);
    const dislikedCombos = Object.entries(prefs.combinationStats).filter(([_, s]) => s < 0).map(([c]) => c);

    const prefContext = `
    ═══════════════════════════════════════════════════════════════════════════════
    ## USER FEEDBACK & LEARNT PREFERENCES
    ═══════════════════════════════════════════════════════════════════════════════
    - LIKED COLORS: ${likedColors.join(', ') || 'N/A'}
    - DISLIKED COLORS (AVOID): ${dislikedColors.join(', ') || 'N/A'}
    - LIKED CATEGORY COMBOS: ${likedCombos.join(', ') || 'N/A'}
    - DISLIKED CATEGORY COMBOS (AVOID): ${dislikedCombos.join(', ') || 'N/A'}

    **INSTRUCTION**: Prioritize items and combinations the user likes. Avoid disliked ones. 
    Actively mention insights like "I noticed you prefer ${likedColors[0] || 'certain colors'}..." when relevant.
    `;

    // Build User Profile Context
    let userProfileContext = '';
    if (userProfile) {
        userProfileContext = `
    ═══════════════════════════════════════════════════════════════════════════════
    ## USER STYLE IDENTITY & LIFESTYLE
    ═══════════════════════════════════════════════════════════════════════════════
    Gender/Style Base: ${userProfile.gender || 'Not specified'}
    Bio/Style Vibe: ${userProfile.bio || 'Not specified'}
    
    LIFESTYLE MIX:
    - Work: ${userProfile.lifestyle?.work || 0}%
    - Casual: ${userProfile.lifestyle?.casual || 0}%
    - Athletic: ${userProfile.lifestyle?.athletic || 0}%
    - Social: ${userProfile.lifestyle?.social || 0}%

    **CRITICAL INSTRUCTION**: You MUST suggest outfits that match the user's Gender (${userProfile.gender}). 
    If the user is Male, do NOT suggest dresses, skirts, or high heels unless explicitly asked.
    Align your suggestions with their Lifestyle Mix (e.g., if Work is high, suggest more professional attire).
        `;
    }

    const systemPrompt = `
    You are "Closet AI", a professional personal fashion stylist and expert in both GLOBAL and INDIAN ethnic fashion.
    
    PERSONA:
    - Casual, warm, encouraging (like a fashion-savvy friend)
    - Enthusiastic but not pushy
    - Supportive, never judgmental
    - Educational: teach color principles while styling
    - **EXTREMELY CONCISE**: You value brevity.

    **KNOWLEDGE BASES**: You have access to TWO Fashion Knowledge Base files:
    1. **Global Fashion Knowledge**: Covers core color theory, body types, and Western style rules.
    2. **Indian Fashion Knowledge**: Covers Indian ethnic wear, festive styling, and traditional draping/combinations.
    
    Use BOTH to provide accurate, culturally relevant styling advice.

    ═══════════════════════════════════════════════════════════════════════════════
    ## USER'S DIGITAL CLOSET, PREFERENCES & IDENTITY
    ═══════════════════════════════════════════════════════════════════════════════
    ${JSON.stringify(closetContext, null, 2)}
    ${pcaContext}
    ${prefContext}
    ${userProfileContext}

    ═══════════════════════════════════════════════════════════════════════════════
    ## YOUR TASK & RULES
    ═══════════════════════════════════════════════════════════════════════════════

    1. **STRICT LENGTH LIMIT**: You MUST answer the text part in maximum 3-4 sentences. The JSON tags ([OUTFIT] and [RECO]) do NOT count towards this limit.

    2. **Use Both Knowledge Files**: Search and apply principles from both the Global and Indian fashion files.
    
    3. **Briefly Explain Why**: Quickly mention reasoning (color theory, cultural context, or PCA) in 1 small sentence.
    
    4. **Only Use User's Closet**: Suggest items from their closet ID list.
    
    5. **Visual Outfit Card (MANDATORY)**: Whenever you suggest a combination of items from the closet, you MUST include the Outfit card using this exact format:
       [OUTFIT: {"name": "...", "description": "...", "itemIds": [...], "stylingTips": ["..."]}]
    
    6. **Shopping Recommendation Card (OPTIONAL)**: If a key piece is missing to complete the look, suggest it in addition to the Outfit card:
       [RECO: {"itemName": "...", "reason": "...", "colorSuggestion": "...", "searchQuery": "..."}]
       
       **CRITICAL SHOPPING RECOMMENDATION RULES**:
       - Only recommend if there's a REAL gap (e.g., user has 0 blazers but 40% Work lifestyle)
       - Be SPECIFIC: Instead of "blazer", say "navy blue cotton blazer for men" or "beige linen blazer for women"
       - Match their GENDER: Check userProfile.gender before recommending
       - Use PCA colors: Recommend items in their bestColors palette
       - Consider LIFESTYLE: If Work=60%, prioritize professional items. If Athletic=50%, suggest activewear
       - searchQuery should be detailed for Amazon: Include gender, color, material, and category
       - Example good searchQuery: "olive green casual shirt for men cotton" NOT just "shirt"
       
       **When to recommend**:
       - User asks for outfit but is missing a category (e.g., no formal shoes for a wedding outfit)
       - Wardrobe gap analysis shows imbalance (e.g., 5 tops but 0 bottoms)
       - User's lifestyle doesn't match their closet (e.g., 70% Work lifestyle but only casual clothes)
       
       *You can and should output BOTH an [OUTFIT] and a [RECO] in the same response if clothes from the closet are mentioned.*

    7. **Encourage Mixed Styling**: Feel free to suggest "Indo-Western" looks if appropriate.

    Current user request: ${userInput}
  `;

    const contents = history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
    }));

    // Add the files and the system prompt
    contents.push({
        role: 'user',
        parts: [
            {
                file_data: {
                    mime_type: 'text/plain',
                    file_uri: GLOBAL_KNOWLEDGE_URI
                }
            },
            {
                file_data: {
                    mime_type: 'application/pdf',
                    file_uri: INDIAN_KNOWLEDGE_URI
                }
            },
            { text: systemPrompt }
        ]
    } as any);

    const requestBody: any = {
        contents: contents
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error:', response.status, errorText);
            console.error('Full error response:', errorText);

            // Try to parse error for better messaging
            try {
                const errorJson = JSON.parse(errorText);
                const errorMessage = errorJson.error?.message || errorText;
                throw new Error(`Gemini API Error: ${errorMessage}`);
            } catch {
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract outfits and recommendations from text
        const outfits: Outfit[] = [];
        const recommendations: any[] = [];
        const outfitRegex = /\[OUTFIT: (\{.*?\})\]/g;
        const recoRegex = /\[RECO: (\{.*?\})\]/g;
        let match;
        let cleanText = text;

        while ((match = outfitRegex.exec(text)) !== null) {
            try {
                const outfitData = JSON.parse(match[1]);
                outfits.push({
                    ...outfitData,
                    id: Math.random().toString(36).substr(2, 9),
                });
                cleanText = cleanText.replace(match[0], '');
            } catch (e) {
                console.error('Failed to parse outfit', match[1]);
            }
        }

        while ((match = recoRegex.exec(text)) !== null) {
            try {
                const recoData = JSON.parse(match[1]);
                recommendations.push({
                    ...recoData,
                    id: Math.random().toString(36).substr(2, 9),
                });
                cleanText = cleanText.replace(match[0], '');
            } catch (e) {
                console.error('Failed to parse recommendation', match[1]);
            }
        }

        return {
            content: cleanText.trim(),
            outfits,
            recommendations
        };
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

// Personal Color Analysis using Gemini Vision
export async function analyzePCAImage(
    apiKey: string = API_KEY,
    base64Image: string,
    quizSeason: string,
    quizConfidence: number
) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert in Korean Personal Color Analysis (PCA). Analyze this selfie to determine the person's color season.

QUIZ RESULTS (for hybrid validation):
The person's quiz suggested they are: ${quizSeason}
Quiz confidence: ${quizConfidence}%

Your task: Analyze the photo and provide detailed color analysis.

OUTPUT FORMAT (JSON only, no markdown):
{
  "skinUndertone": "warm" or "cool",
  "skinUndertoneConfidence": 0.0 to 1.0,
  "veinAppearance": "description",
  "contrastLevel": "high", "medium", or "low",
  "hairTone": "warm", "cool", or "neutral",
  "eyeColor": "description",
  "recommendedSeason": "warm_spring", "cool_summer", "warm_autumn", or "cool_winter",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation",
  "agreesWithQuiz": true or false
}

ANALYSIS GUIDELINES:
- Skin undertone: Golden/peachy = warm, Pink/bluish = cool
- Contrast: High contrast = bright season, Low = muted
- Hair tone: Golden/red = warm, Ash/gray = cool
- Eye color: Warm browns/hazels = warm, Gray/cool blue = cool

SEASONS:
- warm_spring: warm undertones + bright/clear coloring
- cool_summer: cool undertones + soft/muted coloring
- warm_autumn: warm undertones + rich/muted coloring
- cool_winter: cool undertones + bright/clear coloring

Return ONLY valid JSON, no markdown formatting.`;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64Image.split(',')[1]
                    }
                }
            ]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini PCA API Error:', response.status, errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        try {
            const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gemini PCA response', text);
            return null;
        }
    } catch (error) {
        console.error('Error calling Gemini PCA API:', error);
        throw error;
    }
}

export async function performGapAnalysis(
    snapshot: ClosetSnapshot,
    profile: UserProfile,
    apiKey: string = API_KEY
) {
    const url = `${BASE_URL}/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = createGapAnalysisPrompt(snapshot, profile);

    const contents = [
        {
            role: 'user',
            parts: [
                {
                    file_data: {
                        mime_type: 'text/plain',
                        file_uri: GLOBAL_KNOWLEDGE_URI
                    }
                },
                { text: prompt }
            ]
        }
    ];

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        try {
            const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gap Analysis response', text);
            return null;
        }
    } catch (error) {
        console.error('Error in performGapAnalysis:', error);
        throw error;
    }
}
