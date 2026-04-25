import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sun, Sparkles, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { getWeatherByLocation } from '../lib/weather';
import { generateOutfitRecommendation } from '../lib/gemini';
import type { Outfit, WardrobeItem } from '../lib/types';

export function SyncView() {
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Outfit & { explanation?: string } | null>(null);

  // Fetch weather and generate recommendation on mount
  useEffect(() => {
    if (!state.weather) {
      getWeatherByLocation().then(weatherData => {
        dispatch({ type: 'SET_WEATHER', payload: weatherData });
        generateRecommendation(weatherData);
      }).catch(err => {
        console.error('Failed to fetch weather:', err);
      });
    } else if (state.wardrobe.length > 0 && !recommendation) {
      generateRecommendation(state.weather);
    }
  }, [state.weather, state.wardrobe]);

  const generateRecommendation = async (weatherData: any) => {
    if (state.wardrobe.length === 0) return;
    
    setLoading(true);
    try {
      const outfit = await generateOutfitRecommendation(
        state.wardrobe,
        weatherData || state.weather,
        state.styleDNA
      );
      setRecommendation(outfit);
      dispatch({ type: 'SET_DAILY_OUTFIT', payload: outfit });
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRecommendation(null);
    getWeatherByLocation().then(weatherData => {
      dispatch({ type: 'SET_WEATHER', payload: weatherData });
      generateRecommendation(weatherData);
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold">Daily Sync</h1>
          <p className="text-text-secondary mt-1">AI-powered outfit recommendations based on weather & your style</p>
        </div>
        <div className="flex items-center gap-3">
          {state.weather && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-border-light shadow-sm">
              <MapPin size={14} className="text-primary" />
              <span className="text-sm font-bold">{state.weather.city}</span>
              <span className="text-sm">{state.weather.icon}</span>
              <span className="text-sm font-bold">{Math.round(state.weather.temp)}°C</span>
            </div>
          )}
          <Button 
            variant="secondary" 
            icon={<RefreshCw size={16} />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Weather Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-primary text-white overflow-hidden relative border-0">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-4xl font-heading font-bold">
                    {state.weather ? `${Math.round(state.weather.temp)}°C` : '--°C'}
                  </h3>
                  <p className="text-white/80 font-bold capitalize">
                    {state.weather?.condition || 'Loading...'}
                  </p>
                </div>
                <Sun size={48} className="text-white/40" />
              </div>
              <div className="space-y-3">
                {state.weather && (
                  <div className="flex items-center gap-3 text-sm font-medium bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <Sparkles size={16} />
                    <span>Humidity: {state.weather.humidity}%</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm font-medium bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <Sparkles size={16} />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Style Profile</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-surface-alt border border-border-light">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Preferred Styles</p>
                <div className="flex flex-wrap gap-2">
                  {state.styleDNA.preferredStyles.map(style => (
                    <Badge key={style} variant="primary">{style}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-alt border border-border-light">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Wardrobe Size</p>
                <p className="text-2xl font-bold text-primary">{state.wardrobe.length} <span className="text-sm text-text-muted">items</span></p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommended Outfit Section */}
        <div className="lg:col-span-2">
          <Card className="glass-strong h-full p-8 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-heading font-bold">Today's Recommendation</h3>
              {loading && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Generating outfit...</span>
                </div>
              )}
            </div>

            {state.wardrobe.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <Sparkles className="mx-auto mb-4 text-primary/40" size={48} />
                  <p className="text-sm font-bold text-text-muted mb-4">Add items to your wardrobe to get personalized recommendations.</p>
                  <Button variant="primary" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'wardrobe' })}>
                    Go to Wardrobe
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
                  <p className="text-sm font-bold text-text-muted">AI is curating your perfect outfit...</p>
                </div>
              </div>
            ) : recommendation ? (
              <div className="flex-1 grid md:grid-cols-2 gap-10">
                {/* Visual Preview */}
                <div className="relative group">
                  <div className="aspect-[3/4] rounded-[2rem] bg-surface-alt border-2 border-border-light overflow-hidden flex items-center justify-center relative shadow-inner">
                    {recommendation.top?.imageUrl ? (
                      <img 
                        src={recommendation.top.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt={recommendation.top.name}
                      />
                    ) : (
                      <div className="text-center p-6">
                        <Sparkles className="mx-auto mb-4 text-primary/40" size={48} />
                        <p className="text-sm text-text-muted">Top image preview</p>
                      </div>
                    )}
                    {/* Overlay Tags */}
                    <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                      {recommendation.top && <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur shadow-sm text-xs font-bold text-primary border border-primary/10">Top</span>}
                      {recommendation.bottom && <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur shadow-sm text-xs font-bold text-primary border border-primary/10">Bottom</span>}
                    </div>
                  </div>
                </div>

                {/* Logic & Description */}
                <div className="flex flex-col">
                  {recommendation.explanation && (
                    <div className="mb-8">
                      <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">The Rationale</span>
                      <p className="text-text text-lg font-medium leading-relaxed italic">
                        "{recommendation.explanation}"
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 mb-10">
                    {recommendation.top && (
                      <OutfitItemDisplay item={recommendation.top} label="Top" matchPercent={95} />
                    )}
                    {recommendation.bottom && (
                      <OutfitItemDisplay item={recommendation.bottom} label="Bottom" matchPercent={92} />
                    )}
                    {recommendation.shoes && (
                      <OutfitItemDisplay item={recommendation.shoes} label="Shoes" matchPercent={88} />
                    )}
                    {recommendation.outerwear && (
                      <OutfitItemDisplay item={recommendation.outerwear} label="Outerwear" matchPercent={85} />
                    )}
                    {recommendation.accessory && (
                      <OutfitItemDisplay item={recommendation.accessory} label="Accessory" matchPercent={90} />
                    )}
                  </div>

                  <div className="mt-auto">
                    <Button variant="primary" className="w-full h-14 font-bold text-lg rounded-2xl shadow-xl shadow-primary/20">
                      Confirm Selection
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}

function OutfitItemDisplay({ item, label, matchPercent }: { item: WardrobeItem; label: string; matchPercent: number }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border-light shadow-sm">
      <div className="flex items-center gap-3">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-surface-alt border border-border-light flex items-center justify-center">
            <span className="text-2xl">{item.category === 'upper' ? '👕' : item.category === 'lower' ? '👖' : '👟'}</span>
          </div>
        )}
        <div>
          <span className="text-xs font-bold text-text-muted uppercase block">{label}</span>
          <span className="text-sm font-bold">{item.name}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold text-primary">{matchPercent}% MATCH</span>
    </div>
  );
}
