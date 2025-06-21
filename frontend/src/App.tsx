import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '@/services/useTheme';
import { DocumentsProvider } from '@/contexts/DocumentsContext';

// Layout Components - Optimized with performance improvements
import Header from '@/components/layout/Header';
import { AccessibilityProvider, SkipLink } from '@/components/layout/AccessibilityProvider';
import { UpdateLogsProvider } from '@/contexts/UpdateLogsContext';

// Main Pages - Lazy loaded for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const SwimsuitPage = lazy(() => import('@/pages/SwimsuitPage'));
const GirlListPage = lazy(() => import('@/pages/GirlListPage'));
const GirlDetailPage = lazy(() => import('@/pages/GirlDetailPage'));
const AccessoryPage = lazy(() => import('@/pages/AccessoryPage'));
const SkillsPage = lazy(() => import('@/pages/SkillsPage'));
const DecorateBromidePage = lazy(() => import('@/pages/DecorateBromidePage'));
const OwnerRoomPage = lazy(() => import('@/pages/OwnerRoomPage'));
const ItemsPage = lazy(() => import('@/pages/ItemsPage'));
const FestivalPage = lazy(() => import('@/pages/FestivalPage'));
const GachaPage = lazy(() => import('@/pages/GachaPage'));
const MemoriesPage = lazy(() => import('@/pages/MemoriesPage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const DocumentPage = lazy(() => import('@/pages/DocumentPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Loading component with optimized styling
function LoadingFallback() {
  return (
    <div className="viewport-optimized flex items-center justify-center min-h-[60vh]">
      <div className="loading doax-card p-8 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-accent-pink/20 border-t-accent-pink mx-auto mb-4 animate-spin"></div>
        <p className="text-muted-foreground">Loading content...</p>
      </div>
    </div>
  );
}

function App() {
  // Use theme hook to handle theme application
  useTheme();

  return (
    <DocumentsProvider>
      <AccessibilityProvider>
        <UpdateLogsProvider>
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
                className="flex-1 overflow-x-hidden"
                style={{
                  scrollBehavior: 'smooth'
                }}
              >
                <div className="container mx-auto px-4 py-6">
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/home" replace />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/swimsuit" element={<SwimsuitPage />} />
                      <Route path="/girls" element={<GirlListPage />} />
                      <Route path="/girls/:id" element={<GirlDetailPage />} />
                      <Route path="/skills" element={<SkillsPage />} />
                      <Route path="/decorate-bromide" element={<DecorateBromidePage />} />
                      <Route path="/accessory" element={<AccessoryPage />} />
                      <Route path="/memories" element={<MemoriesPage />} />
                      <Route path="/owner-room" element={<OwnerRoomPage />} />
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
            </div>
          </Router>
        </UpdateLogsProvider>
      </AccessibilityProvider>
    </DocumentsProvider>
  );
}

export default App; 