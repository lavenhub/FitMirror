import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ViewTransition } from './components/layout/ViewTransition';
import { DashboardView } from './views/DashboardView';
import { AvatarView } from './views/AvatarView';
import { WardrobeView } from './views/WardrobeView';
import { AuraView } from './views/AuraView';
import { MirrorView } from './views/MirrorView';
import { SyncView } from './views/SyncView';
import { SuitcaseView } from './views/SuitcaseView';
import { LoginPage } from './components/auth/LoginPage';
import { StoreProvider, useStore } from './lib/store';
import { AnimatePresence, motion } from 'motion/react';
import { FrameSequencePlayer } from './components/ui/FrameSequencePlayer';

const AUTH_STORAGE_KEY = 'fitmirror-auth';

function AppContent() {
  const { state } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: { email: string; name: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading FitMirror...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (state.view) {
      case 'dashboard': return <DashboardView />;
      case 'avatar': return <AvatarView />;
      case 'wardrobe': return <WardrobeView />;
      case 'aura': return <AuraView />;
      case 'mirror': return <MirrorView />;
      case 'sync': return <SyncView />;
      case 'suitcase': return <SuitcaseView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div 
      className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-body relative"
      style={{ 
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px),
          linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '10cm 10cm, 10cm 10cm, 1cm 1cm, 1cm 1cm',
        backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
      }}
    >
      <Sidebar onLogout={handleLogout} userName={user?.name} />
      <main className="flex-1 min-w-0 h-full overflow-y-auto pb-20 relative z-10">
        <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <ViewTransition viewKey={state.view}>
              {renderView()}
            </ViewTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
