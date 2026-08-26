import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StatusBadge from './StatusBadge';
import { MapPin, Package, Clock, Bike, User as UserIcon, Navigation } from 'lucide-react';

// Default map center (Hyderabad if none provided)
const DEFAULT_CENTER = [17.3850, 78.4867];

// Deterministic coordinate generator for requests without lat/lng
const getCoordsForRequest = (req, index) => {
  if (req.location?.lat && req.location?.lng) {
    return [req.location.lat, req.location.lng];
  }
  // Generate slight pseudo-random offsets based on string ID hash so all markers appear distinctly
  const str = req._id || req.foodType || String(index);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const offsetLat = ((hash % 100) / 2000) + (index % 3) * 0.003 - 0.003;
  const offsetLng = (((hash >> 2) % 100) / 2000) + (index % 4) * 0.003 - 0.003;
  return [DEFAULT_CENTER[0] + offsetLat, DEFAULT_CENTER[1] + offsetLng];
};

// Create custom Leaflet divIcon markers styled with Tailwind CSS
const createCustomIcon = (status) => {
  let badgeBg = 'bg-amber-500';
  let pulseBorder = 'border-amber-300';
  let iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;

  if (status === 'accepted') {
    badgeBg = 'bg-blue-600';
    pulseBorder = 'border-blue-300';
  } else if (status === 'assigned') {
    badgeBg = 'bg-purple-600';
    pulseBorder = 'border-purple-300';
  } else if (status === 'collected') {
    badgeBg = 'bg-orange-500';
    pulseBorder = 'border-orange-300';
  } else if (status === 'delivered') {
    badgeBg = 'bg-emerald-600';
    pulseBorder = 'border-emerald-300';
  } else if (status === 'volunteer') {
    badgeBg = 'bg-indigo-600';
    pulseBorder = 'border-indigo-400';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
        <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
      </svg>
    `;
  }

  const html = `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-8 w-8 rounded-full ${badgeBg} opacity-30 animate-ping"></span>
      <div class="relative w-8 h-8 rounded-full ${badgeBg} shadow-lg border-2 border-white flex items-center justify-center cursor-pointer transition-transform transform hover:scale-110">
        ${iconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Map sub-component to auto-fit bounds when markers update
const MapBoundsFitter = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, map]);

  return null;
};

const MapView = ({
  requests = [],
  userLocation = null,
  height = '480px',
  title = 'Interactive Food Rescue Map'
}) => {
  const [liveLocation, setLiveLocation] = useState(userLocation);

  // Attempt user geolocation if not explicitly provided
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('[MapView Geolocation Warning]', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else if (userLocation) {
      setLiveLocation(userLocation);
    }
  }, [userLocation]);

  // Compute marker coordinates array for bounds fitting
  const { markersData, boundsPoints } = useMemo(() => {
    const points = [];
    const list = requests.map((req, idx) => {
      const coords = getCoordsForRequest(req, idx);
      points.push(coords);
      return {
        ...req,
        coords
      };
    });

    if (liveLocation?.lat && liveLocation?.lng) {
      points.push([liveLocation.lat, liveLocation.lng]);
    }

    return { markersData: list, boundsPoints: points };
  }, [requests, liveLocation]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Flexible';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      {/* Map Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Pending
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Accepted
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Assigned
          </span>
          {liveLocation && (
            <span className="flex items-center gap-1.5 font-medium text-indigo-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse inline-block" /> Your Location
            </span>
          )}
        </div>
      </div>

      {/* Map Leaflet Container */}
      <div style={{ height, width: '100%' }} className="relative z-0">
        <MapContainer
          center={boundsPoints[0] || DEFAULT_CENTER}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsFitter points={boundsPoints} />

          {/* Volunteer / Current User Marker */}
          {liveLocation?.lat && liveLocation?.lng && (
            <Marker
              position={[liveLocation.lat, liveLocation.lng]}
              icon={createCustomIcon('volunteer')}
            >
              <Popup className="leaflet-custom-popup">
                <div className="p-2 space-y-1 text-slate-800 font-sans">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <Bike className="w-4 h-4 text-indigo-600" />
                    <span>Your Live Location</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Lat: {liveLocation.lat.toFixed(4)}, Lng: {liveLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Food Request Markers */}
          {markersData.map((req) => (
            <Marker
              key={req._id}
              position={req.coords}
              icon={createCustomIcon(req.status)}
            >
              <Popup className="leaflet-custom-popup">
                <div className="p-2 space-y-2 max-w-xs text-slate-800 font-sans">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Food Request
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{req.foodType}</h4>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Quantity:</strong> {req.quantity} {req.unit}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700"><strong>Address:</strong> {req.pickupAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Window:</strong> {formatDate(req.timeWindowStart)}</span>
                    </div>

                    {req.requesterId?.name && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span>Donor: <strong>{req.requesterId.name}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
