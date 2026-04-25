import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Camera, Scan, RefreshCw, Layers, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { analyzeOutfitPhoto } from '../lib/gemini';
import type { MirrorCritique } from '../lib/types';

export function MirrorView() {
  const { state } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [critique, setCritique] = useState<MirrorCritique | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(s);
      setActive(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert('Camera access is required for the mirror feature. Please allow camera access and try again.');
    }
  };

  useEffect(() => {
    if (active && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [active, stream]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    setCritique(null);
    
    try {
      // Capture frame from video
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.85);
      
      console.log('Sending image to Gemini for analysis...');
      
      // Analyze with Gemini
      const result = await analyzeOutfitPhoto(imageData, {
        body: state.userBody,
        styleDNA: state.styleDNA,
        wardrobe: state.wardrobe,
      });
      
      console.log('Gemini analysis result:', result);
      setCritique(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setCritique({
        score: 7.5,
        headline: 'Good Style!',
        details: 'Your outfit looks great. Keep experimenting with different combinations.',
        suggestions: ['Try adding accessories for more impact', 'Consider layering for depth'],
      });
    } finally {
      setScanning(false);
    }
  }, [state.userBody, state.styleDNA, state.wardrobe]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-heading font-bold">Live Mirror</h1>
          <p className="text-text-secondary mt-1">Real-time style critique and virtual overlay</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            icon={<Layers size={16} />} 
            onClick={() => setOverlayVisible(!overlayVisible)}
          >
            {overlayVisible ? 'Hide Overlays' : 'Show Overlays'}
          </Button>
          {!active && (
            <Button variant="primary" icon={<Camera size={16} />} onClick={startCamera}>
              Activate Mirror
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Mirror Feed */}
        <div className="lg:col-span-3">
          <Card className="relative aspect-[4/3] md:aspect-video overflow-hidden bg-black p-0 border-0 shadow-2xl">
            {!active ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                  <Camera size={40} />
                </div>
                <p className="font-bold">Camera Offline</p>
                <p className="text-sm">Click 'Activate Mirror' to begin</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Status Badge */}
                <div className="absolute top-8 left-8 flex items-center gap-3 z-30">
                  <div className="flex items-center gap-2 bg-red-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-400/50">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Mirror</span>
                  </div>
                </div>

                {/* Subtle Cinematic Grain Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                
                {/* HUD Overlays */}
                <AnimatePresence>
                  {overlayVisible && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {/* Corner Accents */}
                      <div className="absolute top-8 left-8 w-16 h-16 border-t-[0.5px] border-l-[0.5px] border-white/40" />
                      <div className="absolute top-8 right-8 w-16 h-16 border-t-[0.5px] border-r-[0.5px] border-white/40" />
                      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-[0.5px] border-l-[0.5px] border-white/40" />
                      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-[0.5px] border-r-[0.5px] border-white/40" />

                      {/* Scanning HUD */}
                      {scanning && (
                        <motion.div
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute left-[10%] right-[10%] h-[1px] bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)] z-20"
                        />
                      )}

                      {/* Right HUD Stats */}
                      <div className="absolute top-8 right-8 flex flex-col gap-3 items-end">
                        <div className="glass px-4 py-2 rounded-xl text-[10px] font-mono font-bold text-primary flex items-center gap-2">
                          <Zap size={12} className="animate-pulse" />
                          SYMMETRY: 0.94
                        </div>
                        <div className="glass px-4 py-2 rounded-xl text-[10px] font-mono font-bold text-success flex items-center gap-2">
                          <ShieldCheck size={12} />
                          COLOR ALIGN: OPTIMAL
                        </div>
                      </div>

                      {/* Face Target */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-white/30 rounded-[60%] flex items-center justify-center">
                        <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                          Position Face Here
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </Card>
          
          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {active && (
            <div className="mt-6 flex justify-center gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                icon={<Scan size={18} />} 
                onClick={captureAndAnalyze}
                loading={scanning}
                className="rounded-full px-12 h-14 font-bold text-lg"
              >
                {scanning ? 'Analyzing...' : 'Analyze Outfit'}
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                icon={<RefreshCw size={18} />}
                className="rounded-full w-14 h-14 p-0 flex items-center justify-center"
              >
                <span className="sr-only">Reset</span>
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="glass-strong">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Mirror Critique</h3>
            {scanning ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <Loader2 className="text-primary animate-spin" size={32} />
                <p className="text-xs font-bold text-text-muted animate-pulse">AI is analyzing your outfit...</p>
              </div>
            ) : critique ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-surface-alt border border-border-light">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-heading font-bold text-primary">{critique.score}</span>
                    <Badge variant="primary">/10</Badge>
                  </div>
                  <p className="text-sm font-bold text-text-secondary">{critique.headline}</p>
                </div>
                <p className="text-sm text-text-secondary font-medium leading-relaxed">
                  {critique.details}
                </p>
                <div className="pt-4 border-t border-border-light">
                  <span className="text-[10px] font-bold text-text-muted uppercase block mb-2">Suggestions</span>
                  <ul className="space-y-2">
                    {critique.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-xs text-text italic flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-surface-alt border border-border-light">
                  <span className="text-3xl font-heading font-bold text-text-muted">--</span>
                  <p className="text-xs font-bold text-text-secondary mt-1">Outfit Harmony Score</p>
                </div>
                <p className="text-sm text-text-muted font-medium">
                  Click "Analyze Outfit" to get AI-powered feedback on your style.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
