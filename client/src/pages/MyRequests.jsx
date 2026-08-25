import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { requestService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { PlusCircle, Utensils, MapPin, Clock, CheckCircle2, Package, RefreshCw } from 'lucide-react';

const MyRequests = () => {
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(location.state?.message || null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestService.getMyRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load your food requests. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast banner from navigation */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Utensils className="w-3.5 h-3.5" /> Donor Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Food Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track real-time progress of your food donations from submission to delivery.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchRequests}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <Link
            to="/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Request
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Loading your submitted requests..." height="py-20" />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs"
          >
            Try Again
          </button>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No food requests yet"
          message="You haven't submitted any food donation requests yet. Start your first request in under a minute!"
          actionLabel="Submit Food Request"
          onAction={() => window.location.href = '/requests/new'}
        />
      ) : (
        <div className="space-y-5">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-amber-100/90 p-6 shadow-xs hover:shadow-md transition-shadow space-y-5"
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{req.foodType}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                      <Package className="w-3.5 h-3.5" />
                      {req.quantity} {req.unit}
                    </span>
                    <span>Created: {formatDate(req.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <StatusBadge status={req.status} className="text-xs px-3 py-1" />
                </div>
              </div>

              {/* Card Middle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Pickup Address:</span>
                    <p className="text-slate-600 mt-0.5">{req.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Time Window:</span>
                    <p className="text-slate-600 mt-0.5">
                      {req.timeWindowStart ? `${formatDate(req.timeWindowStart)} - ${formatDate(req.timeWindowEnd)}` : 'Flexible'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline Bar */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Lifecycle Progress
                </span>
                <StatusTimeline status={req.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
