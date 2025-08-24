import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { QueryProvider } from '@/contexts/QueryProvider';

// Layout Components - Optimized with performance improvements
import Header from '@/components/layout/Header';
import { SkipLink } from '@/components/layout/AccessibilityProvider';
import { GlobalLoadingOverlay } from '@/components/ui/global-loading-overlay.tsx';
import { PerformanceProvider } from '@/components/providers';

// Main Pages - Lazy loaded for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const SwimsuitPage = lazy(() => import('@/pages/SwimsuitPage'));
const CharacterListPage = lazy(() => import('@/pages/CharacterListPage'));
const CharacterDetailPage = lazy(() => import('@/pages/CharacterDetailPage'));
const AccessoryPage = lazy(() => import('@/pages/AccessoryPage'));
const SkillsPage = lazy(() => import('@/pages/SkillsPage'));
const DecorateBromidePage = lazy(() => import('@/pages/DecorateBromidePage'));
const ItemsPage = lazy(() => import('@/pages/ItemsPage'));
const FestivalPage = lazy(() => import('@/pages/FestivalPage'));
const GachaPage = lazy(() => import('@/pages/GachaPage'));
const MemoriesPage = lazy(() => import('@/pages/MemoriesPage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const DocumentPage = lazy(() => import('@/pages/DocumentPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Enhanced Loading Component with better scroll optimization
function EnhancedLoadingFallback() {
  return (
    <div className="page-transition content-container flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      {/* Optimized loading spinner */}
      <div className="w-12 h-12 border-3 border-muted/30 border-t-accent-cyan rounded-full animate-spin scroll-optimized"></div>

      {/* Loading text with consistent styling */}
      <div className="text-muted-foreground font-medium">Loading page...</div>

      {/* Subtle loading indicator */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-accent-cyan/60 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  // Use theme hook to handle theme application
  useTheme();

  return (
    <QueryProvider>
      <PerformanceProvider>
        <Router>
          <div className="min-h-screen bg-background font-sans antialiased">
            {/* Skip Links for Accessibility */}
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <SkipLink href="#header-nav">Skip to navigation</SkipLink>

                {/* Enhanced Background Pattern*/}
                <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/8 via-accent-cyan/8 to-accent-purple/8" />
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(233, 30, 99, 0.08) 0%, transparent 25%),
                                     radial-gradient(circle at 75% 75%, rgba(0, 188, 212, 0.08) 0%, transparent 25%)`
                  }} />
                </div>

                {/* Header Navigation */}
                <Header />
                
                {/* Main Content */}
                <main
                  id="main-content"
                  className="flex-1 overflow-x-hidden safe-area-inset content-container scroll-optimized"
                  style={{
                    scrollBehavior: 'smooth'
                  }}
                >
                  <div className="modern-container py-responsive page-transition">
                    <Suspense fallback={<EnhancedLoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/swimsuit" element={<SwimsuitPage />} />
                        <Route path="/characters" element={<CharacterListPage />} />
                        <Route path="/characters/:id" element={<CharacterDetailPage />} />
                        <Route path="/girls" element={<Navigate to="/characters" replace />} />
                        <Route path="/girls/:id" element={<Navigate to="/characters" replace />} />
                        <Route path="/skills" element={<SkillsPage />} />
                        <Route path="/decorate-bromide" element={<DecorateBromidePage />} />
                        <Route path="/accessory" element={<AccessoryPage />} />
                        <Route path="/memories" element={<MemoriesPage />} />
                        <Route path="/items" element={<ItemsPage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/festivals" element={<FestivalPage />} />
                        <Route path="/gacha" element={<GachaPage />} />
                        <Route path="/documents" element={<DocumentPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </div>
                </main>
                
                {/* Global Loading Overlay */}
                <GlobalLoadingOverlay />
          </div>
        </Router>
      </PerformanceProvider>
    </QueryProvider>
  );
}

export default App; 