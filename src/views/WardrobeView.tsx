import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DemoTip } from '../components/common/DemoTip';
import {
  Upload, Shirt, Search, Trash2, Sparkles, X, ImagePlus
} from 'lucide-react';
import { analyzeClothing, generateStylingAdvice } from '../lib/gemini';
import type { WardrobeItem, ClothingCategory } from '../lib/types';

const categories: { value: ClothingCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Collection' },
  { value: 'upper', label: 'Upper' },
  { value: 'lower', label: 'Lower' },
  { value: 'jacket', label: 'Jackets' },
  { value: 'shoes', label: 'Footwear' },
  { value: 'socks', label: 'Socks' },
  { value: 'accessories', label: 'Accessories' },
];

export function WardrobeView() {
  const { state, dispatch } = useStore();
  const { wardrobe } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<ClothingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [howToWear, setHowToWear] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);

  // Debug: Log wardrobe state
  console.log('📦 Wardrobe items:', wardrobe.length);

  const filtered = wardrobe.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length });

    console.log(`📤 Processing ${fileArray.length} file(s)...`);

    const BATCH_SIZE = 3; // Process up to 3 images concurrently

    for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
      const batch = fileArray.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (file, index) => {
        try {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
          });

          let analysis;
          try {
            analysis = await analyzeClothing(dataUrl);
            if (!analysis) throw new Error("Analysis returned null");
          } catch (error) {
            analysis = {
              name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
              category: 'upper' as const,
              color: '#6b7280',
              tags: ['uploaded'],
              occasions: ['casual'],
              texture: 'Cotton',
              season: 'Spring',
              style: 'Casual'
            };
          }

          const newItem: WardrobeItem = {
            id: `item-${Date.now()}-${i + index}-${Math.random().toString(36).substring(7)}`,
            name: analysis.name,
            category: analysis.category as ClothingCategory,
            color: analysis.color,
            imageUrl: dataUrl,
            tags: analysis.tags || [],
            occasions: analysis.occasions || [],
            texture: analysis.texture,
            season: analysis.season,
            style: analysis.style,
            addedAt: new Date().toISOString().split('T')[0],
          };

          dispatch({ type: 'ADD_ITEM', payload: newItem });
          console.log(`✓ Added: ${newItem.name}`);
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
        } finally {
          setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }));
    }

    console.log(`✅ All files processed`);
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const openItemDetail = async (item: WardrobeItem) => {
    setSelectedItem(item);
    setHowToWear('');
    setLoadingAdvice(true);
    try {
      const advice = await generateStylingAdvice(item, state);
      setHowToWear(advice);
    } catch {
      setHowToWear('Deep styling analysis failed. Please verify your Gemini connection.');
    }
    setLoadingAdvice(false);
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <DemoTip
        id="wardrobe"
        message="Drag & drop clothing photos to add them. AI will automatically detect the type, color, and suggest occasions!"
      />

      {/* Storage Info */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-green-900">✓ Using IndexedDB Storage</p>
            <p className="text-xs text-green-700 mt-1">
              {wardrobe.length} item{wardrobe.length !== 1 ? 's' : ''} in your wardrobe
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600">Unlimited storage</p>
            <p className="text-xs text-green-600">Images saved securely</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-5xl font-heading font-bold">Personal Wardrobe</h1>
          <p className="text-text-secondary mt-2 text-lg font-medium">{wardrobe.length} high-fidelity pieces curated</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
          <Button
            size="lg"
            icon={<ImagePlus size={18} />}
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            className="rounded-2xl px-8 h-14 font-bold shadow-xl shadow-primary/20"
          >
            Ingest Clothing
          </Button>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all duration-500 cursor-pointer
          ${dragOver
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-2xl shadow-primary/5'
            : 'border-border-light bg-surface hover:border-primary/30 hover:bg-surface-alt'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
          <Upload size={28} className={dragOver ? 'text-primary' : 'text-text-muted'} />
        </div>
        <p className="text-lg font-bold text-text mb-1">
          {uploading ? `Analyzing ${uploadProgress.current}/${uploadProgress.total} items...` : 'Ingest Style Assets'}
        </p>
        <p className="text-sm text-text-secondary">Drag & drop high-res photos or click to browse (multiple files supported)</p>
        {uploading && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, tag, or aura..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white shadow-sm
              text-sm font-bold placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20
              transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <motion.button
              key={cat.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(cat.value)}
              className={`
                px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap
                cursor-pointer transition-all duration-300
                ${filter === cat.value
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-text-secondary hover:bg-surface-alt border border-border-light shadow-sm'
                }
              `}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
            >
              <Card
                hover
                padding="none"
                className="overflow-hidden group"
                onClick={() => openItemDetail(item)}
              >
                <div
                  className="h-44 relative flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${item.color}15, ${item.color}30)` }}
                >
                  {item.imageUrl && item.imageUrl !== '[BASE64_IMAGE]' ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        console.error('Failed to load image for:', item.name);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Shirt size={36} style={{ color: item.color }} className="opacity-40" />
                      {!item.imageUrl && <span className="text-xs text-text-muted">No image</span>}
                      {item.imageUrl === '[BASE64_IMAGE]' && <span className="text-xs text-text-muted">Image in session only</span>}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    flex items-end justify-center pb-3">
                    <span className="text-white text-xs font-medium flex items-center gap-1">
                      <Sparkles size={12} /> How to Wear
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge>{item.category}</Badge>
                    <span
                      className="w-3 h-3 rounded-full border border-border-light flex-shrink-0"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <Shirt size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-2">
            {wardrobe.length === 0 
              ? 'No items in your wardrobe yet' 
              : 'No items match your search'
            }
          </p>
          {wardrobe.length === 0 && (
            <p className="text-xs text-text-muted mb-4">
              Upload clothing photos to get started with AI-powered styling
            </p>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || ''}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-8 pb-4">
            {/* Image */}
            <div
              className="w-full h-80 rounded-3xl overflow-hidden flex items-center justify-center relative shadow-inner"
              style={{ background: `linear-gradient(135deg, ${selectedItem.color}08, ${selectedItem.color}15)` }}
            >
              {selectedItem.imageUrl ? (
                <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-contain p-8" />
              ) : (
                <Shirt size={64} style={{ color: selectedItem.color }} className="opacity-40" />
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant="primary" className="shadow-lg">{selectedItem.category}</Badge>
              </div>
            </div>

            {/* AI Insights Bar */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface-alt border border-border-light text-center">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Texture</span>
                <span className="text-sm font-bold text-text">{selectedItem.texture || 'Classic'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-alt border border-border-light text-center">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Season</span>
                <span className="text-sm font-bold text-text">{selectedItem.season || 'All'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-alt border border-border-light text-center">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Style</span>
                <span className="text-sm font-bold text-text">{selectedItem.style || 'Modern'}</span>
              </div>
            </div>

            {/* Tags & Occasions */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Style DNA Tags</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedItem.tags.map(tag => (
                    <Badge key={tag} className="bg-white border-border-light">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Occasion Fit</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedItem.occasions.map(o => (
                    <Badge key={o} variant="success" className="px-4 py-1.5">{o}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-primary/5 bg-primary/5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
                  style={{ background: selectedItem.color }}
                />
                <div>
                  <span className="text-xs font-bold text-text-muted uppercase block">Dominant Hue</span>
                  <span className="font-mono text-sm font-bold text-primary">{selectedItem.color}</span>
                </div>
              </div>
              <Sparkles className="text-primary animate-pulse-soft" size={20} />
            </div>

            {/* How to Wear - Fancy Upgrade */}
            <div className="pt-8 border-t border-border-light">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-heading font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  Styling Resonance
                </h4>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary">AI ANALYSIS</div>
              </div>

              <div className="glass-strong p-6 rounded-[2rem] border-primary/10">
                {loadingAdvice ? (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-text-muted animate-pulse">Consulting Gemini 1.5 Pro...</span>
                  </div>
                ) : (
                  <p className="text-base text-text-secondary leading-relaxed font-medium italic">
                    "{howToWear}"
                  </p>
                )}
              </div>
            </div>

            {/* Discard Action */}
            <div className="pt-6">
              <Button
                variant="danger"
                size="lg"
                icon={<Trash2 size={16} />}
                onClick={() => deleteItem(selectedItem.id)}
                className="w-full rounded-2xl h-14 font-bold text-sm"
              >
                Discard Clothing from Collection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
