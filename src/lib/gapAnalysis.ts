import { ClothingItem, UserProfile, Lifestyle } from './db';

export interface ClosetSnapshot {
    totalItems: number;
    categoryCounts: Record<string, number>;
    colorDistribution: Record<string, number>;
    occasionDensity: Record<string, number>;
    seasonDistribution: Record<string, number>;
}

export function generateClosetSnapshot(items: ClothingItem[]): ClosetSnapshot {
    const snapshot: ClosetSnapshot = {
        totalItems: items.length,
        categoryCounts: {},
        colorDistribution: {},
        occasionDensity: {},
        seasonDistribution: {},
    };

    items.forEach(item => {
        // Category
        snapshot.categoryCounts[item.category] = (snapshot.categoryCounts[item.category] || 0) + 1;

        // Colors
        item.colors.forEach(color => {
            const c = color.toLowerCase();
            snapshot.colorDistribution[c] = (snapshot.colorDistribution[c] || 0) + 1;
        });

        // Occasions
        item.occasions.forEach(occ => {
            snapshot.occasionDensity[occ] = (snapshot.occasionDensity[occ] || 0) + 1;
        });

        // Seasons
        item.seasons.forEach(season => {
            snapshot.seasonDistribution[season] = (snapshot.seasonDistribution[season] || 0) + 1;
        });
    });

    return snapshot;
}

export function createGapAnalysisPrompt(
    snapshot: ClosetSnapshot,
    profile: UserProfile
): string {
    const { gender, lifestyle } = profile;

    return `
Analyze this wardrobe for "Gaps" based on the user's profile and the Wardrobe Architecture knowledge.

USER PROFILE:
- Gender: ${gender || 'Not specified'}
- Lifestyle: ${JSON.stringify(lifestyle || { work: 40, casual: 40, athletic: 10, social: 10 })}

CLOSET SNAPSHOT:
- Total Items: ${snapshot.totalItems}
- Categories: ${JSON.stringify(snapshot.categoryCounts)}
- Colors: ${JSON.stringify(snapshot.colorDistribution)}
- Occasions: ${JSON.stringify(snapshot.occasionDensity)}

TASK:
Perform a 4-point diagnostic:
1. **Basics & Essentials Gap**: Identify if they lack "connectors" (neutrals, plain tees, etc) for their gender.
2. **Lifestyle & Occasion Gap**: Compare their lifestyle % against their occasion density. (e.g. if they work 70% but have 10% work clothes).
3. **Color Theory Gap**: Identify "Color Islands" or lack of neutral anchors.
4. **The "Power Unlock" Piece**: Recommend ONE specific item that would mathematically unlock the most new combinations.

Format the output as a JSON object:
{
  "basicsGap": { "status": "good|warning|critical", "message": "...", "missingItems": [] },
  "lifestyleGap": { "status": "good|warning|critical", "message": "...", "mismatchScore": 0 },
  "colorGap": { "status": "good|warning|critical", "message": "..." },
  "powerUnlock": { "item": "...", "reason": "...", "unlockCount": 0 }
}
`;
}
