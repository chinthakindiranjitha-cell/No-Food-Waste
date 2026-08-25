import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-slate-800 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Main Dashboard Route */}
              <Route path="/" element={<Dashboard />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-amber-100 py-6 text-center text-xs text-slate-400">
            <p>© {new Date().getFullYear()} No Food Waste Connect • Hackathon Initial Build</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
