import React, { useState } from 'react';
import { assignmentService } from '../services/api';
import StatusBadge from './StatusBadge';
import {
  Layers,
  MapPin,
  Package,
  Phone,
  User as UserIcon,
  Truck,
  Check,
  CheckCircle2,
  Clock
} from 'lucide-react';

// Progress bar showing stop completion
const TripProgress = ({ stopStatuses }) => {
  const total = stopStatuses.length;
  const done = stopStatuses.filter((s) => s.status === 'delivered').length;
  const collected = stopStatuses.filter((s) => s.status === 'collected').length;
  const pct = total === 0 ? 0 : Math.round(((done + collected) / total) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-semibold">Trip progress</span>
        <span className="text-indigo-700 font-bold">{done}/{total} stops done</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── BatchTripCard ──────────────────────────────────────────────────────────────
const BatchTripCard = ({ assignment, onUpdate }) => {
  const [updatingStopId, setUpdatingStopId] = useState(null);

  const { requestIds = [], stopStatuses = [], status } = assignment;

  // Build a map of requestId → stop status for quick lookup
  const stopStatusMap = stopStatuses.reduce((acc, s) => {
    acc[s.requestId?.toString() || s.requestId] = s.status;
    return acc;
  }, {});

  // Total quantity across stops (best-effort)
  const allUnits = [...new Set(requestIds.map((r) => r.unit).filter(Boolean))];
  const totalQty = allUnits.length === 1
    ? requestIds.reduce((s, r) => s + (r.quantity || 0), 0)
    : null;
  const unitLabel = allUnits.length === 1 ? allUnits[0] : 'mixed';

  const handleStopAction = async (requestId, newStatus) => {
    setUpdatingStopId(requestId);
    try {
      const res = await assignmentService.updateStopStatus(assignment._id, requestId, newStatus);
      if (res.success && onUpdate) {
        onUpdate(res.assignment);
      }
    } catch (err) {
      console.error('[BatchTripCard] stop update error:', err);
      alert(err?.response?.data?.message || 'Failed to update stop status');
    } finally {
      setUpdatingStopId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'Flexible';
    return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-violet-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
            <Layers className="w-3 h-3" /> Batch Trip · {requestIds.length} stops
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Multi-Stop Pickup
            {totalQty != null && (
              <span className="text-sm font-normal text-slate-500 ml-1">
                ({totalQty} {unitLabel} total)
              </span>
            )}
          </h3>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Progress bar */}
      <TripProgress stopStatuses={stopStatuses} />

      {/* Stop checklist */}
      <div className="space-y-2">
        {requestIds.map((req, idx) => {
          const reqId = req._id?.toString() || req;
          const stopStatus = stopStatusMap[reqId] || 'assigned';
          const isUpdating = updatingStopId === reqId;
          const reqData = typeof req === 'object' ? req : {};

          const isDone = stopStatus === 'delivered';
          const isCollected = stopStatus === 'collected';

          return (
            <div
              key={reqId}
              className={`rounded-xl border p-3 text-xs transition-all ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : isCollected
                  ? 'border-indigo-200 bg-indigo-50/50'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Stop number / done indicator */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCollected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Food type + quantity */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                    <span className="font-semibold text-slate-900">{reqData.foodType || 'Food Items'}</span>
                    {reqData.quantity && (
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <Package className="w-3 h-3" />
                        {reqData.quantity} {reqData.unit}
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCollected
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {stopStatus}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-1 text-slate-500 mb-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0 text-violet-500" />
                    <span className="truncate">{reqData.pickupAddress || 'Address not specified'}</span>
                  </div>

                  {/* Time window */}
                  {reqData.timeWindowStart && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 shrink-0" />
                      {formatDate(reqData.timeWindowStart)} – {formatDate(reqData.timeWindowEnd)}
                    </div>
                  )}

                  {/* Requester contact */}
                  {reqData.requesterId && (
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold">{reqData.requesterId.name}</span>
                      </div>
                      {reqData.requesterId.phone && (
                        <a
                          href={`tel:${reqData.requesterId.phone}`}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-bold"
                        >
                          <Phone className="w-3 h-3" />
                          {reqData.requesterId.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Per-stop action button */}
                <div className="shrink-0 flex flex-col gap-1.5">
                  {stopStatus === 'assigned' && (
                    <button
                      onClick={() => handleStopAction(reqId, 'collected')}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Truck className="w-3 h-3" />
                      {isUpdating ? '…' : 'Collect'}
                    </button>
                  )}
                  {stopStatus === 'collected' && (
                    <button
                      onClick={() => handleStopAction(reqId, 'delivered')}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />
                      {isUpdating ? '…' : 'Deliver'}
                    </button>
                  )}
                  {isDone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Batch assigned: {new Date(assignment.createdAt).toLocaleDateString()}</span>
        {status === 'delivered' && (
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> All stops delivered
          </span>
        )}
      </div>
    </div>
  );
};

export default BatchTripCard;
