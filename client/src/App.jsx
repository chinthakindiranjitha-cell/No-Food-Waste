import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import AdminDashboard from './pages/AdminDashboard';
import AdminStats from './pages/AdminStats';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-slate-800 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home Route — visible to everyone */}
              <Route path="/" element={<Home />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Requester Routes — Requester only */}
              <Route
                path="/requests/new"
                element={
                  <ProtectedRoute allowedRoles={['requester']}>
                    <CreateRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/my"
                element={
                  <ProtectedRoute allowedRoles={['requester']}>
                    <MyRequests />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer Portal Route — Volunteer only */}
              <Route
                path="/volunteer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Routes — Admin only */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stats"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminStats />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-amber-100 py-6 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} No Food Waste Connect • Community Food Rescue Platform</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
