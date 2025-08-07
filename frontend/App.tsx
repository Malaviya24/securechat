import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import HomePage from './pages/HomePage';
import ChatRoom from './pages/ChatRoom';

export default function App() {
  useEffect(() => {
    // Set default theme
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-gray-100 light:via-blue-50 light:to-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}
