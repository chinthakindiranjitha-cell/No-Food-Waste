import React, { useState, useEffect, useCallback } from 'react';
import { requestService, assignmentService } from '../services/api';
import {
  Layers,
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
  UserCheck,
  RefreshCw,
  X,
  Search,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  Navigation
} from 'lucide-react';

// ── Volunteer Picker Modal ────────────────────────────────────────────────────
const BatchAssignModal = ({ cluster, volunteers, onAssign, onClose, isAssigning }) => {
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
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-800 p-5 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" /> Assign Batch Trip
            </div>
            <h3 className="font-bold text-base leading-tight">
              {cluster.totalItems} requests · {cluster.totalQuantity != null ? `${cluster.totalQuantity} ${cluster.unit}` : cluster.unit}
            </h3>
            <p className="text-violet-300 text-xs mt-0.5">All stops within {cluster.radiusKm} km</p>
          </div>
          <button onClick={onClose} className="text-violet-300 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stop list preview */}
        <div className="px-5 pt-4 pb-2 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stops (visiting order)</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {cluster.orderedRequests.map((req, idx) => (
              <div key={req._id} className="flex items-center gap-2 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="font-semibold truncate">{req.foodType}</span>
                <span className="text-slate-400 truncate">— {req.pickupAddress}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search volunteers */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
            />
          </div>
        </div>

        {/* Volunteer list */}
        <div className="p-4 max-h-52 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              {volunteers.length === 0 ? 'No volunteers registered yet.' : 'No volunteers match your search.'}
            </div>
          ) : (
            filtered.map((vol) => (
              <label
                key={vol._id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedVolunteerId === vol._id
                    ? 'border-violet-400 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="batch-volunteer"
                  value={vol._id}
                  checked={selectedVolunteerId === vol._id}
                  onChange={() => setSelectedVolunteerId(vol._id)}
                  className="accent-violet-600"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">{vol.name}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{vol.email}</span>
                    {vol.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{vol.phone}</span>}
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
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAssigning ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Assigning…</>
            ) : (
              <><UserCheck className="w-4 h-4" /> Assign to Batch</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main BatchSuggestionsPanel ────────────────────────────────────────────────
const BatchSuggestionsPanel = ({ volunteers, onBatchAssigned }) => {
  const [clusters, setClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [assigningCluster, setAssigningCluster] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchClusters = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await requestService.getBatchSuggestions();
      if (res.success) {
        setClusters(res.clusters || []);
        setIsOpen((res.clusters || []).length > 0);
      }
    } catch (err) {
      console.error('[BatchSuggestionsPanel] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchClusters(); }, [fetchClusters]);

  const handleAssign = async (volunteerId) => {
    if (!assigningCluster || !volunteerId) return;
    setIsAssigning(true);
    try {
      const res = await assignmentService.createBatchAssignment({
        requestIds: assigningCluster.requestIds.map((id) => id.toString ? id.toString() : id),
        volunteerId
      });
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Batch assigned!' });
        setAssigningCluster(null);
        // Remove assigned cluster from list
        setClusters((prev) => prev.filter((c) => c !== assigningCluster));
        if (onBatchAssigned) onBatchAssigned();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to assign batch.'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Don't render if no suggestions and not loading
  if (!isLoading && clusters.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
        {/* Panel header */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-base">Suggested Batches</span>
                {!isLoading && clusters.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-xs font-bold">
                    {clusters.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nearby pending requests that can be combined into one trip
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); fetchClusters(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
        </button>

        {/* Cluster cards */}
        {isOpen && (
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Computing clusters…
              </div>
            ) : (
              clusters.map((cluster, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4 space-y-3"
                >
                  {/* Cluster summary header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                        <Navigation className="w-5 h-5 text-violet-700" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {cluster.totalItems} requests
                          {cluster.totalQuantity != null && (
                            <span className="font-normal text-slate-600">
                              {' '}· {cluster.totalQuantity} {cluster.unit}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-violet-700 font-semibold mt-0.5">
                          <MapPin className="w-3 h-3" />
                          All within {cluster.radiusKm} km of each other
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setAssigningCluster(cluster)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      Assign volunteer to this batch
                    </button>
                  </div>

                  {/* Stop list */}
                  <div className="space-y-1.5">
                    {cluster.orderedRequests.map((req, stopIdx) => (
                      <div
                        key={req._id}
                        className="flex items-start gap-2.5 bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                          {stopIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="font-semibold text-slate-900">{req.foodType}</span>
                            <span className="text-slate-500 flex items-center gap-0.5">
                              <Package className="w-3 h-3" />
                              {req.quantity} {req.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-violet-500" />
                            <span className="truncate">{req.pickupAddress}</span>
                          </div>
                          {req.requesterId && (
                            <span className="text-slate-400 mt-0.5 block">
                              Requester: {req.requesterId.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Batch assign modal */}
      {assigningCluster && (
        <BatchAssignModal
          cluster={assigningCluster}
          volunteers={volunteers}
          onAssign={handleAssign}
          onClose={() => setAssigningCluster(null)}
          isAssigning={isAssigning}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          {toast.message}
        </div>
      )}
    </>
  );
};

export default BatchSuggestionsPanel;
