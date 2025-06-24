import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { DocumentsProvider } from '@/contexts/DocumentsContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

// Layout Components - Optimized with performance improvements
import Header from '@/components/layout/Header';
import { AccessibilityProvider, SkipLink } from '@/components/layout/AccessibilityProvider';
import { UpdateLogsProvider } from '@/contexts/UpdateLogsContext';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';

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

// Simple Loading Component
function EnhancedLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      {/* Simple spinning circle */}
      <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      
      {/* Loading text */}
      <div className="text-gray-600 font-medium">Loading...</div>
    </div>
  );
}



function App() {
  // Use theme hook to handle theme application
  useTheme();

  return (
    <LoadingProvider>
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
                  <Suspense fallback={<EnhancedLoadingFallback />}>
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
              
              {/* Global Loading Overlay */}
              <GlobalLoadingOverlay />
            </div>
            </Router>
          </UpdateLogsProvider>
        </AccessibilityProvider>
      </DocumentsProvider>
    </LoadingProvider>
  );
}

export default App; 