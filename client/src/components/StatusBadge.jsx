import React from 'react';

/**
 * StatusBadge component
 * Map of color codes as per design requirements:
 * pending   => yellow
 * accepted  => blue
 * assigned  => purple
 * collected => orange
 * delivered => green
 * rejected  => red
 */
const statusConfig = {
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    label: 'Pending',
    dot: 'bg-amber-500'
  },
  accepted: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    label: 'Accepted',
    dot: 'bg-blue-500'
  },
  assigned: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    label: 'Assigned',
    dot: 'bg-purple-500'
  },
  collected: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    label: 'Collected',
    dot: 'bg-orange-500'
  },
  delivered: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    label: 'Delivered',
    dot: 'bg-emerald-500'
  },
  rejected: {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    label: 'Rejected',
    dot: 'bg-rose-500'
  }
};

const StatusBadge = ({ status = 'pending', className = '' }) => {
  const normalizedStatus = status ? status.toLowerCase() : 'pending';
  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
