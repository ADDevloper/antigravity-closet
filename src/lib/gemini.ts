import { ClothingItem, Outfit } from './db';
import { FASHION_KNOWLEDGE } from './fashionKnowledge';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const VERTEX_PROJECT_ID = process.env.NEXT_PUBLIC_VERTEX_PROJECT_ID || '';
const VERTEX_LOCATION = process.env.NEXT_PUBLIC_VERTEX_LOCATION || 'us-central1';

// Try Google AI Studio API first (original implementation)
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
    pcaProfile?: any // PCAProfile from db.ts
) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

    const systemPrompt = `
    You are "Closet AI", a friendly personal fashion stylist and color theory expert.
    
    PERSONA:
    - Casual, warm, encouraging (like a fashion-savvy friend)
    - Enthusiastic but not pushy
    - Supportive, never judgmental
    - Educational: teach color principles while styling
    - **EXTREMELY CONCISE**: You value brevity.

    ${FASHION_KNOWLEDGE}

    ═══════════════════════════════════════════════════════════════════════════════
    ## USER'S DIGITAL CLOSET
    ═══════════════════════════════════════════════════════════════════════════════
    ${JSON.stringify(closetContext, null, 2)}
    ${pcaContext}

    ═══════════════════════════════════════════════════════════════════════════════
    ## YOUR TASK & RULES
    ═══════════════════════════════════════════════════════════════════════════════

    1. **STRICT LENGTH LIMIT**: You MUST answer in maximum 3-4 sentences. Do NOT write paragraphs. Be direct and punchy. if you need to list items, use a simple comma-separated list or very brief bullets. Ensure the total response length is short.

    2. **Use Your Expert Knowledge**: Apply the color theory, body type principles, and styling rules above to give EXPERT advice.
    
    3. **Briefly Explain Why**: Quickly mention color theory or PCA reasoning in 1 small sentence to justify your choice.
    
    4. **Only Use User's Closet**: ONLY suggest items that exist in the user's closet (using their IDs from the list above) - unless suggesting a specific missing item to buy.
    
    5. **Provide Visual Outfit Suggestions**: Use this exact format:
       [OUTFIT: {"name": "Summer Brunch Look", "description": "A light and breezy outfit...", "itemIds": [1, 5, 12], "stylingTips": ["Tuck the shirt", "Add a belt"]}]
    
    6. **PCA HANDLING RULES**:
       - Mention if an item is "In-Palette" or how to style "Out-of-Palette" items (e.g., away from face). Keep it brief.
       - If the question isn't about color, don't force PCA advice.

    7. **Identify Wardrobe Gaps**: If needed, briefly suggest missing items (e.g. "A gray blazer would complete this.")
    
    8. **Be Encouraging**: Build confidence efficiently. Use emojis occasionally (🌸, ✨).

    Current user request: ${userInput}
  `;

    const contents = history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
    });

    const requestBody = {
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

        // Extract outfits from text
        const outfits: Outfit[] = [];
        const outfitRegex = /\[OUTFIT: (\{.*?\})\]/g;
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

        return {
            content: cleanText.trim(),
            outfits,
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

