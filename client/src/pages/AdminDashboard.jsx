import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService, volunteerService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import MapView from '../components/MapView';
import BatchSuggestionsPanel from '../components/BatchSuggestionsPanel';
import UrgencyBadge, { getCardUrgencyStyles, getUrgencyInfo } from '../components/UrgencyBadge';
import {
  Shield,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  X,
  Package,
  MapPin,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  AlertOctagon,
  Flame,
  Search,
  Map as MapIcon,
  List as ListIcon,
  TrendingUp,
  FileText
} from 'lucide-react';

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, colorClass, icon: Icon }) => (
  <div className={`bg-white rounded-2xl border pt-5 pb-5 shadow-xs flex items-center gap-4 ${colorClass}`}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-current/10">
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <div className="text-3xl font-black leading-none">{value}</div>
      <div className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-70 mt-1">{label}</div>
    </div>
  </div>
);




// ─── Volunteer Assignment Modal ───────────────────────────────────────────────
const AssignModal = ({ request, volunteers, onAssign, onClose, isAssigning }) => {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [search, setSearch] = useState('');

  const filtered = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <UserCheck className="w-3.5 h-3.5" /> Assign Volunteer
            </div>
            <h3 className="font-bold text-base leading-tight">{request.foodType}</h3>
            <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {request.pickupAddress}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors mt-0.5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
            />
          </div>
        </div>

        {/* Volunteer List */}
        <div className="p-4 max-h-64 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              {volunteers.length === 0
                ? 'No volunteers registered yet.'
                : 'No volunteers match your search.'}
            </div>
          ) : (
            filtered.map((vol) => (
              <label
                key={vol._id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedVolunteerId === vol._id
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="volunteer"
                  value={vol._id}
                  checked={selectedVolunteerId === vol._id}
                  onChange={() => setSelectedVolunteerId(vol._id)}
                  className="accent-amber-500"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">{vol.name}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {vol.email}
                    </span>
                    {vol.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {vol.phone}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(selectedVolunteerId)}
            disabled={!selectedVolunteerId || isAssigning}
            className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAssigning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Assigning…
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" /> Confirm Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold animate-fade-in ${
        type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 shrink-0" />
      )}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Status Filter Pills ──────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: 'critical', label: '🚨 Critical Requests' },
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'collected', label: 'Collected' },
  { value: 'delivered', label: 'Delivered' },
];

// ─── Main AdminDashboard Component ───────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [criticalRequests, setCriticalRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal state
  const [assignModalRequest, setAssignModalRequest] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Per-row action loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const dismissToast = () => setToast(null);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const [reqRes, volRes, critRes] = await Promise.all([
          requestService.getAllRequests(),
          volunteerService.getAvailable(),
          requestService.getCriticalRequests()
        ]);
        if (reqRes.success) setRequests(reqRes.requests || []);
        if (volRes.success) setVolunteers(volRes.volunteers || []);
        if (critRes.success) setCriticalRequests(critRes.requests || []);
      } catch (err) {
        console.error('[AdminDashboard] Fetch error:', err);
        showToast('Failed to load data. Please refresh.', 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Accept or Reject a request
  const handleStatusChange = async (requestId, newStatus) => {
    setActionLoadingId(requestId);
    try {
      const res = await requestService.updateStatus(requestId, newStatus);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r._id === requestId ? { ...r, status: newStatus } : r
          )
        );
        setCriticalRequests((prev) =>
          prev.filter((r) => r._id !== requestId || newStatus === 'accepted')
        );
        showToast(res.message || `Request ${newStatus}.`, 'success');
      }
    } catch (err) {
      console.error('[AdminDashboard] Status update error:', err);
      showToast(
        err?.response?.data?.message || 'Failed to update status.',
        'error'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open assign modal
  const openAssignModal = (request) => {
    setAssignModalRequest(request);
  };

  // Confirm volunteer assignment
  const handleAssign = async (volunteerId) => {
    if (!assignModalRequest) return;
    setIsAssigning(true);
    try {
      const res = await requestService.assignVolunteer(assignModalRequest._id, volunteerId);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r._id === assignModalRequest._id ? { ...r, status: 'assigned' } : r
          )
        );
        setCriticalRequests((prev) => prev.filter((r) => r._id !== assignModalRequest._id));
        showToast(res.message || 'Volunteer assigned!', 'success');
        setAssignModalRequest(null);
      }
    } catch (err) {
      console.error('[AdminDashboard] Assign error:', err);
      showToast(
        err?.response?.data?.message || 'Failed to assign volunteer.',
        'error'
      );
    } finally {
      setIsAssigning(false);
    }
  };


  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    assigned: requests.filter((r) => r.status === 'assigned').length,
    collected: requests.filter((r) => r.status === 'collected').length,
    delivered: requests.filter((r) => r.status === 'delivered').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  // Compute pending/accepted critical items dynamically
  const activeCriticalItems = requests.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'accepted') &&
      getUrgencyInfo(r).urgencyLevel === 'critical'
  );

  const filteredRequests =
    statusFilter === 'critical'
      ? activeCriticalItems.sort((a, b) => new Date(a.expiresAt || a.createdAt) - new Date(b.expiresAt || b.createdAt))
      : requests.filter((r) => statusFilter === 'all' || r.status === statusFilter);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" /> Admin Portal • Operations Dispatch
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Dispatch &amp; Request Management
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Signed in as <span className="text-white font-semibold">{user?.name}</span> ({user?.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/stats"
              className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-slate-950" />
              View Stats &amp; Analytics
            </Link>

            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold text-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Critical Urgency Top Alert Banner ── */}
      {activeCriticalItems.length > 0 && statusFilter !== 'critical' && (
        <div className="bg-rose-500 text-white p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base uppercase tracking-wider">
                🚨 {activeCriticalItems.length} Urgent Food Request{activeCriticalItems.length > 1 ? 's' : ''} Expiring Soon!
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Food safety window is near expiration (&lt;20% window left or expired). Immediate action or volunteer assignment required.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter('critical')}
            className="px-4 py-2.5 bg-white text-rose-700 font-extrabold text-xs rounded-xl hover:bg-rose-100 transition-all shadow-md shrink-0 cursor-pointer"
          >
            View Critical Requests Now
          </button>
        </div>
      )}

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={stats.total} icon={FileText} colorClass="border-slate-200 text-slate-800" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} colorClass="border-amber-200 text-amber-700" />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle} colorClass="border-blue-200 text-blue-700" />
        <StatCard label="Assigned" value={stats.assigned} icon={UserCheck} colorClass="border-purple-200 text-purple-700" />
        <StatCard label="Collected" value={stats.collected} icon={Package} colorClass="border-orange-200 text-orange-700" />
        <StatCard label="Delivered" value={stats.delivered} icon={Package} colorClass="border-emerald-200 text-emerald-700" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} colorClass="border-rose-200 text-rose-700" />
      </div>

      {/* ── Batch Suggestions Panel ── */}
      <BatchSuggestionsPanel
        volunteers={volunteers}
        onBatchAssigned={() => fetchData(true)}
      />

      {/* ── Filter Bar & View Toggle ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === f.value
                  ? f.value === 'critical'
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                    : 'bg-slate-800 text-white shadow-sm'
                  : f.value === 'critical'
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
              {f.value === 'critical' && activeCriticalItems.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-700 text-white text-[10px]">
                  {activeCriticalItems.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: List vs Map */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" /> List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Map View
          </button>
        </div>
      </div>

      {/* ── Requests Display: Map View or Card List ── */}
      {isLoading ? (
        <LoadingState message="Loading food requests from database..." />
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <MapView
            requests={filteredRequests}
            title={`Active Food Requests Map (${filteredRequests.length} Showing)`}
            height="520px"
          />
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No requests found"
          message={
            statusFilter === 'critical'
              ? 'Great news! No pending or accepted requests are currently in critical urgency.'
              : statusFilter !== 'all'
              ? `No food requests with status "${statusFilter}" in the database.`
              : 'No food requests have been submitted yet.'
          }
          actionLabel="Clear Filter"
          onAction={() => setStatusFilter('all')}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isActionLoading = actionLoadingId === req._id;
            const isPending = req.status === 'pending';
            const isAccepted = req.status === 'accepted';

            return (
              <div
                key={req._id}
                className={`bg-white rounded-2xl p-4 sm:p-5 transition-all ${getCardUrgencyStyles(req)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {req.foodType}
                        </h3>
                        <UrgencyBadge request={req} />
                        <StatusBadge status={req.status} />
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          <span className="font-semibold text-slate-700">Requester:</span>{' '}
                          {req.requesterId?.name || 'Unknown'} ({req.requesterId?.email || '—'})
                        </span>
                        <span>
                          <span className="font-semibold text-slate-700">Qty:</span>{' '}
                          {req.quantity} {req.unit}
                        </span>
                        <span className="flex items-center gap-1 max-w-xs truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-amber-500" />
                          {req.pickupAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0 text-slate-400" />
                          {formatDate(req.createdAt)}
                        </span>
                        {req.timeWindowStart && (
                          <span>
                            <span className="font-semibold text-slate-700">Window:</span>{' '}
                            {formatDate(req.timeWindowStart)}
                            {req.timeWindowEnd && ` – ${formatDate(req.timeWindowEnd)}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 lg:ml-4">
                    {/* Accept — shown when pending */}
                    {isPending && (
                      <button
                        onClick={() => handleStatusChange(req._id, 'accepted')}
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        {isActionLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Accept
                      </button>
                    )}

                    {/* Reject — shown when pending or accepted */}
                    {(isPending || isAccepted) && (
                      <button
                        onClick={() => handleStatusChange(req._id, 'rejected')}
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        {isActionLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Reject
                      </button>
                    )}

                    {/* Assign Volunteer — shown when accepted */}
                    {isAccepted && (
                      <button
                        onClick={() => openAssignModal(req)}
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Assign Volunteer
                      </button>
                    )}

                    {/* Status label for non-actionable states */}
                    {!isPending && !isAccepted && (
                      <span className="text-xs text-slate-400 font-medium italic">
                        No actions available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Assign Volunteer Modal ── */}
      {assignModalRequest && (
        <AssignModal
          request={assignModalRequest}
          volunteers={volunteers}
          onAssign={handleAssign}
          onClose={() => setAssignModalRequest(null)}
          isAssigning={isAssigning}
        />
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
    </div>
  );
};

export default AdminDashboard;

