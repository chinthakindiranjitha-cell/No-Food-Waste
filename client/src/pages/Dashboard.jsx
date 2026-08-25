import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Persona state (defaults to logged-in user's role, or 'requester' if guest/demo)
  const [activePersona, setActivePersona] = useState(user?.role || 'requester');
  
  // UI State toggles to demonstrate loading and empty states as required by design specs
  const [isLoading, setIsLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  
  // Sample status filter
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Sample mockup data representing Food Requests with all color-coded statuses
  const sampleRequests = [
    {
      id: 'req-01',
      foodType: 'Fresh Surplus Pastries & Sandwiches',
      quantity: 25,
      unit: 'boxes',
      pickupAddress: '124 Community Bakery St, Downtown',
      status: 'pending',
      timeWindow: 'Today, 5:00 PM - 7:00 PM',
      createdAt: '10 mins ago',
      requesterName: 'Sunrise Bakery'
    },
    {
      id: 'req-02',
      foodType: 'Hot Catering Rice & Curry Trays',
      quantity: 50,
      unit: 'meals',
      pickupAddress: '88 Tech Park Plaza, 3rd Floor',
      status: 'accepted',
      timeWindow: 'Today, 6:00 PM - 8:00 PM',
      createdAt: '25 mins ago',
      requesterName: 'Grand Hotel Catering'
    },
    {
      id: 'req-03',
      foodType: 'Assorted Organic Fruit Crates',
      quantity: 8,
      unit: 'crates',
      pickupAddress: '45 Farmers Market Hub',
      status: 'assigned',
      timeWindow: 'Tomorrow, 9:00 AM - 11:00 AM',
      createdAt: '1 hour ago',
      requesterName: 'Green Valley Produce'
    },
    {
      id: 'req-04',
      foodType: 'Pre-packaged Soup & Bread Rolls',
      quantity: 40,
      unit: 'servings',
      pickupAddress: '102 Hope Shelter Way',
      status: 'collected',
      timeWindow: 'Today, 2:00 PM - 4:00 PM',
      createdAt: '2 hours ago',
      requesterName: 'St. Jude Kitchen'
    },
    {
      id: 'req-05',
      foodType: 'Packaged Canned Goods & Milk',
      quantity: 15,
      unit: 'cartons',
      pickupAddress: '304 Westside Supermarket',
      status: 'delivered',
      timeWindow: 'Yesterday, 4:00 PM',
      createdAt: '1 day ago',
      requesterName: 'Westside Grocery'
    }
  ];

  const filteredRequests = sampleRequests.filter((req) => {
    if (selectedStatusFilter === 'all') return true;
    return req.status === selectedStatusFilter;
  });

  const triggerMockLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Persona Switcher */}
      <div className="bg-white rounded-2xl border border-amber-100/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider">
              Scaffolding Preview
            </span>
            <span className="text-xs text-slate-400">Logged in as: <strong className="text-slate-700">{user?.name || 'Guest'}</strong> ({user?.role || 'demo'})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            No Food Waste Connect
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Empowering donors, volunteers, and admins to bridge surplus food to hungry neighbors seamlessly.
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

      {/* Interactive Controls Bar: Demo state toggles for loading & empty states */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">Demo State Controls:</span>
          <button
            onClick={triggerMockLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-700 hover:bg-amber-100/50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            Trigger Loading State
          </button>
          <button
            onClick={() => setShowEmpty(!showEmpty)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs ${
              showEmpty ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-100/50'
            }`}
          >
            {showEmpty ? 'Showing Empty State (Click to toggle)' : 'Toggle Empty State'}
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
            <option value="all">All Status Badges</option>
            <option value="pending">Pending (Yellow)</option>
            <option value="accepted">Accepted (Blue)</option>
            <option value="assigned">Assigned (Purple)</option>
            <option value="collected">Collected (Orange)</option>
            <option value="delivered">Delivered (Green)</option>
          </select>
        </div>
      </div>

      {/* Main Dashboard Content Rendered Based on Active Persona */}

      {/* 1. REQUESTER PERSONA VIEW */}
      {activePersona === 'requester' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Need to donate or request food rescue?</h2>
              <p className="text-amber-100 text-sm mt-1">Submit details in under 1 minute. Volunteers will handle pickup!</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-amber-900 font-bold text-sm shadow-md hover:bg-amber-50 transition-colors shrink-0 cursor-pointer">
              <PlusCircle className="w-5 h-5 text-amber-600" />
              New Food Request
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Your Active Requests</h3>
            <span className="text-xs text-slate-500">Showing status updates in real-time</span>
          </div>

          {isLoading ? (
            <LoadingState message="Fetching your food donation requests..." />
          ) : showEmpty ? (
            <EmptyState
              title="No food requests submitted yet"
              message="You have no active food requests. Create your first donation request to help connect food with local shelters!"
              actionLabel="Create Request Now"
              onAction={() => setShowEmpty(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{req.foodType}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{req.createdAt}</p>
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
                      <span><strong>Window:</strong> {req.timeWindow}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">Requester: {req.requesterName}</span>
                    <button className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. VOLUNTEER PERSONA VIEW (Mobile-first focused) */}
      {activePersona === 'volunteer' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Bike className="w-4 h-4" /> Mobile Volunteer Dashboard
            </div>
            <h2 className="text-xl font-bold">Nearby Food Pickups & Deliveries</h2>
            <p className="text-indigo-100 text-sm mt-1">Scan assignments quickly and mark status updates on the go.</p>
          </div>

          {isLoading ? (
            <LoadingState message="Finding nearby volunteer assignments..." />
          ) : showEmpty ? (
            <EmptyState
              icon={Bike}
              title="No volunteer assignments found"
              message="There are no pending food pickups requiring volunteer assignment in your area right now."
              actionLabel="Refresh List"
              onAction={() => setShowEmpty(false)}
            />
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {req.requesterName}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{req.foodType}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {req.quantity} {req.unit} • {req.timeWindow}
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
                    <button className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs text-center transition-colors shadow-2xs">
                      Accept Pickup
                    </button>
                    <button className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center transition-colors">
                      View Map & Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ADMIN PERSONA VIEW (Fast scanning layout) */}
      {activePersona === 'admin' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4" /> Operations Overview
              </div>
              <h2 className="text-xl font-bold">Admin Dispatch & Request Queue</h2>
              <p className="text-slate-400 text-sm mt-1">Scan requests fast and dispatch volunteers with minimal clicks.</p>
            </div>
            <div className="hidden sm:flex gap-3 text-center">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[90px]">
                <div className="text-xl font-bold text-amber-400">12</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Pending</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[90px]">
                <div className="text-xl font-bold text-purple-400">8</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Assigned</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 min-w-[90px]">
                <div className="text-xl font-bold text-emerald-400">45</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Delivered</div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingState message="Loading operational dispatch queue..." />
          ) : showEmpty ? (
            <EmptyState
              icon={Shield}
              title="Dispatch queue empty"
              message="All requests have been successfully processed or delivered!"
              actionLabel="Reset Filters"
              onAction={() => setShowEmpty(false)}
            />
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                        <strong>Donor:</strong> {req.requesterName} • <strong>Qty:</strong> {req.quantity} {req.unit} • <strong>Loc:</strong> {req.pickupAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors">
                      Assign Volunteer
                    </button>
                    <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors">
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
