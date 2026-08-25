import React from 'react';
import { CheckCircle2, Clock, Check, AlertTriangle, Package, Bike, MapPin, Truck, Home } from 'lucide-react';

/**
 * StatusTimeline Component
 * Renders progressive timeline for food requests:
 * submitted (pending) -> accepted -> assigned -> collected -> delivered
 */
const timelineStages = [
  { key: 'pending', label: 'Submitted', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'assigned', label: 'Assigned', icon: Bike },
  { key: 'collected', label: 'Collected', icon: Package },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

// Helper to determine order of status
const getStatusIndex = (status) => {
  const s = status ? status.toLowerCase() : 'pending';
  switch (s) {
    case 'pending':
    case 'submitted':
      return 0;
    case 'accepted':
      return 1;
    case 'assigned':
      return 2;
    case 'collected':
      return 3;
    case 'delivered':
      return 4;
    case 'rejected':
      return -1;
    default:
      return 0;
  }
};

const StatusTimeline = ({ status = 'pending', className = '' }) => {
  const currentStageIndex = getStatusIndex(status);
  const isRejected = status?.toLowerCase() === 'rejected';

  if (isRejected) {
    return (
      <div className={`p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 ${className}`}>
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold">Request Rejected</span>
          <p className="text-slate-600 text-[11px]">This request could not be fulfilled at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-3 ${className}`}>
      {/* Desktop / Tablet Horizontal Timeline */}
      <div className="relative flex items-center justify-between">
        {/* Connecting Line background */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0 rounded-full" />

        {/* Progress Line */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-amber-500 z-0 transition-all duration-500 rounded-full"
          style={{
            width: `${(currentStageIndex / (timelineStages.length - 1)) * 90}%`
          }}
        />

        {timelineStages.map((stage, idx) => {
          const IconComponent = stage.icon;
          const isCompleted = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 scale-110 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <IconComponent className="w-4 h-4" />
                )}
              </div>
              <span
                className={`mt-2 text-[11px] font-semibold tracking-tight text-center ${
                  isCurrent
                    ? 'text-amber-700 font-bold'
                    : isCompleted
                    ? 'text-emerald-700 font-medium'
                    : 'text-slate-400 font-normal'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
