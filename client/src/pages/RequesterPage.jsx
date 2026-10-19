import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import { Droplet, AlertTriangle, Clock, Hospital, CheckCircle2, Sparkles, Send } from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const COMPATIBILITY_MAP = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export default function RequesterPage() {
  const [patientName, setPatientName] = useState('Priya Sharma');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [urgency, setUrgency] = useState('CRITICAL');
  const [units, setUnits] = useState(2);
  const [hospital, setHospital] = useState('Apollo Hospital, Trauma ICU');
  const [contactPhone, setContactPhone] = useState('+91 99887 76655');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const compatibleDonors = COMPATIBILITY_MAP[bloodGroup] || ['O-'];

  return (
    <div className="portal-page-layout">
      <PortalHeader pageTitle="Requester" />

      {/* Main 100svh Content Split */}
      <main className="portal-main-grid">
        {/* Left Column: Requisition Form */}
        <div className="portal-form-column">
          <div className="portal-intro-block">
            <span className="portal-sub-badge" style={{ color: '#EF4E4E' }}>Urgent Blood Requisition</span>
            <h1 className="portal-main-heading">
              The Urgency of <br />
              <em>Finding a Life Match.</em>
            </h1>
            <p className="portal-lead-text">
              Broadcast an immediate request to nearby compatible voluntary donors. No middle fees, 100% voluntary, directly connected.
            </p>
          </div>

          <form className="portal-card-form" onSubmit={handleSubmit}>
            {/* Urgency Selector */}
            <div className="urgency-selector-row">
              <label>Emergency Priority</label>
              <div className="urgency-pill-group">
                <button
                  type="button"
                  className={`urgency-pill critical ${urgency === 'CRITICAL' ? 'active' : ''}`}
                  onClick={() => setUrgency('CRITICAL')}
                >
                  <AlertTriangle size={13} />
                  <span>CRITICAL (Immediate)</span>
                </button>

                <button
                  type="button"
                  className={`urgency-pill urgent ${urgency === 'URGENT' ? 'active' : ''}`}
                  onClick={() => setUrgency('URGENT')}
                >
                  <Clock size={13} />
                  <span>URGENT (&lt; 2h)</span>
                </button>

                <button
                  type="button"
                  className={`urgency-pill scheduled ${urgency === 'SCHEDULED' ? 'active' : ''}`}
                  onClick={() => setUrgency('SCHEDULED')}
                >
                  <span>SCHEDULED</span>
                </button>
              </div>
            </div>

            <div className="form-grid-two">
              <div className="form-group-item">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Hospital & ICU Ward</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. City General Hospital, ICU Room 4"
                  required
                />
              </div>
            </div>

            <div className="form-grid-two">
              <div className="form-group-item">
                <label>Blood Group Required</label>
                <div className="blood-type-grid-small">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      className={`blood-type-chip ${bloodGroup === bg ? 'active' : ''}`}
                      onClick={() => setBloodGroup(bg)}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group-item">
                <label>Units Needed</label>
                <div className="units-stepper-control">
                  {[1, 2, 3, 4].map((u) => (
                    <button
                      key={u}
                      type="button"
                      className={`unit-step-btn ${units === u ? 'active' : ''}`}
                      onClick={() => setUnits(u)}
                    >
                      {u} {u === 1 ? 'Unit' : 'Units'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-action-row">
              <button type="submit" className="btn-editorial-primary" style={{ width: '100%' }}>
                <Send size={16} />
                <span>Broadcast Emergency Request ({units} Units of {bloodGroup})</span>
              </button>
            </div>
          </form>

          {/* Real-time Match Helper Strip */}
          <div className="donor-pass-preview-bar">
            <div className="donor-pass-badge" style={{ backgroundColor: '#EF4E4E' }}>
              <span className="donor-pass-type" style={{ color: '#FFFFFF' }}>{bloodGroup}</span>
            </div>
            <div className="donor-pass-details">
              <div className="donor-pass-name">Compatible Donor Groups</div>
              <div className="donor-pass-meta">
                Patient can receive red cells from: <strong>{compatibleDonors.join(', ')}</strong>
              </div>
            </div>
            <div className="donor-pass-status">
              <span style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 600 }}>Priority: {urgency}</span>
            </div>
          </div>

          {isSubmitted && (
            <div className="portal-success-toast">
              <Sparkles size={18} color="#EF4E4E" />
              <span>Broadcast dispatched! Notifying voluntary {compatibleDonors.join('/')} donors near {hospital}.</span>
            </div>
          )}
        </div>

        {/* Right Column: Floating Artwork & Visual Anchor */}
        <div className="portal-art-column">
          <div className="portal-illustration-wrapper">
            <div className="portal-art-backdrop-glow"></div>
            <img
              src="/illustrations/requester/requester_portal_art.png"
              alt="Requester holding blood requisition tablet supported by compassionate healthcare volunteer"
              className="portal-floating-art"
            />
            <div className="portal-caption-badge">
              <span className="caption-dot"></span>
              <span className="caption-title">Emergency Alert Broadcast</span>
              <span className="caption-sub">• Under 15m Response Time</span>
            </div>
          </div>

          {/* Emergency Safety Protocol Note */}
          <div className="eligibility-chips-row">
            <div className="eligibility-chip">
              <Droplet size={14} color="#EF4E4E" fill="#EF4E4E" />
              <span>100% Free & Voluntary</span>
            </div>
            <div className="eligibility-chip">
              <Hospital size={14} color="#EF4E4E" />
              <span>120+ Verified Depots</span>
            </div>
            <div className="eligibility-chip">
              <CheckCircle2 size={14} color="#2E7D32" />
              <span>Cross-Matched Safely</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
