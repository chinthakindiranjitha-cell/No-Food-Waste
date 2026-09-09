import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, ShieldCheck } from 'lucide-react';

const CATEGORY_WINDOWS_MS = {
  cooked: 2 * 60 * 60 * 1000,
  perishable: 6 * 60 * 60 * 1000,
  packaged: 24 * 60 * 60 * 1000
};

export const getUrgencyInfo = (request) => {
  if (!request) return { urgencyLevel: 'safe', remainingMs: 0, text: 'Safe', ratio: 1 };

  const category = request.foodCategory || 'cooked';
  const totalWindowMs = CATEGORY_WINDOWS_MS[category] || CATEGORY_WINDOWS_MS.cooked;

  const createdTime = request.createdAt ? new Date(request.createdAt).getTime() : Date.now();
  const expiresTime = request.expiresAt
    ? new Date(request.expiresAt).getTime()
    : createdTime + totalWindowMs;

  const remainingMs = expiresTime - Date.now();
  const ratio = remainingMs / totalWindowMs;

  let urgencyLevel = 'safe';
  if (remainingMs <= 0 || ratio < 0.20) {
    urgencyLevel = 'critical';
  } else if (ratio <= 0.50) {
    urgencyLevel = 'warning';
  }

  let text = '';
  if (remainingMs <= 0) {
    text = 'EXPIRED';
  } else {
    const totalMinutes = Math.floor(remainingMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      text = `${hours}h ${minutes}m left`;
    } else {
      text = `${minutes}m left`;
    }
  }

  return { urgencyLevel, remainingMs, text, ratio, category };
};

export const getCardUrgencyStyles = (request) => {
  const { urgencyLevel } = getUrgencyInfo(request);

  if (urgencyLevel === 'critical') {
    return 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-400/40 shadow-md';
  }
  if (urgencyLevel === 'warning') {
    return 'border-amber-400 bg-amber-50/30 shadow-xs';
  }
  return 'border-slate-200 hover:border-emerald-300';
};

const UrgencyBadge = ({ request, showCategory = true }) => {
  const [urgencyInfo, setUrgencyInfo] = useState(() => getUrgencyInfo(request));

  useEffect(() => {
    setUrgencyInfo(getUrgencyInfo(request));

    const interval = setInterval(() => {
      setUrgencyInfo(getUrgencyInfo(request));
    }, 5000); // update live countdown every 5 seconds

    return () => clearInterval(interval);
  }, [request]);

  const { urgencyLevel, remainingMs, text, category } = urgencyInfo;

  const categoryLabels = {
    cooked: 'Cooked (2h)',
    perishable: 'Perishable (6h)',
    packaged: 'Packaged (24h)'
  };

  if (urgencyLevel === 'critical') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black uppercase tracking-wider">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>{remainingMs <= 0 ? 'EXPIRED' : `CRITICAL • ${text}`}</span>
        {showCategory && <span className="opacity-75 font-normal ml-0.5">({categoryLabels[category] || category})</span>}
      </div>
    );
  }

  if (urgencyLevel === 'warning') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>WARNING • {text}</span>
        {showCategory && <span className="opacity-75 font-normal ml-0.5">({categoryLabels[category] || category})</span>}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>{text}</span>
      {showCategory && <span className="opacity-75 font-normal ml-0.5">({categoryLabels[category] || category})</span>}
    </div>
  );
};

export default UrgencyBadge;
