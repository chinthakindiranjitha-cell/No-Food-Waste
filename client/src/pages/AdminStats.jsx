import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService, statsService } from '../services/api';
import StatsPanel from '../components/StatsPanel';
import LoadingState from '../components/LoadingState';
import {
  Shield,
  RefreshCw,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  UserCheck,
  Package,
  XCircle,
  TrendingUp
} from 'lucide-react';

const StatCard = ({ label, value, colorClass, icon: Icon }) => (
  <div className={`bg-white rounded-2xl border pt-5 pb-6 shadow-xs flex items-center gap-4 ${colorClass}`}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-current/10">
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <div className="text-3xl font-black leading-none">{value}</div>
      <div className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-70 mt-1">{label}</div>
    </div>
  </div>
);

const AdminStats = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatsData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [reqRes, statsRes] = await Promise.all([
        requestService.getAllRequests(),
        statsService.getGlobalStats().catch((e) => {
          console.warn('[AdminStats] Fallback stats:', e);
          return { success: false };
        })
      ]);

      if (reqRes.success) setRequests(reqRes.requests || []);
      if (statsRes?.success) setGlobalStats(statsRes.stats);
    } catch (err) {
      console.error('[AdminStats] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    assigned: requests.filter((r) => r.status === 'assigned').length,
    collected: requests.filter((r) => r.status === 'collected').length,
    delivered: requests.filter((r) => r.status === 'delivered').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>
        <span className="text-xs font-semibold text-slate-400">
          Admin Portal • Analytics
        </span>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4" /> System Analytics &amp; Statistics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Food Rescue Impact Overview
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            Real-time metric breakdown across all requests, volunteers, and delivery stages.
          </p>
        </div>

        <button
          onClick={() => fetchStatsData(true)}
          disabled={isRefreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold text-sm transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing…' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Stat Cards Grid */}
      {isLoading ? (
        <LoadingState message="Calculating real-time statistics..." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <StatCard label="Total" value={stats.total} icon={FileText} colorClass="border-slate-200 text-slate-800" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} colorClass="border-amber-200 text-amber-700" />
            <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle} colorClass="border-blue-200 text-blue-700" />
            <StatCard label="Assigned" value={stats.assigned} icon={UserCheck} colorClass="border-purple-200 text-purple-700" />
            <StatCard label="Collected" value={stats.collected} icon={Package} colorClass="border-orange-200 text-orange-700" />
            <StatCard label="Delivered" value={stats.delivered} icon={Package} colorClass="border-emerald-200 text-emerald-700" />
            <StatCard label="Rejected" value={stats.rejected} icon={XCircle} colorClass="border-rose-200 text-rose-700" />
          </div>

          {/* Detailed Recharts Visual Stats */}
          <StatsPanel statsData={globalStats} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default AdminStats;
