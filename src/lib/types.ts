// ── View Types ──
export type View = 'dashboard' | 'avatar' | 'wardrobe' | 'sync' | 'suitcase' | 'mirror' | 'aura';

// ── Wardrobe ──
export type ClothingCategory = 'upper' | 'lower' | 'jacket' | 'shoes' | 'socks' | 'accessories';

export interface WardrobeItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  imageUrl: string;
  tags: string[];
  occasions: string[];
  texture?: string;
  season?: string;
  style?: string;
  addedAt: string;
}

// ── User Body ──
export interface UserBody {
  height: number;      // cm
  weight: number;      // kg
  shoulders: number;   // cm
  waist: number;       // cm
  hips: number;        // cm
  faceImageUrl?: string;
}

// ── Style DNA ──
export type StylePreference = 'minimal' | 'streetwear' | 'classic' | 'bohemian' | 'sporty' | 'elegant';

export interface StyleDNA {
  preferredStyles: StylePreference[];
  preferredColors: string[];
  avoidColors: string[];
}

// ── Outfit ──
export interface Outfit {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  outerwear?: WardrobeItem;
  accessory?: WardrobeItem;
  explanation?: string;
}

// ── Weather ──
export interface WeatherData {
  temp: number;
  condition: string;
  city: string;
  icon: string;
  humidity: number;
}

// ── Suitcase ──
export interface PackingItem {
  item: WardrobeItem;
  reason: string;
  packed: boolean;
}

// ── Mood ──
export type Mood = 'bold' | 'chill' | 'professional' | 'romantic' | 'creative' | 'mysterious';

export interface MoodConfig {
  mood: Mood;
  label: string;
  emoji: string;
  gradient: string;
  description: string;
}

// ── Mirror Critique ──
export interface MirrorCritique {
  score: number;
  headline: string;
  details: string;
  suggestions: string[];
}

// ── App State ──
export interface AppState {
  view: View;
  wardrobe: WardrobeItem[];
  userBody: UserBody;
  styleDNA: StyleDNA;
  dailyOutfit: Outfit | null;
  weather: WeatherData | null;
  isTransitioning: boolean;
  avatarGender: 'male' | 'female';
}

export type AppAction =
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'ADD_ITEM'; payload: WardrobeItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_BODY'; payload: Partial<UserBody> }
  | { type: 'UPDATE_STYLE_DNA'; payload: Partial<StyleDNA> }
  | { type: 'SET_DAILY_OUTFIT'; payload: Outfit | null }
  | { type: 'SET_WEATHER'; payload: WeatherData | null }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'SET_AVATAR_GENDER'; payload: 'male' | 'female' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };
