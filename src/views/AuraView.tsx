import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkles, Zap, ShieldCheck, Heart, TrendingUp, Info } from 'lucide-react';
import { generateAuraAnalysis } from '../lib/gemini';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export function AuraView() {
  const { state } = useStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const startAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const profile = {
        body: state.userBody,
        dna: state.styleDNA,
        wardrobeCount: state.wardrobe.length,
        wardrobe: state.wardrobe.map(w => ({
          name: w.name,
          category: w.category,
          color: w.color,
          style: w.style,
          tags: w.tags,
        })),
      };
      const result = await generateAuraAnalysis(profile);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis("The celestial style alignment was interrupted. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const radarData = useMemo(() => {
    const dna = state.styleDNA;
    return [
      { subject: 'Minimal', A: dna.preferredStyles.includes('minimal') ? 85 : 30, fullMark: 100 },
      { subject: 'Street', A: dna.preferredStyles.includes('streetwear') ? 80 : 25, fullMark: 100 },
      { subject: 'Classic', A: dna.preferredStyles.includes('classic') ? 90 : 35, fullMark: 100 },
      { subject: 'Bohemian', A: dna.preferredStyles.includes('bohemian') ? 75 : 20, fullMark: 100 },
      { subject: 'Sporty', A: dna.preferredStyles.includes('sporty') ? 70 : 20, fullMark: 100 },
      { subject: 'Elegant', A: dna.preferredStyles.includes('elegant') ? 85 : 30, fullMark: 100 },
    ];
  }, [state.styleDNA]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Aura Analysis</h1>
          <p className="text-slate-500 font-medium">Deep biometric and psychological style mapping</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-700">Gemini 1.5 Active</span>
          </div>
          <Button 
            onClick={startAnalysis} 
            loading={analyzing}
            className="rounded-xl px-8"
          >
            Run Deep Analysis
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Stats & Radar Chart - Like the screenshot */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-900 mb-6 self-start">Overall Style DNA</h3>
            <div className="w-full h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <Radar
                    name="Style"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between w-full mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">65%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Alignment</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">80%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Precision</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#10b981] text-white overflow-hidden relative border-none">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <TrendingUp size={16} />
                <span className="text-sm font-bold uppercase tracking-wider">Style Status</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">High Impact</h2>
              <p className="text-white/80 font-medium mb-6">Your current wardrobe aligns with your professional aspirations.</p>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#10b981]">
                      <Zap size={16} fill="currentColor" />
                   </div>
                   <p className="text-sm font-bold">Acquire the look</p>
                </div>
              </div>
            </div>
            {/* Abstract glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/30 rounded-full blur-3xl -mr-24 -mt-24" />
          </Card>
        </div>

        {/* Right: Analysis Results */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="h-full min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={24} />
                Celestial Analysis
              </h3>
              <div className="flex items-center gap-1.5 text-slate-400">
                 <Info size={16} />
                 <span className="text-xs font-bold uppercase tracking-widest">Powered by Gemini 1.5</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!analysis && !analyzing ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-10"
                >
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 text-slate-300">
                    <Sparkles size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Ready for Insights?</h4>
                  <p className="text-slate-500 max-w-sm font-medium">Click the button above to launch the deep Gemini analysis of your style DNA.</p>
                </motion.div>
              ) : analyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-10"
                >
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <p className="text-lg font-bold text-slate-900 animate-pulse">Consulting the Style Oracle...</p>
                  <p className="text-sm text-slate-400 mt-2">Gemini is mapping your biometric aura</p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1"
                >
                   <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 mb-8">
                      <p className="text-slate-700 leading-relaxed text-lg font-medium whitespace-pre-wrap first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                        {analysis}
                      </p>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-6 mt-auto pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Heart size={24} />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Highlight</p>
                            <p className="text-base font-bold text-slate-900">Shoulder-Waist Alignment</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Zap size={24} />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Silhouette</p>
                            <p className="text-base font-bold text-slate-900">Structured Minimalist</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
}
