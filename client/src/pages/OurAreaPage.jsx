import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Users,
  HeartHandshake,
  X,
  Droplet,
  Heart,
  Maximize2
} from 'lucide-react';
import gujaratGeoJson from '../assets/gujarat_districts_34.json';
import '../styles/our-area.css';

const BLOOD_GROUPS = ['ALL', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

// Standard Gujarat view bounds
const GUJARAT_BOUNDS = [
  [20.0, 68.1], // South-West
  [24.7, 74.5]  // North-East
];

// Generous pan bounds so the map is free to move and never blocks the user
const GUJARAT_PAN_BOUNDS = [
  [18.5, 66.5],
  [26.0, 76.0]
];

export default function OurAreaPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const badgesLayerRef = useRef(null);

  // Data & UI states - initially no district is selected so user has full freedom
  const [districtStats, setDistrictStats] = useState({});
  const [totalDonors, setTotalDonors] = useState(0);
  const [availableDonors, setAvailableDonors] = useState(0);
  const [currentSlot, setCurrentSlot] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBloodFilter, setSelectedBloodFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Keep ref of selectedDistrict to access cleanly in Leaflet event listeners
  const selectedDistrictRef = useRef(selectedDistrict);
  useEffect(() => {
    selectedDistrictRef.current = selectedDistrict;
  }, [selectedDistrict]);

  // Fetch live district statistics from backend API
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:5100/api/donors/districts');
        const data = await res.json();
        if (data.success) {
          setDistrictStats(data.districts || {});
          setTotalDonors(data.totalDonors || 0);
          setAvailableDonors(data.availableDonors || 0);
          setCurrentSlot(data.currentSlot || '');
        }
      } catch (err) {
        console.error('Failed to fetch district stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Compute max count for current filter to scale colors accurately
  const maxCount = useMemo(() => {
    let max = 1;
    Object.values(districtStats).forEach((d) => {
      const cnt = selectedBloodFilter === 'ALL'
        ? d.totalDonors || 0
        : d.bloodGroups?.[selectedBloodFilter] || 0;
      if (cnt > max) max = cnt;
    });
    return max;
  }, [districtStats, selectedBloodFilter]);

  // Dynamic choropleth color scale (Soft Peach to Rich Crimson)
  const getDistrictColor = (count) => {
    if (!count || count === 0) return '#F9FAFB';
    const ratio = count / Math.max(maxCount, 1);
    if (ratio < 0.25) return '#FFE4E1';
    if (ratio < 0.50) return '#FCA5A5';
    if (ratio < 0.75) return '#EF4E4E';
    return '#B91C1C';
  };

  // Deselect district function - restores full freedom and overview
  const handleDeselect = () => {
    setSelectedDistrict(null);
    setInspectorOpen(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyToBounds(GUJARAT_BOUNDS, {
        padding: [20, 20],
        duration: 0.6
      });
    }
  };

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create map with generous bounds so user is free to move, pan, and zoom
    const map = L.map(mapContainerRef.current, {
      center: [22.4, 71.4],
      zoom: 7.2,
      minZoom: 6.5,
      maxZoom: 11,
      maxBounds: GUJARAT_PAN_BOUNDS,
      maxBoundsVisiblity: false,
      zoomControl: true,
      attributionControl: false
    });

    // Custom lightweight attribution
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('BloodLink Gujarat 34 Districts')
      .addTo(map);

    // Clicking map background deselects any active district
    map.on('click', () => {
      setSelectedDistrict(null);
      setInspectorOpen(false);
    });

    mapInstanceRef.current = map;
    badgesLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render & Update GeoJSON & Centroid Badges when stats, selection, or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing GeoJSON layer
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }
    // Clear badges layer
    if (badgesLayerRef.current) {
      badgesLayerRef.current.clearLayers();
    }

    // Define polygon styling
    const getStyle = (feature) => {
      const name = feature.properties.district;
      const dData = districtStats[name];
      const count = selectedBloodFilter === 'ALL'
        ? (dData?.totalDonors || 0)
        : (dData?.bloodGroups?.[selectedBloodFilter] || 0);

      const isSelected = selectedDistrict === name;

      return {
        fillColor: getDistrictColor(count),
        weight: isSelected ? 3.0 : 1.2,
        opacity: 1,
        color: isSelected ? '#1C201D' : '#FFFFFF',
        dashArray: '',
        fillOpacity: isSelected ? 0.96 : 0.82
      };
    };

    // GeoJSON layer with click and hover interactions
    const geoLayer = L.geoJSON(gujaratGeoJson, {
      style: getStyle,
      onEachFeature: (feature, layer) => {
        const name = feature.properties.district;

        // Hover events
        layer.on({
          mouseover: (e) => {
            const target = e.target;
            const isCurrentlySelected = selectedDistrictRef.current === name;
            target.setStyle({
              weight: isCurrentlySelected ? 3.0 : 2.4,
              color: '#1C201D',
              fillOpacity: 0.95
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          },
          click: (e) => {
            // Stop click propagation so map background click handler doesn't immediately fire
            L.DomEvent.stopPropagation(e);

            // Toggle selection: if already selected, clicking it again DESELECTS it!
            if (selectedDistrictRef.current === name) {
              setSelectedDistrict(null);
              setInspectorOpen(false);
              map.flyToBounds(GUJARAT_BOUNDS, { padding: [20, 20], duration: 0.6 });
            } else {
              setSelectedDistrict(name);
              setInspectorOpen(true);
              map.fitBounds(e.target.getBounds(), {
                padding: [40, 40],
                maxZoom: 9
              });
            }
          }
        });

        // Compact tooltip on hover
        const dData = districtStats[name];
        const count = selectedBloodFilter === 'ALL'
          ? (dData?.totalDonors || 0)
          : (dData?.bloodGroups?.[selectedBloodFilter] || 0);

        const filterLabel = selectedBloodFilter === 'ALL' ? 'Total Donors' : `${selectedBloodFilter} Donors`;
        layer.bindTooltip(
          `<strong>${name}</strong><br/>${count} ${filterLabel} • Click to inspect`,
          { className: 'district-tooltip', direction: 'center', sticky: true }
        );
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoLayer;

    // Add sleek Centroid Number Badges directly onto each district
    gujaratGeoJson.features.forEach((feature) => {
      const name = feature.properties.district;
      const lat = feature.properties.lat;
      const lng = feature.properties.lng;
      if (!lat || !lng) return;

      const dData = districtStats[name];
      const count = selectedBloodFilter === 'ALL'
        ? (dData?.totalDonors || 0)
        : (dData?.bloodGroups?.[selectedBloodFilter] || 0);

      const isSelected = selectedDistrict === name;

      const badgeHtml = `
        <div class="district-count-badge ${isSelected ? 'highlighted' : ''}">
          ${count}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'district-count-marker',
        html: badgeHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        interactive: false
      });

      badgesLayerRef.current.addLayer(marker);
    });

  }, [districtStats, selectedBloodFilter, selectedDistrict, maxCount]);

  // Handle Search input
  const handleSearchSelect = (distName) => {
    const match = gujaratGeoJson.features.find(
      (f) => f.properties.district.toLowerCase() === distName.toLowerCase()
    );
    if (match) {
      setSelectedDistrict(match.properties.district);
      setInspectorOpen(true);
      setSearchQuery('');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([match.properties.lat, match.properties.lng], 8.5, {
          duration: 1.0
        });
      }
    }
  };

  // Current selected district data
  const currentDistrictData = selectedDistrict ? (districtStats[selectedDistrict] || {
    district: selectedDistrict,
    totalDonors: 0,
    availableDonors: 0,
    verifiedDonors: 0,
    firstTimeDonors: 0,
    bloodGroups: {}
  }) : null;

  const isVavTharad = selectedDistrict === 'Vav-Tharad';
  const isMajorHub = (currentDistrictData?.totalDonors || 0) >= 50;

  return (
    <div className="our-area-page">
      {/* ── Single Unified Header: [Logo] BloodLink / our area (Gujarat only) ── */}
      <header className="our-area-topbar">
        {/* Left: {app icon} BloodLink / our area (Gujarat only) */}
        <div className="our-area-brand-group">
          <Link to="/" className="editorial-logo" title="Back to Home">
            <img src="/bloodlink_logo.png" alt="BloodLink logo" className="editorial-logo-img" />
            <div className="logo-monogram">Blood<span>Link</span></div>
          </Link>
          <span className="portal-breadcrumb-sep">/</span>
          <span className="our-area-breadcrumb-title">our area (Gujarat only)</span>
        </div>

        {/* Middle: State Metrics Summary */}
        <div className="our-area-metrics-summary">
          <div className="metric-pill-item">
            <Users size={15} color="var(--coral-accent)" />
            <span>Total Donors: <strong>{totalDonors}</strong></span>
          </div>
          <div className="metric-pill-item" title="Dynamic real-time availability: >90 days cooldown & matching current time slot">
            <HeartHandshake size={15} color="#2E7D32" />
            <span>Currently Available: <strong>{availableDonors}</strong> {currentSlot && <small style={{ color: '#2E7D32', textTransform: 'capitalize', fontWeight: 600 }}>({currentSlot})</small>}</span>
          </div>
          <div className="metric-pill-item">
            <MapPin size={15} color="var(--text-secondary)" />
            <span>Districts: <strong>34 Covered</strong></span>
          </div>
        </div>

        {/* Right: Controls (Blood Filter & Search) */}
        <div className="our-area-controls-group">
          {/* Blood Group Filter Chips */}
          <div className="blood-filter-row">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                className={`filter-chip ${selectedBloodFilter === bg ? 'active' : ''}`}
                onClick={() => setSelectedBloodFilter(bg)}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* Quick District Search Bar */}
          <div className="district-search-wrapper">
            <Search size={14} className="district-search-icon" />
            <input
              type="text"
              className="district-search-input"
              placeholder="Search district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleSearchSelect(searchQuery.trim());
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Interactive Map & Inspector Content */}
      <main className="our-area-content">
        {/* Gujarat Leaflet Map Viewport */}
        <div
          ref={mapContainerRef}
          className="gujarat-map-container"
          aria-label="Interactive Gujarat District Map"
        />

        {/* Editorial Choropleth Legend */}
        <div className="map-legend-card">
          <div className="legend-title">
            {selectedBloodFilter === 'ALL' ? 'Donor Density' : `${selectedBloodFilter} Donors`}
          </div>
          <div className="legend-scale">
            <div className="legend-bar-segment" style={{ background: '#FFE4E1' }}></div>
            <div className="legend-bar-segment" style={{ background: '#FCA5A5' }}></div>
            <div className="legend-bar-segment" style={{ background: '#EF4E4E' }}></div>
            <div className="legend-bar-segment" style={{ background: '#B91C1C' }}></div>
          </div>
          <div className="legend-labels">
            <span>Low</span>
            <span>Max ({maxCount})</span>
          </div>
        </div>

        {/* Reset / Show All Button when a district is selected */}
        {selectedDistrict && (
          <button
            type="button"
            className="map-reset-btn"
            onClick={handleDeselect}
            title="Deselect and show all Gujarat"
          >
            <Maximize2 size={13} />
            <span>Show All Districts</span>
          </button>
        )}

        {/* Right District Inspector Panel (Opens when a district is selected) */}
        <aside
          className={`district-inspector-panel ${inspectorOpen && selectedDistrict ? 'open' : 'closed'}`}
          aria-label="District Details and Donor Breakdown"
        >
          {selectedDistrict && currentDistrictData && (
            <>
              {/* Header */}
              <div className="inspector-header">
                <div className="inspector-title-area">
                  <div className="inspector-badge-row">
                    <span className="inspector-tag district-type">District</span>
                    {isVavTharad && (
                      <span className="inspector-tag vav-tharad">✨ 34th District • Formed Oct 2025</span>
                    )}
                    {isMajorHub && !isVavTharad && (
                      <span className="inspector-tag major-hub">🔥 Major Donor Hub</span>
                    )}
                  </div>
                  <h2 className="inspector-district-name">{selectedDistrict}</h2>
                </div>

                <button
                  type="button"
                  className="inspector-close-btn"
                  onClick={handleDeselect}
                  aria-label="Deselect and close inspector panel"
                  title="Deselect District"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Inspector Body Details */}
              <div className="inspector-body">
                {/* Quick Metrics Grid */}
                <div className="inspector-stats-grid">
                  <div className="inspector-stat-card">
                    <div className="inspector-stat-val">{currentDistrictData.totalDonors || 0}</div>
                    <div className="inspector-stat-label">Total Donors</div>
                  </div>
                  <div className="inspector-stat-card" title="Dynamic availability: Medically cooled down (>90 days) & active in current time slot">
                    <div className="inspector-stat-val" style={{ color: '#2E7D32' }}>
                      {currentDistrictData.availableDonors || 0}
                    </div>
                    <div className="inspector-stat-label">Available Now</div>
                  </div>
                  <div className="inspector-stat-card">
                    <div className="inspector-stat-val" style={{ color: '#B45309' }}>
                      {currentDistrictData.firstTimeDonors || 0}
                    </div>
                    <div className="inspector-stat-label">First-Time</div>
                  </div>
                </div>

                {/* Blood Groups Distribution Breakdown */}
                <div>
                  <div className="inspector-section-heading">
                    <span>Blood Type Breakdown</span>
                    <span style={{ fontSize: '0.72rem', textTransform: 'none', color: 'var(--coral-accent)' }}>
                      Live Database
                    </span>
                  </div>
                  <div className="blood-distribution-grid">
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => {
                      const count = currentDistrictData.bloodGroups?.[type] || 0;
                      return (
                        <div
                          key={type}
                          className={`blood-group-cell ${count > 0 ? 'has-donors' : ''}`}
                        >
                          <div className="bg-type-tag">{type}</div>
                          <div className="bg-count-num">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Shortcuts Footer */}
              <div className="inspector-footer">
                <Link
                  to={`/requester?city=${encodeURIComponent(selectedDistrict)}`}
                  className="inspector-btn-primary"
                >
                  <Droplet size={15} fill="#FFFFFF" />
                  <span>Find Blood Here</span>
                </Link>

                <Link
                  to={`/donor?city=${encodeURIComponent(selectedDistrict)}`}
                  className="inspector-btn-secondary"
                >
                  <Heart size={15} color="var(--coral-accent)" />
                  <span>Join as Donor</span>
                </Link>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
