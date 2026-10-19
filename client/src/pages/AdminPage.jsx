import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, Truck, Users, RefreshCw, Sparkles } from 'lucide-react';

const STOCK_DATA = [
  { group: 'O-', units: 14, status: 'Low', pct: 28 },
  { group: 'O+', units: 62, status: 'Good', pct: 82 },
  { group: 'A-', units: 18, status: 'Moderate', pct: 40 },
  { group: 'A+', units: 54, status: 'Good', pct: 75 },
  { group: 'B-', units: 12, status: 'Critical', pct: 22 },
  { group: 'B+', units: 48, status: 'Good', pct: 68 },
  { group: 'AB-', units: 8, status: 'Critical', pct: 16 },
  { group: 'AB+', units: 36, status: 'Good', pct: 55 }
];

const INITIAL_REQUESTS = [
  { id: 'REQ-101', patient: 'Rahul Verma', hospital: 'Apollo Trauma Care', group: 'O-', urgency: 'CRITICAL', units: 2, status: 'Pending' },
  { id: 'REQ-102', patient: 'Meena Iyer', hospital: 'Civil Hospital ICU', group: 'B+', urgency: 'URGENT', units: 1, status: 'Dispatched' },
  { id: 'REQ-103', patient: 'Karan Dave', hospital: 'Sterling Heart Inst.', group: 'A+', urgency: 'SCHEDULED', units: 3, status: 'Pending' }
];

export default function AdminPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [actionNotice, setActionNotice] = useState('');

  const handleDispatch = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Dispatched' } : r));
    setActionNotice(`Emergency courier dispatched for ${id}!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div className="portal-page-layout">
      <PortalHeader pageTitle="Admin" />

      {/* Main 100svh Content Split */}
      <main className="portal-main-grid">
        {/* Left Column: Real-time Blood Stock & Request Queue */}
        <div className="portal-form-column">
          <div className="portal-intro-block">
            <span className="portal-sub-badge" style={{ color: '#1C201D' }}>Central Safety Command</span>
            <h1 className="portal-main-heading">
              The Precision of <br />
              <em>Network Oversight.</em>
            </h1>
            <p className="portal-lead-text">
              Real-time monitoring of city-wide blood reserve levels, urgent hospital requests, and voluntary donor dispatches.
            </p>
          </div>

          {/* Blood Stock Mini-Grid */}
          <div className="admin-stock-grid-compact">
            {STOCK_DATA.map((item) => (
              <div key={item.group} className="stock-compact-chip">
                <div className="stock-chip-header">
                  <span className="stock-chip-group">{item.group}</span>
                  <span className="stock-chip-units">{item.units} <small>Units</small></span>
                </div>
                <div className="stock-chip-bar-bg">
                  <div
                    className={`stock-chip-bar-fill ${item.pct < 30 ? 'critical' : item.pct < 50 ? 'warning' : 'good'}`}
                    style={{ width: `${item.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Incoming Requests Queue */}
          <div className="admin-queue-card">
            <div className="queue-card-head">
              <span className="queue-head-title">Live Priority Requisitions</span>
              <span className="queue-head-count">3 Active</span>
            </div>

            <div className="queue-items-stack">
              {requests.map((req) => (
                <div key={req.id} className="queue-single-row">
                  <div className="queue-row-left">
                    <span className="queue-group-pill">{req.group}</span>
                    <div className="queue-patient-meta">
                      <div className="queue-patient-name">{req.patient} • <small>{req.hospital}</small></div>
                      <div className="queue-patient-sub">
                        <span>{req.units} Units Required</span> • <span style={{ color: req.urgency === 'CRITICAL' ? '#EF4E4E' : '#B45309', fontWeight: 600 }}>{req.urgency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="queue-row-action">
                    {req.status === 'Dispatched' ? (
                      <span className="dispatched-status-pill">
                        <CheckCircle2 size={13} color="#2E7D32" />
                        <span>Dispatched</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-dispatch-action"
                        onClick={() => handleDispatch(req.id)}
                      >
                        <Truck size={13} />
                        <span>Dispatch Match</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {actionNotice && (
            <div className="portal-success-toast">
              <Sparkles size={18} color="#EF4E4E" />
              <span>{actionNotice}</span>
            </div>
          )}
        </div>

        {/* Right Column: Floating Artwork & Visual Anchor */}
        <div className="portal-art-column">
          <div className="portal-illustration-wrapper">
            <div className="portal-art-backdrop-glow"></div>
            <img
              src="/illustrations/admin/admin_portal_art.png"
              alt="System administrator monitoring blood depot network terminal"
              className="portal-floating-art"
            />
            <div className="portal-caption-badge">
              <span className="caption-dot"></span>
              <span className="caption-title">Central Network Command</span>
              <span className="caption-sub">• 120+ Partner Depots</span>
            </div>
          </div>

          {/* Quick Command Action Cards */}
          <div className="eligibility-chips-row">
            <div className="eligibility-chip">
              <Users size={14} color="#EF4E4E" />
              <span>4,200+ Donors Ready</span>
            </div>
            <div className="eligibility-chip">
              <Activity size={14} color="#EF4E4E" />
              <span>99.8% Safety Index</span>
            </div>
            <div className="eligibility-chip">
              <RefreshCw size={14} color="#2E7D32" />
              <span>Live Sync Active</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
