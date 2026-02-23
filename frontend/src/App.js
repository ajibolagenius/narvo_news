import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import LoadingScreen from './components/LoadingScreen';
import AudioPlayer from './components/AudioPlayer';
import ProtectedRoute from './components/ProtectedRoute';
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
          <div className="pb-20">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/briefing" element={<ProtectedRoute><MorningBriefingPage /></ProtectedRoute>} />
              <Route path="/news/:id" element={<ProtectedRoute><NewsDetailPage /></ProtectedRoute>} />
              <Route path="/voices" element={<ProtectedRoute><VoiceStudioPage /></ProtectedRoute>} />
              <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <AudioPlayer />
          </div>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
