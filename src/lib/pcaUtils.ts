import { ColorSeason } from './db';

export interface QuizAnswers {
    q1_veins: string;
    q2_jewelry: string;
    q3_white: string;
    q4_sun: string;
    q5_hair: string;
    q6_eyes: string;
    q7_contrast: string;
    q8_colors: string;
}

export interface QuizResult {
    season: ColorSeason;
    confidence: number; // 0-100
    scores: {
        warmth: number; // positive = warm, negative = cool
        brightness: number; // positive = bright, negative = muted
    };
}

export function calculateQuizSeason(answers: QuizAnswers): QuizResult {
    let warmth = 0;
    let brightness = 0;
    let totalQuestions = 0;

    // Q1: Vein color
    if (answers.q1_veins === 'green') {
        warmth += 2;
        totalQuestions++;
    } else if (answers.q1_veins === 'blue') {
        warmth -= 2;
        totalQuestions++;
    } else {
        totalQuestions++;
    }

    // Q2: Jewelry
    if (answers.q2_jewelry === 'gold') {
        warmth += 2;
        totalQuestions++;
    } else if (answers.q2_jewelry === 'silver') {
        warmth -= 2;
        totalQuestions++;
    } else {
        totalQuestions++;
    }

    // Q3: White shade
    if (answers.q3_white === 'ivory') {
        warmth += 1;
        totalQuestions++;
    } else if (answers.q3_white === 'pure') {
        warmth -= 1;
        totalQuestions++;
    } else {
        totalQuestions++;
    }

    // Q4: Sun reaction
    if (answers.q4_sun === 'tan') {
        warmth += 1;
        brightness += 1;
        totalQuestions++;
    } else if (answers.q4_sun === 'burn_tan') {
        totalQuestions++;
    } else if (answers.q4_sun === 'burn') {
        warmth -= 1;
        brightness -= 1;
        totalQuestions++;
    }

    // Q5: Hair color
    if (answers.q5_hair === 'golden') {
        warmth += 2;
        totalQuestions++;
    } else if (answers.q5_hair === 'ash') {
        warmth -= 2;
        totalQuestions++;
    } else if (answers.q5_hair === 'black') {
        brightness += 1;
        totalQuestions++;
    } else {
        totalQuestions++;
    }

    // Q6: Eye color
    if (answers.q6_eyes === 'warm_brown') {
        warmth += 1;
        totalQuestions++;
    } else if (answers.q6_eyes === 'cool_blue') {
        warmth -= 1;
        totalQuestions++;
    } else if (answers.q6_eyes === 'dark') {
        brightness += 1;
        totalQuestions++;
    } else {
        totalQuestions++;
    }

    // Q7: Contrast
    if (answers.q7_contrast === 'high') {
        brightness += 2;
        totalQuestions++;
    } else if (answers.q7_contrast === 'low') {
        brightness -= 2;
        totalQuestions++;
    } else {
        totalQuestions++;
    }

    // Q8: Best colors
    if (answers.q8_colors === 'warm_bright') {
        warmth += 2;
        brightness += 2;
        totalQuestions++;
    } else if (answers.q8_colors === 'cool_soft') {
        warmth -= 2;
        brightness -= 2;
        totalQuestions++;
    } else if (answers.q8_colors === 'warm_rich') {
        warmth += 2;
        brightness -= 2;
        totalQuestions++;
    } else if (answers.q8_colors === 'cool_bright') {
        warmth -= 2;
        brightness += 2;
        totalQuestions++;
    }

    // Determine season
    let season: ColorSeason;
    if (warmth > 0 && brightness > 0) {
        season = 'warm_spring';
    } else if (warmth < 0 && brightness < 0) {
        season = 'cool_summer';
    } else if (warmth > 0 && brightness < 0) {
        season = 'warm_autumn';
    } else if (warmth < 0 && brightness > 0) {
        season = 'cool_winter';
    } else {
        // Tie-breaker: use strongest signal
        if (Math.abs(warmth) > Math.abs(brightness)) {
            season = warmth > 0 ? 'warm_spring' : 'cool_summer';
        } else {
            season = brightness > 0 ? 'cool_winter' : 'cool_summer';
        }
    }

    // Calculate confidence (0-100)
    const maxPossibleScore = totalQuestions * 2;
    const actualScore = Math.abs(warmth) + Math.abs(brightness);
    const confidence = Math.min(100, Math.round((actualScore / maxPossibleScore) * 100));

    return {
        season,
        confidence,
        scores: { warmth, brightness }
    };
}

export function getSeasonName(season: ColorSeason): string {
    const names: Record<ColorSeason, string> = {
        warm_spring: 'Warm Spring 🌸',
        cool_summer: 'Cool Summer 🌊',
        warm_autumn: 'Warm Autumn 🍂',
        cool_winter: 'Cool Winter ❄️'
    };
    return names[season];
}

export function getSeasonDescription(season: ColorSeason): string {
    const descriptions: Record<ColorSeason, string> = {
        warm_spring: 'You shine in warm, bright colors! Your coloring is fresh, vibrant, and energetic. Think of a garden in full bloom.',
        cool_summer: 'Your secret weapon is soft, muted colors. You look elegant and ethereal in pastels and dusty tones.',
        warm_autumn: 'You are the queen of earthy, rich colors. Your warm undertones glow in rust, olive, and golden hues.',
        cool_winter: 'You are one of the few who can wear true black and pure white! Your high contrast demands bold, clear colors.'
    };
    return descriptions[season];
}

export interface SeasonData {
    best: string[];
    neutrals: string[];
    avoid: string[];
    tips: string[];
    stylingAdvice: string;
}

export function getSeasonData(season: ColorSeason): SeasonData {
    const data: Record<ColorSeason, SeasonData> = {
        warm_spring: {
            best: [
                '#FFB347', // peach
                '#FF6B6B', // coral
                '#FFA07A', // salmon
                '#FFD700', // gold
                '#98D8C8', // aqua
                '#87CEEB', // warm blue
                '#DDA0DD', // warm lavender
                '#F4A460', // camel
                '#CD853F', // tan
                '#D2691E', // warm brown
                '#FF69B4', // warm pink
                '#32CD32'  // bright green
            ],
            neutrals: [
                '#FFFAF0', // ivory
                '#F5DEB3', // wheat
                '#DEB887', // camel
                '#D2B48C', // tan
                '#BC8F8F', // rosy brown
                '#8B7355'  // warm brown
            ],
            avoid: [
                '#000000', // black
                '#FFFFFF', // pure white
                '#4B0082', // indigo
                '#483D8B'  // cool purple
            ],
            tips: [
                "Your best neutrals are cream, camel, and warm brown - not black and white",
                "You shine in warm, bright colors - don't be afraid of coral and peach!",
                "Gold jewelry is your secret weapon",
                "If wearing cool colors, balance with warm accessories"
            ],
            stylingAdvice: "You have warm undertones with bright, clear coloring. Your natural warmth radiates like spring sunshine! Focus on colors that are clear and warm."
        },
        cool_summer: {
            best: [
                '#B0C4DE', // light blue
                '#D8BFD8', // lavender
                '#DDA0DD', // plum
                '#FFB6C1', // soft pink
                '#FFC0CB', // dusty rose
                '#E6E6FA', // lavender
                '#778899', // slate
                '#708090', // slate gray
                '#4682B4', // soft blue
                '#87CEEB', // sky blue
                '#98D8C8', // soft teal
                '#C5B4E3'  // soft purple
            ],
            neutrals: [
                '#F5F5F5', // soft white
                '#DCDCDC', // soft gray
                '#C0C0C0', // silver
                '#A9A9A9', // dark gray
                '#2F4F4F'  // charcoal
            ],
            avoid: [
                '#FF4500', // orange-red
                '#FF8C00', // orange
                '#FFD700', // gold
                '#8B4513'  // warm brown
            ],
            tips: [
                "Your secret weapon is soft, muted colors - not bright or bold",
                "Gray is your best neutral, not black or brown",
                "You look ethereal in soft pastels and dusty colors",
                "Silver jewelry enhances your cool coloring"
            ],
            stylingAdvice: "You have cool undertones with soft, muted coloring. Your gentle elegance is like a summer breeze."
        },
        warm_autumn: {
            best: [
                '#8B4513', // saddle brown
                '#A0522D', // sienna
                '#CD853F', // peru
                '#D2691E', // chocolate
                '#B8860B', // goldenrod
                '#DAA520', // mustard
                '#6B8E23', // olive
                '#556B2F', // dark olive
                '#8FBC8F', // sage
                '#BC8F8F', // rosy brown
                '#CD5C5C', // rust
                '#FF6347'  // rust orange
            ],
            neutrals: [
                '#FFF8DC', // cream
                '#FAEBD7', // antique white
                '#F5DEB3', // wheat
                '#DEB887', // camel
                '#D2B48C', // tan
                '#8B7355'  // coffee
            ],
            avoid: [
                '#000000', // black
                '#FFFFFF', // white
                '#FF1493', // hot pink
                '#00FFFF'  // cyan
            ],
            tips: [
                "You're the queen of earthy, rich colors - embrace rust and olive!",
                "Brown is your black - it's more harmonious with your warmth",
                "Gold jewelry makes you glow",
                "You can wear all the warm autumnal colors others can't"
            ],
            stylingAdvice: "You have warm undertones with rich, earthy coloring. Your depth and warmth evoke autumn leaves."
        },
        cool_winter: {
            best: [
                '#000000', // black
                '#FFFFFF', // white
                '#000080', // navy
                '#4169E1', // royal blue
                '#0000FF', // true blue
                '#8B008B', // magenta
                '#9400D3', // violet
                '#FF1493', // deep pink
                '#DC143C', // crimson
                '#008B8B', // teal
                '#2E8B57', // emerald
                '#4B0082'  // indigo
            ],
            neutrals: [
                '#FFFFFF', // white
                '#000000', // black
                '#2F4F4F', // slate
                '#708090', // gray
                '#000080'  // navy
            ],
            avoid: [
                '#FF8C00', // orange
                '#FFD700', // gold
                '#F0E68C', // khaki
                '#D2B48C'  // tan
            ],
            tips: [
                "You're one of the few who can wear true black and pure white!",
                "Bold, clear colors are your friends - don't shy away from brightness",
                "Silver jewelry enhances your cool, dramatic coloring",
                "High contrast is your signature - embrace it"
            ],
            stylingAdvice: "You have cool undertones with bright, high-contrast coloring. Your striking clarity is like winter snow."
        }
    };

    return data[season];
}

export function getSeasonColors(season: ColorSeason): { best: string[], avoid: string[] } {
    const data = getSeasonData(season);
    return { best: data.best, avoid: data.avoid };
}

// Helper to check if a color matches the palette (simple RGB distance)
export function isColorInPalette(itemColors: string[], paletteColors: string[]): boolean {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Calculate distance
    const colorDistance = (c1: { r: number, g: number, b: number }, c2: { r: number, g: number, b: number }) => {
        return Math.sqrt(
            Math.pow(c2.r - c1.r, 2) +
            Math.pow(c2.g - c1.g, 2) +
            Math.pow(c2.b - c1.b, 2)
        );
    };

    const THRESHOLD = 60; // Loose threshold for matching

    for (const itemColor of itemColors) {
        const rgb1 = hexToRgb(itemColor);
        if (!rgb1) continue;

        for (const paletteColor of paletteColors) {
            const rgb2 = hexToRgb(paletteColor);
            if (!rgb2) continue;

            if (colorDistance(rgb1, rgb2) < THRESHOLD) {
                return true;
            }
        }
    }

    return false;
}

export const PCA_QUESTIONS = [
    {
        id: 'q1_veins',
        question: 'Look at your wrist veins in natural light. What color are they?',
        options: [
            { value: 'green', label: 'Green/olive' },
            { value: 'blue', label: 'Blue/purple' },
            { value: 'both', label: 'Both/hard to tell' }
        ]
    },
    {
        id: 'q2_jewelry',
        question: 'Which metal jewelry looks best on you?',
        options: [
            { value: 'gold', label: 'Gold/rose gold/copper' },
            { value: 'silver', label: 'Silver/white gold/platinum' },
            { value: 'both', label: 'Both equally' }
        ]
    },
    {
        id: 'q3_white',
        question: 'Which white shade looks better on you?',
        options: [
            { value: 'ivory', label: 'Ivory/cream/off-white' },
            { value: 'pure', label: 'Pure white/bright white' },
            { value: 'unsure', label: 'Not sure' }
        ]
    },
    {
        id: 'q4_sun',
        question: 'How does your skin react to sun exposure?',
        options: [
            { value: 'tan', label: 'Tan easily to golden/bronze' },
            { value: 'burn_tan', label: 'Burn first then may tan' },
            { value: 'burn', label: 'Burn easily, rarely tan' }
        ]
    },
    {
        id: 'q5_hair',
        question: 'What is your natural hair color?',
        options: [
            { value: 'golden', label: 'Golden blonde/auburn/warm brown with gold tones' },
            { value: 'ash', label: 'Ash blonde/brown (no gold)' },
            { value: 'black', label: 'Black/very dark brown' },
            { value: 'medium', label: 'Medium brown' }
        ]
    },
    {
        id: 'q6_eyes',
        question: 'What is your eye color?',
        options: [
            { value: 'warm_brown', label: 'Warm brown/amber/hazel with gold/warm blue' },
            { value: 'cool_blue', label: 'Gray/blue-gray/cool blue/soft brown' },
            { value: 'dark', label: 'Dark brown/black' },
            { value: 'green', label: 'Green/hazel' }
        ]
    },
    {
        id: 'q7_contrast',
        question: 'What is the contrast between your skin, hair, and eyes?',
        options: [
            { value: 'high', label: 'High contrast (very different tones)' },
            { value: 'low', label: 'Low contrast (similar tones)' },
            { value: 'medium', label: 'Medium contrast' }
        ]
    },
    {
        id: 'q8_colors',
        question: 'Which colors make you glow?',
        options: [
            { value: 'warm_bright', label: 'Warm bright: coral/peach/turquoise' },
            { value: 'cool_soft', label: 'Cool soft: lavender/dusty rose/mauve' },
            { value: 'warm_rich', label: 'Warm rich: rust/olive/mustard' },
            { value: 'cool_bright', label: 'Cool bright: royal blue/magenta/emerald' }
        ]
    }
];
