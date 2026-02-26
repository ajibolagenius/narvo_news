import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LenisProvider } from './contexts/LenisProvider';
import { DownloadQueueProvider } from './contexts/DownloadQueueContext';
import { ContentSourcesProvider } from './contexts/ContentSourcesContext';
import { HapticAlertProvider } from './components/HapticAlerts';
import { BreakingNewsProvider } from './components/BreakingNews';
import DownloadQueueIndicator from './components/DownloadQueueIndicator';
import { TourGuideModal } from './components/TourGuideModal';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import Skeleton from './components/Skeleton';
import './App.css';

// Lazy load pages for fast initial load
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const VoiceStudioPage = lazy(() => import('./pages/VoiceStudioPage'));
const MorningBriefingPage = lazy(() => import('./pages/MorningBriefingPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const SystemSettingsPage = lazy(() => import('./pages/SystemSettingsPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const ListeningHistoryPage = lazy(() => import('./pages/ListeningHistoryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
// Admin Pages
const OperationHubPage = lazy(() => import('./pages/admin/OperationHubPage'));
const CurationConsolePage = lazy(() => import('./pages/admin/CurationConsolePage'));
const VoiceManagementPage = lazy(() => import('./pages/admin/VoiceManagementPage'));
const ModerationHubPage = lazy(() => import('./pages/admin/ModerationHubPage'));

// Minimal loading fallback - instant feel
const PageLoader = () => null;

function App() {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} duration={1500} />;
  }

  return (
    <HelmetProvider>
    <ThemeProvider>
    <LenisProvider>
    <AuthProvider>
      <AudioProvider>
      <DownloadQueueProvider>
      <ContentSourcesProvider>
      <BreakingNewsProvider>
        <HapticAlertProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <DownloadQueueIndicator />
            <TourGuideModal />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                {/* Dashboard routes with shared layout (header + sidebar + player) */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/news/:id" element={<NewsDetailPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/saved" element={<SavedPage />} />
                  <Route path="/voices" element={<VoiceStudioPage />} />
                  <Route path="/briefing" element={<MorningBriefingPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/offline" element={<OfflinePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/system" element={<SystemSettingsPage />} />
                  <Route path="/accessibility" element={<AccessibilityPage />} />
                  <Route path="/history" element={<ListeningHistoryPage />} />
                </Route>
                {/* Admin routes with separate layout */}
                <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route path="/admin/operations" element={<OperationHubPage />} />
                  <Route path="/admin/curation" element={<CurationConsolePage />} />
                  <Route path="/admin/voices" element={<VoiceManagementPage />} />
                  <Route path="/admin/moderation" element={<ModerationHubPage />} />
                </Route>
                {/* Error Pages */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Router>
        </HapticAlertProvider>
      </BreakingNewsProvider>
      </ContentSourcesProvider>
      </DownloadQueueProvider>
      </AudioProvider>
    </AuthProvider>
    </LenisProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
