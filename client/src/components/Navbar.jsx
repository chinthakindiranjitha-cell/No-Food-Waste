import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartHandshake,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Shield,
  Bike,
  Utensils,
  PlusCircle,
  List,
  TrendingUp,
  Home as HomeIcon
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Shield className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'volunteer':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Bike className="w-3.5 h-3.5" /> Volunteer
          </span>
        );
      case 'requester':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Utensils className="w-3.5 h-3.5" /> Requester
          </span>
        );
    }
  };

  const navLinkClass = (path, color = 'amber') =>
    `text-sm font-semibold transition-colors flex items-center gap-1.5 ${
      isActive(path)
        ? `text-${color}-600 font-bold`
        : `text-slate-600 hover:text-${color}-600`
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight block">
                No Food Waste <span className="text-amber-600 font-extrabold">Connect</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase block -mt-0.5">
                Community Food Rescue
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Home — always visible */}
            <Link
              to="/"
              className={navLinkClass('/', 'amber')}
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>

            {/* === REQUESTER LINKS === */}
            {user?.role === 'requester' && (
              <>
                <Link
                  to="/requests/my"
                  className={navLinkClass('/requests/my', 'amber')}
                >
                  <List className="w-4 h-4" />
                  My Requests
                </Link>
                <Link
                  to="/requests/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-200 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-amber-700" />
                  New Request
                </Link>
              </>
            )}

            {/* === VOLUNTEER LINKS === */}
            {user?.role === 'volunteer' && (
              <Link
                to="/volunteer-dashboard"
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/volunteer-dashboard')
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <Bike className="w-4 h-4" />
                Volunteer Portal
              </Link>
            )}

            {/* === ADMIN LINKS === */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'text-rose-600 font-bold'
                      : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Portal
                </Link>
                <Link
                  to="/admin/stats"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/stats')
                      ? 'text-amber-600 font-bold'
                      : 'text-slate-600 hover:text-amber-600'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Stats
                </Link>
              </>
            )}

            {/* === USER INFO & LOGOUT / AUTH BUTTONS === */}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm border border-amber-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      {user.name}
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-amber-50 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-100 bg-white px-5 pt-4 pb-7 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2.5 text-base font-semibold text-slate-700 hover:text-amber-600"
          >
            <HomeIcon className="w-5 h-5" /> Home
          </Link>

          {/* Requester mobile links */}
          {user?.role === 'requester' && (
            <>
              <Link
                to="/requests/my"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-base font-semibold text-slate-700 hover:text-amber-600"
              >
                <List className="w-5 h-5" /> My Requests
              </Link>
              <Link
                to="/requests/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-base font-bold text-amber-700"
              >
                <PlusCircle className="w-5 h-5" /> + New Request
              </Link>
            </>
          )}

          {/* Volunteer mobile links */}
          {user?.role === 'volunteer' && (
            <Link
              to="/volunteer-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2.5 text-base font-bold text-indigo-700"
            >
              <Bike className="w-5 h-5" /> Volunteer Portal
            </Link>
          )}

          {/* Admin mobile links */}
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-base font-bold text-rose-700"
              >
                <Shield className="w-5 h-5" /> Admin Portal
              </Link>
              <Link
                to="/admin/stats"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-base font-bold text-amber-700"
              >
                <TrendingUp className="w-5 h-5" /> Stats & Analytics
              </Link>
            </>
          )}

          {user ? (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                  <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                </div>
              </div>

              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-2xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center text-sm font-bold text-white bg-amber-600 rounded-2xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
