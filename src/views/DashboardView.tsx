import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DemoTip } from '../components/common/DemoTip';
import {
  Shirt, Sun, Palette, Luggage, Camera, Sparkles,
  ArrowRight, TrendingUp, CalendarDays,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ClothingCategory } from '../lib/types';
import { getWeatherByLocation } from '../lib/weather';

const categoryColors: Record<string, string> = {
  upper: '#4f46e5',
  lower: '#06b6d4',
  jacket: '#f59e0b',
  shoes: '#10b981',
  socks: '#ec4899',
  accessories: '#8b5cf6',
};

const categoryLabels: Record<string, string> = {
  upper: 'Upper Body',
  lower: 'Lower Body',
  jacket: 'Jackets',
  shoes: 'Footwear',
  socks: 'Socks',
  accessories: 'Accessories',
};

export function DashboardView() {
  const { state, dispatch } = useStore();
  const { wardrobe, styleDNA, weather } = state;

  // Fetch real weather on mount
  useEffect(() => {
    if (!weather) {
      getWeatherByLocation().then(weatherData => {
        dispatch({ type: 'SET_WEATHER', payload: weatherData });
      }).catch(err => {
        console.error('Failed to fetch weather:', err);
      });
    }
  }, [weather, dispatch]);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Category distribution
  const categoryCounts = wardrobe.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: categoryLabels[category as ClothingCategory] || category,
    value: count,
    color: categoryColors[category as ClothingCategory] || '#6b7280',
  }));

  // Recent items
  const recentItems = [...wardrobe]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 4);

  const quickActions = [
    { label: 'Daily Sync', icon: Sun, view: 'sync' as const, gradient: 'bg-[#ff7e5f]' },
    { label: 'Smart Suitcase', icon: Luggage, view: 'suitcase' as const, gradient: 'bg-[#6a11cb]' },
    { label: 'Live Mirror', icon: Camera, view: 'mirror' as const, gradient: 'bg-[#00c6ff]' },
    { label: 'Aura Analysis', icon: Sparkles, view: 'aura' as const, gradient: 'gradient-aura-sync' },
  ];

  return (
    <div className="space-y-8">
      <DemoTip
        id="welcome"
        message="Welcome to FitMirror! Start by adding items to your wardrobe, then explore AI-powered outfit suggestions."
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative"
      >
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <p className="text-primary font-black text-sm tracking-widest uppercase mb-4">{date}</p>
        <h1 className="text-6xl md:text-8xl font-heading font-black mb-6 tracking-tighter">
          {greeting}, <span className="text-text-secondary font-medium italic">Stylist</span>
        </h1>
        <p className="text-text-secondary text-2xl font-extrabold max-w-3xl leading-relaxed">
          Your digital wardrobe is synchronized. <span className="text-primary font-black">{wardrobe.length}</span> high-fidelity pieces are ready for curation.
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Collection',
            value: wardrobe.length,
            sub: 'CURATED PIECES',
            icon: <Shirt size={22} />,
            color: 'text-primary',
          },
          {
            label: 'Atmosphere',
            value: weather ? `${weather.temp}°` : '72°',
            sub: weather ? weather.condition.toUpperCase() : 'OPTIMAL CONDITIONS',
            icon: <Sun size={22} />,
            color: 'text-accent-warm',
          },
          {
            label: 'Style Matrix',
            value: styleDNA.preferredStyles.length,
            sub: styleDNA.preferredStyles[0]?.toUpperCase() || 'DNA ACTIVE',
            icon: <Palette size={22} />,
            color: 'text-accent-cool',
          },
          {
            label: 'Resonance',
            value: '94%',
            sub: 'STYLE ALIGNMENT',
            icon: <TrendingUp size={22} />,
            color: 'text-success',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card hover className="relative overflow-hidden group border-0 shadow-lg bg-white/50 backdrop-blur-md">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {stat.icon}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`${stat.color} p-2 rounded-xl bg-surface-alt`}>{stat.icon}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-4xl font-heading font-bold mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-text-muted tracking-tighter">{stat.sub}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wardrobe Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
              <CalendarDays size={16} />
              Wardrobe Distribution
            </h3>
            {chartData.length > 0 ? (
              <div className="h-48 min-w-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e8eaed',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">
                Add items to see your distribution
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: action.view })}
                    className={`
                      ${action.gradient} p-5 rounded-2xl text-white text-left
                      cursor-pointer transition-shadow hover:shadow-lg
                    `}
                  >
                    <Icon size={24} className="mb-3 opacity-90" />
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-[10px] mt-1 opacity-70 flex items-center gap-1">
                      Explore <ArrowRight size={10} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Additions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary">Recent Additions</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'wardrobe' })}
          >
            View All <ArrowRight size={14} />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            >
              <Card hover padding="none" className="overflow-hidden">
                <div
                  className="h-36 flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)` }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shirt size={32} style={{ color: item.color }} className="opacity-50" />
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge>{item.category}</Badge>
                    <span
                      className="w-3 h-3 rounded-full border border-border-light"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
