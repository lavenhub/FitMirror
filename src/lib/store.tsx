import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction } from './types';
import { db } from './database';

const STORAGE_KEY = 'fitmirror-state-v2';

const defaultState: AppState = {
  view: 'dashboard',
  wardrobe: [],
  userBody: {
    height: 175,
    weight: 70,
    shoulders: 45,
    waist: 80,
    hips: 95,
  },
  styleDNA: {
    preferredStyles: ['minimal', 'classic'],
    preferredColors: ['#1a1a2e', '#4f46e5', '#f5f5f4', '#e7e5e4'],
    avoidColors: [],
  },
  dailyOutfit: null,
  weather: null,
  isTransitioning: false,
  avatarGender: 'male',
};

// Load state from IndexedDB
async function loadStateFromDB(): Promise<AppState> {
  try {
    const savedState = await db.getState(STORAGE_KEY);
    if (savedState) {
      console.log('✓ Loaded state from IndexedDB');
      return { ...defaultState, ...savedState, view: 'dashboard' };
    }
  } catch (error) {
    console.error('Failed to load state from IndexedDB:', error);
  }
  console.log('Using default state');
  return defaultState;
}

// Save state to IndexedDB (WITHOUT images)
async function saveStateToDB(state: AppState): Promise<void> {
  try {
    const { view, wardrobe, ...rest } = state;
    void view;
    
    // Save state data without image URLs
    const stateWithoutImages = {
      ...rest,
      wardrobe: wardrobe.map(item => ({
        ...item,
        imageUrl: '', // Images are stored separately in IndexedDB
      })),
    };
    
    await db.saveState(STORAGE_KEY, stateWithoutImages);
  } catch (error) {
    console.error('Failed to save state to IndexedDB:', error);
  }
}

// Save wardrobe images to IndexedDB
async function saveWardrobeImages(items: AppState['wardrobe']): Promise<void> {
  try {
    let savedCount = 0;
    for (const item of items) {
      if (item.imageUrl && item.imageUrl.startsWith('data:')) {
        await db.saveImage(item.id, item.imageUrl);
        savedCount++;
      }
    }
    if (savedCount > 0) {
      console.log(`✓ Saved ${savedCount} images to IndexedDB`);
    }
  } catch (error) {
    console.error('Failed to save wardrobe images:', error);
  }
}

// Load wardrobe images from IndexedDB
async function loadWardrobeImages(items: AppState['wardrobe']): Promise<AppState['wardrobe']> {
  try {
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const imageData = await db.getImage(item.id);
        if (imageData) {
          return { ...item, imageUrl: imageData };
        }
        return item;
      })
    );
    const loadedCount = itemsWithImages.filter(i => i.imageUrl).length;
    console.log(`✓ Loaded images for ${loadedCount}/${items.length} items`);
    return itemsWithImages;
  } catch (error) {
    console.error('Failed to load wardrobe images:', error);
    return items;
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'ADD_ITEM':
      return { ...state, wardrobe: [...state.wardrobe, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, wardrobe: state.wardrobe.filter(i => i.id !== action.payload) };
    case 'UPDATE_BODY':
      return { ...state, userBody: { ...state.userBody, ...action.payload } };
    case 'UPDATE_STYLE_DNA':
      return { ...state, styleDNA: { ...state.styleDNA, ...action.payload } };
    case 'SET_DAILY_OUTFIT':
      return { ...state, dailyOutfit: action.payload };
    case 'SET_WEATHER':
      return { ...state, weather: action.payload };
    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.payload };
    case 'SET_AVATAR_GENDER':
      return { ...state, avatarGender: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, () => defaultState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load state from IndexedDB on mount
  useEffect(() => {
    async function initialize() {
      const initialState = await loadStateFromDB();
      const stateWithImages = await loadWardrobeImages(initialState.wardrobe);
      
      // Set the loaded state
      dispatch({ type: 'LOAD_STATE', payload: { ...initialState, wardrobe: stateWithImages } });
      setIsInitialized(true);
    }
    
    initialize();
  }, []);

  // Save state to IndexedDB when it changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save until initial load is complete
    
    // Save state (without images)
    saveStateToDB(state);
    
    // Save images separately
    saveWardrobeImages(state.wardrobe);
  }, [state, isInitialized]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
