import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

const EmptyState = ({
  icon: Icon = UtensilsCrossed,
  title = 'No requests yet',
  message = 'There are no active food requests at the moment.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-8 sm:p-12 text-center shadow-sm max-w-md mx-auto my-6">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100/80">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
