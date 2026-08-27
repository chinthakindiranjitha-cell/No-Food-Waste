import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Package, Users, Bike, TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';

const STATUS_COLORS = {
  Pending: '#f59e0b',   // Amber-500
  Accepted: '#3b82f6',  // Blue-500
  Assigned: '#a855f7',  // Purple-500
  Collected: '#f97316', // Orange-500
  Delivered: '#10b981', // Emerald-500
  Rejected: '#f43f5e'   // Rose-500
};

const StatsPanel = ({ statsData, isLoading }) => {
  const [chartType, setChartType] = useState('pie'); // 'pie' | 'bar'

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
        <div className="h-48 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!statsData) return null;

  const {
    totalRequests = 0,
    statusCounts = {},
    totalQuantityDelivered = 0,
    totalRequesters = 0,
    totalVolunteers = 0
  } = statsData;

  const chartData = [
    { name: 'Pending', value: statusCounts.pending || 0, color: STATUS_COLORS.Pending },
    { name: 'Accepted', value: statusCounts.accepted || 0, color: STATUS_COLORS.Accepted },
    { name: 'Assigned', value: statusCounts.assigned || 0, color: STATUS_COLORS.Assigned },
    { name: 'Collected', value: statusCounts.collected || 0, color: STATUS_COLORS.Collected },
    { name: 'Delivered', value: statusCounts.delivered || 0, color: STATUS_COLORS.Delivered },
    { name: 'Rejected', value: statusCounts.rejected || 0, color: STATUS_COLORS.Rejected }
  ].filter((item) => item.value >= 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Analytics Overview
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            System & Food Rescue Statistics
          </h3>
        </div>

        {/* Chart Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setChartType('pie')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartType === 'pie'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" /> Pie Breakdown
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Bar View
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Food Rescued</div>
            <div className="text-2xl font-black text-emerald-900">{totalQuantityDelivered} <span className="text-xs font-normal text-emerald-700">units</span></div>
            <div className="text-[11px] text-emerald-600">Collected & Delivered</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Requesters</div>
            <div className="text-2xl font-black text-amber-900">{totalRequesters}</div>
            <div className="text-[11px] text-amber-600">Registered Donors / NGOs</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Active Volunteers</div>
            <div className="text-2xl font-black text-indigo-900">{totalVolunteers}</div>
            <div className="text-[11px] text-indigo-600">Ready for Pickups</div>
          </div>
        </div>
      </div>

      {/* Visual Chart Area */}
      <div className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Food Request Status Breakdown ({totalRequests} Total Requests)
        </h4>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} requests`, name]}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} requests`, 'Count']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
