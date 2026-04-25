import { motion } from 'motion/react';
import {
  LayoutDashboard,
  User,
  Shirt,
  CalendarDays,
  Luggage,
  Camera,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import type { View } from '../../lib/types';

interface SidebarProps {
  onLogout?: () => void;
  userName?: string;
}

const navItems: { view: View; icon: typeof LayoutDashboard; label: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { view: 'avatar', icon: User, label: 'Avatar' },
  { view: 'wardrobe', icon: Shirt, label: 'Wardrobe' },
  { view: 'sync', icon: CalendarDays, label: 'Daily Sync' },
  { view: 'suitcase', icon: Luggage, label: 'Suitcase' },
  { view: 'mirror', icon: Camera, label: 'Mirror' },
  { view: 'aura', icon: Sparkles, label: 'Aura' },
];

export function Sidebar({ onLogout, userName }: SidebarProps) {
  const { state, dispatch } = useStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col w-72 h-screen flex-shrink-0 z-40 bg-white border-r border-slate-200 py-10 px-6"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl tracking-tighter">F</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-heading">FitMirror</span>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = state.view === item.view;
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[15px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Mini - Like the screenshot */}
        <div className="mt-auto border-t border-slate-100 pt-8 px-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
               {state.userBody.faceImageUrl ? (
                 <img src={state.userBody.faceImageUrl} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400">
                   <User size={20} />
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{userName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">Premium Member</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav - Revamped */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50
          bg-surface/95 backdrop-blur-2xl border-t border-border
          flex items-center justify-around px-2 py-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = state.view === item.view;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.view}
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
              className={`
                relative flex flex-col items-center justify-center p-2
                cursor-pointer transition-all duration-300
                ${isActive
                  ? 'text-primary'
                  : 'text-text-muted'
                }
              `}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-glow"
                  className="absolute -inset-1 bg-primary/10 rounded-full blur-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.nav>
    </>
  );
}
