import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DemoTip } from '../components/common/DemoTip';
import {
  Ruler, User, ScanFace, Zap, Box, RotateCcw
} from 'lucide-react';
import type { StylePreference } from '../lib/types';
import { FrameSequencePlayer } from '../components/ui/FrameSequencePlayer';
import { AvatarEngine } from '../components/avatar/AvatarEngine';
import { Avatar3D } from '../components/avatar/Avatar3D';

const styleOptions: { value: StylePreference; label: string; emoji: string }[] = [
  { value: 'minimal', label: 'Minimal', emoji: '◻️' },
  { value: 'classic', label: 'Classic', emoji: '👔' },
  { value: 'streetwear', label: 'Streetwear', emoji: '🧢' },
  { value: 'bohemian', label: 'Bohemian', emoji: '🌿' },
  { value: 'sporty', label: 'Sporty', emoji: '⚡' },
  { value: 'elegant', label: 'Elegant', emoji: '✨' },
];

export function AvatarView() {
  const { state, dispatch } = useStore();
  const { userBody, styleDNA } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const handleFaceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setScanning(true);
      setScanStep(1);

      // Simulate multi-step scanning
      setTimeout(() => setScanStep(2), 1000);
      setTimeout(() => setScanStep(3), 2000);
      setTimeout(() => {
        dispatch({ type: 'UPDATE_BODY', payload: { faceImageUrl: url } });
        setScanning(false);
        setScanStep(0);
      }, 3500);
    };
    reader.readAsDataURL(file);
  }, [dispatch]);

  const updateMeasurement = (key: string, value: number) => {
    dispatch({ type: 'UPDATE_BODY', payload: { [key]: value } });
  };

  const toggleStyle = (style: StylePreference) => {
    const current = styleDNA.preferredStyles;
    const updated = current.includes(style)
      ? current.filter(s => s !== style)
      : [...current, style];
    dispatch({ type: 'UPDATE_STYLE_DNA', payload: { preferredStyles: updated } });
  };

  const measurements = [
    { key: 'height', label: 'Height', unit: 'cm', min: 140, max: 210, value: userBody.height },
    { key: 'weight', label: 'Weight', unit: 'kg', min: 40, max: 150, value: userBody.weight },
    { key: 'shoulders', label: 'Shoulders', unit: 'cm', min: 30, max: 60, value: userBody.shoulders },
    { key: 'waist', label: 'Waist', unit: 'cm', min: 55, max: 120, value: userBody.waist },
    { key: 'hips', label: 'Hips', unit: 'cm', min: 70, max: 130, value: userBody.hips },
  ];

  return (
    <div className="space-y-12 pb-24">
      <DemoTip
        id="avatar-v2"
        message="Your Body Avatar uses precision biometric mapping. Adjust the sliders or upload a face photo to generate a high-fidelity 2D profile."
      />

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-heading font-bold mb-2">Biometric Avatar</h1>
          <p className="text-text-secondary text-lg font-medium">Precision 2D biometric mapping</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Avatar Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-strong flex flex-col items-center py-8 relative overflow-hidden h-[700px] border-0 shadow-2xl">
            {/* Background Aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08),transparent_60%)]" />
            
            {/* Precision Grid Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* View Mode Toggle */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              <Button
                variant={viewMode === '2d' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('2d')}
                className="rounded-lg"
              >
                2D
              </Button>
              <Button
                variant={viewMode === '3d' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('3d')}
                className="rounded-lg"
              >
                3D
              </Button>
            </div>

            {/* Avatar Display */}
            <div className="relative w-full h-[550px] z-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {scanning ? (
                  <motion.div
                    key="scanning-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative w-48 h-48">
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
                       />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <ScanFace size={64} className="text-primary animate-pulse" />
                       </div>
                    </div>
                    <div className="text-center space-y-2">
                       <h4 className="text-xl font-bold text-primary uppercase tracking-[0.3em]">Analyzing DNA</h4>
                       <p className="text-xs font-medium text-text-muted">Step {scanStep}/3: {scanStep === 1 ? 'Face Topology' : scanStep === 2 ? 'Biometric Sync' : 'Mapping Mesh'}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${viewMode}-avatar`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full"
                  >
                    {viewMode === '2d' ? (
                      <AvatarEngine mode={scanning ? 'scanning' : 'idle'} className="w-full h-full" />
                    ) : (
                      <Avatar3D className="w-full h-full" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simple Controls */}
            <div className="mt-auto relative z-20 flex flex-col items-center gap-6 w-full px-12">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFaceUpload}
              />
              <Button
                variant="primary"
                size="lg"
                icon={<ScanFace size={20} />}
                onClick={() => fileInputRef.current?.click()}
                loading={scanning}
                className="rounded-2xl w-full h-16 text-lg font-bold shadow-xl shadow-primary/10"
              >
                {userBody.faceImageUrl ? 'Update Profile' : 'Initiate 2D Scan'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Measurements & Style DNA */}
        <div className="space-y-8">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-heading font-bold flex items-center gap-3">
                <Ruler className="text-primary" size={20} />
                Biometric Precision
              </h3>
              <Badge variant="primary">Verified</Badge>
            </div>
            
            <div className="space-y-8">
              {measurements.map((m) => (
                <div key={m.key} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">{m.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold text-primary">{m.value}</span>
                      <span className="text-xs font-bold text-text-muted">{m.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={m.min}
                    max={m.max}
                    value={m.value}
                    onChange={(e) => updateMeasurement(m.key, Number(e.target.value))}
                    className="w-full h-2 bg-surface-alt rounded-full appearance-none cursor-pointer
                      accent-primary hover:accent-primary-light transition-all"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-heading font-bold flex items-center gap-3 mb-8">
              <User className="text-primary" size={20} />
              Style DNA Architecture
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {styleOptions.map((style) => {
                const active = styleDNA.preferredStyles.includes(style.value);
                return (
                  <motion.button
                    key={style.value}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleStyle(style.value)}
                    className={`
                      flex flex-col items-center gap-2 p-5 rounded-[1.5rem]
                      border-2 cursor-pointer transition-all duration-300
                      ${active
                        ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                        : 'border-border-light bg-surface hover:border-primary/20 hover:bg-surface-alt text-text-secondary'
                      }
                    `}
                  >
                    <span className="text-2xl mb-1">{style.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-tighter">{style.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
