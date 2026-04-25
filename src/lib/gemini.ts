import { GoogleGenAI } from "@google/genai";
import type { WardrobeItem, Outfit, WeatherData, Mood, ClothingCategory } from "./types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const client = new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeClothing(imageBuffer: string) {
  if (!API_KEY) {
    // Return mock data if no API key is provided
    return {
      name: "Modern Essential Piece",
      category: "upper",
      color: "Charcoal",
      tags: ["minimal", "versatile"],
      occasions: ["casual", "work"],
      texture: "Smooth Cotton",
      season: "All-season",
      style: "Contemporary",
    };
  }

  try {
    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: 'user',
        parts: [
          { text: `Analyze this clothing item in detail and return a JSON object with these exact fields:
- name: descriptive name (string)
- category: one of [upper, lower, jacket, shoes, socks, accessories]
- color: dominant color name (string)
- texture: fabric texture (string)
- season: best season [Spring, Summer, Fall, Winter, All-season]
- style: style type [Casual, Formal, Streetwear, Sporty, Elegant, Minimal]
- tags: array of 3-5 style tags
- occasions: array of 3-5 occasion types

Be precise and fashionable. Return ONLY valid JSON, no markdown formatting.` },
          {
            inlineData: {
              data: imageBuffer.split(",")[1],
              mimeType: "image/jpeg",
            },
          }
        ]
      }]
    });
    const text = typeof (result as any).text === 'function' ? (result as any).text() : (result as any).candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Simple JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}

export async function generateAuraAnalysis(userProfile: any) {
  if (!API_KEY) {
    return "Your styling aura radiates a sophisticated minimal energy. You lean towards classic silhouettes that emphasize your shoulder-to-waist ratio, creating a powerful presence. Your preferred palette of deep navys and stone grays suggests a person who values precision and timelessness over fleeting trends. Highlights: Your structured shoulder alignment is your power feature—embrace blazers and structured knits.";
  }

  try {
    const prompt = `
      ACT AS A COSMIC STYLE ARCHITECT. 
      Analyze this user profile: ${JSON.stringify(userProfile)}.
      
      GENERATE A 'CRAZY' AND DEEP AURA ANALYSIS.
      1. STYLE ENERGY: Describe their psychological fashion archetype in a poetic, high-fashion way.
      2. PHYSICAL ARCHITECTURE: Based on their measurements, tell them exactly what silhouettes they MUST wear to highlight their best features (shoulders, waist, height, etc.). Be very specific.
      3. CELESTIAL ALIGNMENT: Provide a deep 'psychological/style profile' that feels like a futuristic prophecy.
      
      Use elegant, punchy, and 'state-of-the-art' language. Format with bold headers and bullet points where appropriate, but keep it flowing like a high-end magazine editorial.
    `;
    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return typeof (result as any).text === 'function' ? (result as any).text() : (result as any).candidates?.[0]?.content?.parts?.[0]?.text || "Style alignment in progress...";
  } catch (error) {
    console.error("Aura Generation Error:", error);
    return "Style alignment in progress...";
  }
}

export async function generateStylingAdvice(item: any, userProfile: any) {
  if (!API_KEY) {
    return "Pair this piece with high-waisted charcoal trousers to accentuate your waistline. The texture of this fabric contrasts beautifully with silk or linen. Finish with minimalist leather sneakers for a balanced, premium look.";
  }

  try {
    const prompt = `Generate fancy real-life styling advice for this item: ${JSON.stringify(item)} given this user: ${JSON.stringify(userProfile)}. Focus on how it highlights their features and what to pair it with for a 'state of the art' look.`;
    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return typeof (result as any).text === 'function' ? (result as any).text() : (result as any).candidates?.[0]?.content?.parts?.[0]?.text || "Generating style insights...";
  } catch (error) {
    console.error("Advice Generation Error:", error);
    return "Generating style insights...";
  }
}

export async function generateOutfitRecommendation(
  wardrobe: WardrobeItem[],
  weather: WeatherData,
  styleDNA: any,
  mood?: Mood
): Promise<Outfit & { explanation: string }> {
  if (!API_KEY || wardrobe.length === 0) {
    // Fallback: simple algorithm-based recommendation
    const tops = wardrobe.filter(i => i.category === 'upper');
    const bottoms = wardrobe.filter(i => i.category === 'lower');
    const shoes = wardrobe.filter(i => i.category === 'shoes');
    const jackets = wardrobe.filter(i => i.category === 'jacket');

    return {
      top: tops[0] || undefined,
      bottom: bottoms[0] || undefined,
      shoes: shoes[0] || undefined,
      outerwear: weather.temp < 15 ? jackets[0] : undefined,
      explanation: `Based on ${weather.temp}°C weather, we recommend layering appropriately.`,
    };
  }

  try {
    const prompt = `You are an expert AI stylist. Create an outfit recommendation based on:

WEATHER: ${weather.temp}°C, ${weather.condition}, Humidity: ${weather.humidity}%
USER STYLE PREFERENCES: ${JSON.stringify(styleDNA)}
MOOD: ${mood || 'versatile'}

AVAILABLE WARDROBE ITEMS:
${JSON.stringify(wardrobe.map(w => ({ id: w.id, name: w.name, category: w.category, color: w.color, tags: w.tags, season: w.season })))}

Select the best combination for today's weather and user's style. Return JSON with:
- top: item object (or null)
- bottom: item object (or null)  
- shoes: item object (or null)
- outerwear: item object (or null if not needed)
- accessory: item object (or null)
- explanation: detailed reasoning (2-3 sentences)

Consider: temperature appropriateness, color coordination, style consistency, occasion versatility.
Return ONLY valid JSON.`;

    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    const text = typeof (result as any).text === 'function' ? (result as any).text() : (result as any).candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("No valid JSON in response");
  } catch (error) {
    console.error("Outfit Recommendation Error:", error);
    // Fallback algorithm
    const tops = wardrobe.filter(i => i.category === 'upper');
    const bottoms = wardrobe.filter(i => i.category === 'lower');
    const shoes = wardrobe.filter(i => i.category === 'shoes');
    const jackets = wardrobe.filter(i => i.category === 'jacket');

    return {
      top: tops[0] || undefined,
      bottom: bottoms[0] || undefined,
      shoes: shoes[0] || undefined,
      outerwear: weather.temp < 15 ? jackets[0] : undefined,
      explanation: `Based on ${weather.temp}°C weather, we recommend layering appropriately.`,
    };
  }
}

export async function generatePackingList(
  wardrobe: WardrobeItem[],
  destination: string,
  days: number,
  weather: WeatherData
): Promise<Array<{ item: WardrobeItem; reason: string }>> {
  if (!API_KEY || wardrobe.length === 0) {
    return [];
  }

  try {
    const prompt = `You are an expert travel stylist. Create a packing list for a trip.

DESTINATION: ${destination}
DURATION: ${days} days
WEATHER: ${weather.temp}°C, ${weather.condition}

AVAILABLE WARDROBE:
${JSON.stringify(wardrobe.map(w => ({ id: w.id, name: w.name, category: w.category, color: w.color, tags: w.tags, season: w.season })))}

Select optimal items for this trip. Consider: weather appropriateness, versatility, layering options, occasion coverage.
Return JSON array of objects with:
- itemId: string (id from wardrobe)
- reason: string (why this item is needed)

Return ONLY valid JSON array.`;

    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    const text = typeof (result as any).text === 'function' ? (result as any).text() : (result as any).candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const packingItems = JSON.parse(jsonMatch[0]);
      return packingItems.map((p: any) => ({
        item: wardrobe.find(w => w.id === p.itemId) || wardrobe[0],
        reason: p.reason,
      })).filter((p: any) => p.item);
    }
    
    throw new Error("No valid JSON in response");
  } catch (error) {
    console.error("Packing List Error:", error);
    return [];
  }
}

export async function analyzeOutfitPhoto(imageBuffer: string, userProfile: any) {
  if (!API_KEY) {
    return {
      score: 8.5,
      headline: "Great Style Choice!",
      details: "Your outfit shows excellent color coordination and fits well with your body proportions.",
      suggestions: ["Try rolling your sleeves for a more relaxed vibe", "Consider adding a watch accessory"],
    };
  }

  try {
    const prompt = `You are a fashion critic AI. Analyze this outfit photo and provide feedback.

USER PROFILE: ${JSON.stringify(userProfile)}

Analyze:
- Color coordination
- Fit and proportions
- Style consistency
- Overall impression

Return JSON with:
- score: number (1-10)
- headline: string (short positive title)
- details: string (2-3 sentence analysis)
- suggestions: array of 2-3 improvement suggestions

Return ONLY valid JSON.`;

    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBuffer.split(",")[1],
              mimeType: "image/jpeg",
            },
          }
        ]
      }]
    });
    
    const text = typeof (result as any).text === 'function' ? (result as any).text() : (result as any).candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      score: 8.0,
      headline: "Nice Outfit!",
      details: "Good style choices detected.",
      suggestions: ["Keep experimenting with your look"],
    };
  } catch (error) {
    console.error("Outfit Analysis Error:", error);
    return {
      score: 8.0,
      headline: "Nice Outfit!",
      details: "Good style choices detected.",
      suggestions: ["Keep experimenting with your look"],
    };
  }
}
