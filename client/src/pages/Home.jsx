import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/api';
import {
  Utensils,
  Bike,
  Shield,
  PlusCircle,
  Clock,
  MapPin,
  Package,
  ChevronRight,
  RefreshCw,
  HeartHandshake,
  TrendingUp,
  List,
  CheckCircle2,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await requestService.getAllRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('[Home Page Stats Fetch Error]', err);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalRequests = requests.length;
  const deliveredCount = requests.filter(r => r.status === 'delivered' || r.status === 'collected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* ── ROLE-BASED WELCOME HERO BANNER ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-3xl">
          {/* User Role Badge */}
          {user ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-50 text-xs sm:text-sm font-bold uppercase tracking-wider">
              {user.role === 'admin' && <Shield className="w-4 h-4 text-rose-200" />}
              {user.role === 'volunteer' && <Bike className="w-4 h-4 text-indigo-200" />}
              {user.role === 'requester' && <Utensils className="w-4 h-4 text-amber-200" />}
              <span>
                {user.role === 'admin' && 'Admin Portal Account'}
                {user.role === 'volunteer' && 'Volunteer Partner Account'}
                {user.role === 'requester' && 'Food Requester & Donor Account'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-50 text-xs sm:text-sm font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-amber-100" />
              <span>Community Food Rescue Network</span>
            </div>
          )}

          {/* Dynamic Welcome Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {user ? (
              <>
                Welcome back, <span className="decoration-amber-300/60">{user.name}</span>! 
              </>
            ) : (
              <>Connecting Surplus Food with Hungry Neighbors</>
            )}
          </h1>

          {/* Role-Specific Subtitle & Description */}
          <p className="text-amber-50 text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
            {user?.role === 'admin' && (
              <>
                You are signed in as an <strong>Administrator</strong>. Access your dedicated portal to dispatch volunteers, review food requests, and analyze network impact statistics.
              </>
            )}
            {user?.role === 'volunteer' && (
              <>
                You are signed in as a <strong>Volunteer</strong>. Access your dedicated portal to accept nearby food pickup assignments, navigate delivery routes, and track your impact.
              </>
            )}
            {user?.role === 'requester' && (
              <>
                You are signed in as a <strong>Food Requester / Donor</strong>. Submit new food rescue requests in under 1 minute and track real-time pickup status.
              </>
            )}
            {!user && (
              <>
                No Food Waste Connect bridges surplus meals from local donors and restaurants to communities in need through rapid volunteer logistics.
              </>
            )}
          </p>

          {/* Role-Specific Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-base shadow-lg hover:bg-amber-50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Shield className="w-5 h-5 text-rose-600" />
                  Go to Admin Portal
                </Link>
                <Link
                  to="/admin/stats"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-800/60 hover:bg-amber-800/80 text-white font-bold text-base border border-amber-400/40 backdrop-blur-md transition-all cursor-pointer"
                >
                  <TrendingUp className="w-5 h-5 text-amber-300" />
                  View Stats &amp; Analytics
                </Link>
              </>
            )}

            {user?.role === 'volunteer' && (
              <Link
                to="/volunteer-dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-950 font-extrabold text-base sm:text-lg shadow-lg hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Bike className="w-6 h-6 text-indigo-600" />
                Go to Volunteer Portal
                <ArrowRight className="w-5 h-5 text-indigo-600 ml-1" />
              </Link>
            )}

            {user?.role === 'requester' && (
              <>
                <Link
                  to="/requests/new"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-amber-950 font-extrabold text-base shadow-lg hover:bg-amber-50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 text-amber-600" />
                  Submit New Food Request
                </Link>
                <Link
                  to="/requests/my"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-800/60 hover:bg-amber-800/80 text-white font-bold text-base border border-amber-400/40 backdrop-blur-md transition-all cursor-pointer"
                >
                  <List className="w-5 h-5 text-amber-300" />
                  View My Requests
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-amber-950 font-extrabold text-base shadow-lg hover:bg-amber-50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Get Started (Register)
                  <ArrowRight className="w-5 h-5 text-amber-600" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-800/60 hover:bg-amber-800/80 text-white font-bold text-base border border-amber-400/40 backdrop-blur-md transition-all cursor-pointer"
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── IMPACT COUNTERS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-none">
              {isLoading ? '...' : totalRequests}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Total Food Requests
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-900 leading-none">
              {isLoading ? '...' : deliveredCount}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Pickups Completed
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 font-bold">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-indigo-950 leading-none">
              Active
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Volunteer Network
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 font-bold">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-rose-950 leading-none">
              100%
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Verified Logistics
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS SECTION ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-bold uppercase tracking-wider inline-block">
            Seamless Rescue Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How No Food Waste Connect Works
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Three simple roles working together to reduce food waste and support local families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {/* Step 1 */}
          <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md mx-auto sm:mx-0">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
              <Utensils className="w-5 h-5 text-amber-600" /> Requester Posts Food
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Donors &amp; Requesters list excess cooked food, packaged goods, or fresh produce with quantity, pickup location, and time window.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md mx-auto sm:mx-0">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
              <Shield className="w-5 h-5 text-indigo-600" /> Admin Dispatches
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Administrators review request details, verify urgency, and assign available neighborhood volunteers for rapid pickup.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md mx-auto sm:mx-0">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
              <Bike className="w-5 h-5 text-emerald-600" /> Volunteer Delivers
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Volunteers navigate to the donor address, collect food, mark transit status, and safely hand off to community recipients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
