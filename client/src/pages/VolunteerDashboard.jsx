import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { volunteerService, assignmentService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import MapView from '../components/MapView';
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  User as UserIcon,
  Phone,
  RefreshCw,
  Power,
  Check,
  Truck,
  AlertCircle,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user, checkAuthStatus } = useAuth();

  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await assignmentService.getMyAssignments();
      if (res.success) {
        setAssignments(res.assignments || []);
      }
    } catch (err) {
      console.error('[VolunteerDashboard Fetch Error]', err);
      setError(err.response?.data?.message || 'Failed to load assigned pickups');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    if (typeof user?.isAvailable === 'boolean') {
      setIsAvailable(user.isAvailable);
    }
  }, [user]);

  const handleToggleAvailability = async () => {
    setIsTogglingAvailability(true);
    try {
      const nextState = !isAvailable;
      const res = await volunteerService.toggleAvailability(nextState);
      if (res.success) {
        setIsAvailable(res.isAvailable);
        // Refresh auth context so navbar or app state updates
        if (checkAuthStatus) {
          checkAuthStatus();
        }
      }
    } catch (err) {
      console.error('[Toggle Availability Error]', err);
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleUpdateStatus = async (assignmentId, newStatus) => {
    setUpdatingId(assignmentId);
    try {
      const res = await assignmentService.updateStatus(assignmentId, newStatus);
      if (res.success) {
        // Update state locally
        setAssignments((prev) =>
          prev.map((item) => (item._id === assignmentId ? res.assignment : item))
        );
      }
    } catch (err) {
      console.error('[Update Status Error]', err);
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Flexible';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAssignments = assignments.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const totalAssigned = assignments.length;
  const pendingPickup = assignments.filter((a) => a.status === 'assigned').length;
  const inTransit = assignments.filter((a) => a.status === 'collected').length;
  const completed = assignments.filter((a) => a.status === 'delivered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Availability Toggle */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Bike className="w-3.5 h-3.5" /> Volunteer Portal
            </span>
            <span className="text-xs text-slate-400">
              Logged in as <strong className="text-slate-700">{user?.name}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Pickup & Delivery Assignments
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Manage your food rescue route, mark collected packages, and confirm deliveries to support the community.
          </p>
        </div>

        {/* Availability Toggle Switch */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between gap-4 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-colors ${
                isAvailable ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-slate-400'
              }`}
            >
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Duty Status
              </div>
              <div className="text-sm font-bold text-slate-800">
                {isAvailable ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Available for Missions
                  </span>
                ) : (
                  <span className="text-slate-500">Unavailable / Off Duty</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={isTogglingAvailability}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
            } ${isTogglingAvailability ? 'opacity-50' : ''}`}
            role="switch"
            aria-checked={isAvailable}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAvailable ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pickups</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{totalAssigned}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to you</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
          <div className="text-amber-600 text-xs font-semibold uppercase tracking-wider">Pending Pickup</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingPickup}</div>
          <div className="text-[11px] text-amber-700/70 mt-0.5">Ready to collect</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200/80 shadow-2xs">
          <div className="text-indigo-600 text-xs font-semibold uppercase tracking-wider">In Transit</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{inTransit}</div>
          <div className="text-[11px] text-indigo-700/70 mt-0.5">Collected food</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">Delivered</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completed}</div>
          <div className="text-[11px] text-emerald-700/70 mt-0.5">Successfully rescued</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAssignments}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-indigo-900 hover:bg-indigo-100/50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh Assignments
          </button>
        </div>

        {/* View Mode Toggle: List vs Map */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80">
            {[
              { id: 'all', label: `All (${totalAssigned})` },
              { id: 'assigned', label: `Assigned (${pendingPickup})` },
              { id: 'collected', label: `In Transit (${inTransit})` },
              { id: 'delivered', label: `Delivered (${completed})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Area: Map View or List View */}
      {isLoading ? (
        <LoadingState message="Fetching your assigned food pickups..." />
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <MapView
            requests={filteredAssignments.map((a) => ({
              ...a.requestId,
              _id: a.requestId?._id || a._id,
              status: a.status
            }))}
            userLocation={user?.location}
            title={`Volunteer Pickup & Route Map (${filteredAssignments.length} Pickups)`}
            height="500px"
          />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={Bike}
          title="No assignments found"
          message={
            statusFilter === 'all'
              ? "You don't have any active food pickup assignments yet. Ask an admin to assign a food request to you!"
              : `No food pickups match the "${statusFilter}" status filter.`
          }
          actionLabel="Refresh List"
          onAction={fetchAssignments}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssignments.map((assignment) => {
            const reqData = assignment.requestId || {};
            const isUpdating = updatingId === assignment._id;

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header: Food Type & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-md inline-block mb-1">
                        Assignment #{assignment._id.slice(-6)}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">{reqData.foodType || 'Food Items'}</h3>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </div>

                  {/* Details Grid */}
                  <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4 space-y-3 text-xs text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900">Quantity:</span>{' '}
                        {reqData.quantity ? `${reqData.quantity} ${reqData.unit || ''}` : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900">Pickup Address:</span>{' '}
                        <p className="text-slate-600 mt-0.5">{reqData.pickupAddress || 'Address not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900">Time Window:</span>{' '}
                        {reqData.timeWindowStart ? (
                          <span>
                            {formatDate(reqData.timeWindowStart)} - {formatDate(reqData.timeWindowEnd)}
                          </span>
                        ) : (
                          'Flexible Window'
                        )}
                      </div>
                    </div>

                    {reqData.requesterId && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">Donor: {reqData.requesterId.name}</span>
                        </div>
                        {reqData.requesterId.phone && (
                          <a
                            href={`tel:${reqData.requesterId.phone}`}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-bold"
                          >
                            <Phone className="w-3 h-3" />
                            {reqData.requesterId.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Assigned: {new Date(assignment.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {assignment.status === 'assigned' && (
                      <button
                        onClick={() => handleUpdateStatus(assignment._id, 'collected')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Truck className="w-4 h-4" />
                        {isUpdating ? 'Updating...' : 'Mark Collected'}
                      </button>
                    )}

                    {assignment.status === 'collected' && (
                      <button
                        onClick={() => handleUpdateStatus(assignment._id, 'delivered')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {isUpdating ? 'Updating...' : 'Mark Delivered'}
                      </button>
                    )}

                    {assignment.status === 'delivered' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Completed & Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
