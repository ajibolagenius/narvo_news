import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import NewsDetailPage from './pages/NewsDetailPage';
import BookmarksPage from './pages/BookmarksPage';
import VoiceStudioPage from './pages/VoiceStudioPage';
import MorningBriefingPage from './pages/MorningBriefingPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import DiscoverPage from './pages/DiscoverPage';
import OfflinePage from './pages/OfflinePage';
import SavedPage from './pages/SavedPage';
import AccountPage from './pages/AccountPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import AccessibilityPage from './pages/AccessibilityPage';
// Admin Pages
import OperationHubPage from './pages/admin/OperationHubPage';
import CurationConsolePage from './pages/admin/CurationConsolePage';
import VoiceManagementPage from './pages/admin/VoiceManagementPage';
import ModerationHubPage from './pages/admin/ModerationHubPage';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} duration={3500} />;
  }

  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
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
            </Route>
            {/* Admin routes with separate layout */}
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin/operations" element={<OperationHubPage />} />
              <Route path="/admin/curation" element={<CurationConsolePage />} />
              <Route path="/admin/voices" element={<VoiceManagementPage />} />
              <Route path="/admin/moderation" element={<ModerationHubPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
