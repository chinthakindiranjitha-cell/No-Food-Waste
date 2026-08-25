import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Verifying session..." height="py-24" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl text-center shadow-xs">
        <h2 className="text-xl font-bold text-rose-800 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-4">
          Your role (<span className="capitalize font-semibold">{user.role}</span>) does not have permission to view this section.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
