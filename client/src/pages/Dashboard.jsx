import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import {
  Utensils,
  Bike,
  Shield,
  PlusCircle,
  Clock,
  MapPin,
  Package,
  ChevronRight,
  Filter,
  RefreshCw,
  User as UserIcon
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Persona state (defaults to logged-in user's role, or 'requester')
  const [activePersona, setActivePersona] = useState(user?.role || 'requester');

  // Real data state from database
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Filter
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const fetchRealRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // If logged in as admin or volunteer or viewing overview, fetch all requests in database
      const res = await requestService.getAllRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('[Dashboard Request Fetch Error]', err);
      // Fallback if unauthenticated visitor views preview
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealRequests();
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter((req) => {
    if (selectedStatusFilter === 'all') return true;
    return req.status === selectedStatusFilter;
  });

  // Calculate live count statistics for admin overview
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const assignedCount = requests.filter(r => r.status === 'assigned' || r.status === 'accepted').length;
  const deliveredCount = requests.filter(r => r.status === 'delivered' || r.status === 'collected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Persona Switcher */}
      <div className="bg-white rounded-2xl border border-amber-100/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider">
              Live Database System
            </span>
            <span className="text-xs text-slate-400">
              User: <strong className="text-slate-700">{user?.name || 'Guest'}</strong> ({user?.role || 'visitor'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            No Food Waste Connect
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Connecting food donors, volunteers, and administrators to bridge surplus food to hungry neighbors seamlessly.
          </p>
        </div>

        {/* Persona Switcher Tabs */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex items-center self-start md:self-auto">
          <button
            onClick={() => setActivePersona('requester')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activePersona === 'requester'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            Requester Persona
          </button>
          <button
            onClick={() => setActivePersona('volunteer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activePersona === 'volunteer'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-indigo-600" />
            Volunteer Persona
          </button>
          <button
            onClick={() => setActivePersona('admin')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activePersona === 'admin'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            Admin Persona
          </button>
        </div>
      </div>

      {/* Filter and Refresh Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRealRequests}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-700 hover:bg-amber-100/50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            Refresh Requests ({requests.length} Total)
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Statuses ({requests.length})</option>
            <option value="pending">Pending (Yellow)</option>
            <option value="accepted">Accepted (Blue)</option>
            <option value="assigned">Assigned (Purple)</option>
            <option value="collected">Collected (Orange)</option>
            <option value="delivered">Delivered (Green)</option>
          </select>
        </div>
      </div>

      {/* 1. REQUESTER PERSONA VIEW */}
      {activePersona === 'requester' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Need to donate or request food rescue?</h2>
              <p className="text-amber-100 text-sm mt-1">Submit details in under 1 minute. Volunteers will handle pickup!</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/requests/my"
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-sm transition-colors"
              >
                View My Requests
              </Link>
              <Link
                to="/requests/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-amber-900 font-bold text-sm shadow-md hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-amber-600" />
                New Food Request
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Food Requests Queue</h3>
            <span className="text-xs text-slate-500">Real-time database records</span>
          </div>

          {isLoading ? (
            <LoadingState message="Fetching live food requests from database..." />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              title="No food requests in database"
              message="There are currently no food requests recorded in the system. Be the first to create a request!"
              actionLabel="Submit Food Request Now"
              onAction={() => window.location.href = '/requests/new'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRequests.map((req) => (
                <div key={req._id} className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{req.foodType}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(req.createdAt)}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>Quantity:</strong> {req.quantity} {req.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate"><strong>Address:</strong> {req.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>Window:</strong> {req.timeWindowStart ? `${formatDate(req.timeWindowStart)}` : 'Flexible'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 truncate max-w-[180px]">
                      Donor: {req.requesterId?.name || 'Anonymous User'}
                    </span>
                    <Link to="/requests/my" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                      My Timeline <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. VOLUNTEER PERSONA VIEW */}
      {activePersona === 'volunteer' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Bike className="w-4 h-4" /> Mobile Volunteer Dashboard
            </div>
            <h2 className="text-xl font-bold">Nearby Food Pickups & Deliveries</h2>
            <p className="text-indigo-100 text-sm mt-1">Scan real active requests and mark status updates on the go.</p>
          </div>

          {isLoading ? (
            <LoadingState message="Finding live volunteer assignments..." />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={Bike}
              title="No food requests available"
              message="There are no active food requests in the database matching your criteria right now."
              actionLabel="Refresh List"
              onAction={fetchRealRequests}
            />
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {filteredRequests.map((req) => (
                <div key={req._id} className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {req.requesterId?.name || 'Registered Donor'}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{req.foodType}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {req.quantity} {req.unit} • Created: {formatDate(req.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Pickup Address:</span>
                      <p className="text-slate-600">{req.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs text-center transition-colors shadow-2xs cursor-pointer">
                      Accept Pickup
                    </button>
                    <button className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center transition-colors cursor-pointer">
                      View Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ADMIN PERSONA VIEW (Shows ALL actual user requests) */}
      {activePersona === 'admin' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4" /> Operations Overview (Live Database)
              </div>
              <h2 className="text-xl font-bold">Admin Dispatch & All User Requests</h2>
              <p className="text-slate-400 text-sm mt-1">Scan requests fast and dispatch volunteers with minimal clicks.</p>
            </div>
            <div className="flex gap-3 text-center self-start sm:self-auto">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[90px]">
                <div className="text-xl font-bold text-amber-400">{pendingCount}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Pending</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[90px]">
                <div className="text-xl font-bold text-purple-400">{assignedCount}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Active</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[90px]">
                <div className="text-xl font-bold text-emerald-400">{deliveredCount}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Delivered</div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingState message="Loading live operational dispatch queue from database..." />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No requests in database"
              message="No food requests from actual users have been submitted yet."
              actionLabel="Refresh Requests"
              onAction={fetchRealRequests}
            />
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div key={req._id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{req.foodType}</h4>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>Requester:</strong> {req.requesterId?.name || 'User'} ({req.requesterId?.email || 'N/A'}) • <strong>Qty:</strong> {req.quantity} {req.unit} • <strong>Loc:</strong> {req.pickupAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors cursor-pointer">
                      Assign Volunteer
                    </button>
                    <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer">
                      View Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
