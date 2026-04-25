import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Luggage, Map, Calendar, Plus, CheckCircle2, Trash2, Sparkles, Plane, Loader2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { generatePackingList } from '../lib/gemini';
import { getWeatherForCity } from '../lib/weather';
import type { WardrobeItem } from '../lib/types';

export function SuitcaseView() {
  const { state, dispatch } = useStore();
  const [items, setItems] = useState<Array<{ item: WardrobeItem; reason: string; packed: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('Milan, Italy');
  const [days, setDays] = useState(7);
  const [weather, setWeather] = useState<any>(null);

  // Generate packing list when component mounts or wardrobe changes
  useEffect(() => {
    if (state.wardrobe.length > 0) {
      generatePackingListForTrip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.wardrobe.length]); // Only trigger when wardrobe count changes

  const generatePackingListForTrip = async () => {
    if (state.wardrobe.length === 0) return;
    
    setLoading(true);
    try {
      // Get destination weather
      const destWeather = await getWeatherForCity(destination.split(',')[0]);
      setWeather(destWeather);

      // Generate AI packing list
      const packingItems = await generatePackingList(
        state.wardrobe,
        destination,
        days,
        destWeather
      );

      const itemsWithState = packingItems.map(p => ({
        item: p.item,
        reason: p.reason,
        packed: false,
      }));

      setItems(itemsWithState);
    } catch (error) {
      console.error('Failed to generate packing list:', error);
      // Fallback: select basic items from wardrobe
      const basicItems = state.wardrobe.slice(0, 5).map(item => ({
        item,
        reason: 'Versatile piece for your trip',
        packed: false,
      }));
      setItems(basicItems);
    } finally {
      setLoading(false);
    }
  };

  const togglePacked = (index: number) => {
    setItems(items.map((item, i) => i === index ? { ...item, packed: !item.packed } : item));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
            <Plane size={16} />
            Smart Packing Assistant
          </div>
          <h1 className="text-4xl font-heading font-bold">Smart Suitcase</h1>
          <p className="text-text-secondary mt-1">AI-optimized packing lists from your wardrobe</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={generatePackingListForTrip}
            loading={loading}
          >
            Regenerate List
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Trip Context */}
        <div className="space-y-6">
          <Card className="glass-strong">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Trip Overview</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center text-primary">
                  <Map size={24} />
                </div>
                <div>
                  <p className="font-bold text-text">{destination}</p>
                  <p className="text-xs text-text-muted">{days} Days Trip</p>
                </div>
              </div>
              
              {weather && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-text-muted border border-border-light">
                    <span className="text-2xl">{weather.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-text">{Math.round(weather.temp)}°C</p>
                    <p className="text-xs text-text-muted capitalize">{weather.condition}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border-light">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-text">Packing Progress</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {items.length > 0 ? Math.round((items.filter(i => i.packed).length / items.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${items.length > 0 ? (items.filter(i => i.packed).length / items.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-primary text-white border-0 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} />
                <h3 className="font-heading font-bold text-xl">AI Packing Tip</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                {weather && weather.temp < 15 
                  ? `Forecast shows cool weather (${Math.round(weather.temp)}°C). We've prioritized layering pieces and warmer items from your wardrobe.`
                  : `Warm weather detected (${Math.round(weather.temp)}°C). Light, breathable fabrics have been selected for comfort.`
                }
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
          </Card>
        </div>

        {/* Packing List */}
        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-heading font-bold">Essential Gear</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-lg bg-surface-alt text-[10px] font-bold text-text-muted border border-border-light">
                  {items.length} ITEMS
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
                  <p className="text-sm font-bold text-text-muted">AI is selecting optimal items...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center">
                <Luggage size={48} className="mx-auto text-text-muted/20 mb-4" />
                <p className="text-text-muted font-bold mb-2">Your suitcase is empty.</p>
                <p className="text-sm text-text-muted">Add items to your wardrobe first, then regenerate the packing list.</p>
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'wardrobe' })}
                >
                  Go to Wardrobe
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((itemData, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`
                        flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                        ${itemData.packed 
                          ? 'bg-surface-alt border-border-light grayscale opacity-60' 
                          : 'bg-white border-border-light hover:border-primary/30 shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => togglePacked(index)}
                          className={`
                            w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                            ${itemData.packed 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-border-light hover:border-primary/50 text-transparent'
                            }
                          `}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <div className="flex items-center gap-3">
                          {itemData.item.imageUrl ? (
                            <img 
                              src={itemData.item.imageUrl} 
                              alt={itemData.item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-surface-alt border border-border-light flex items-center justify-center">
                              <span className="text-xl">{getCategoryEmoji(itemData.item.category)}</span>
                            </div>
                          )}
                          <div>
                            <p className={`font-bold transition-all ${itemData.packed ? 'line-through' : ''}`}>
                              {itemData.item.name}
                            </p>
                            <p className="text-xs text-text-secondary">{itemData.reason}</p>
                            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">
                              {itemData.item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/5 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    upper: '👕',
    lower: '👖',
    jacket: '🧥',
    shoes: '👟',
    socks: '🧦',
    accessories: '⌚',
  };
  return emojis[category] || '👔';
}
