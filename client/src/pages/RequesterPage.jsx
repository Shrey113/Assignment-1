import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import GUJARAT_CITIES from '../constants/gujaratCities';

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

const URGENCY_LEVELS = [
  {
    id: 'CRITICAL',
    title: 'Critical Emergency',
    badge: 'Immediate (< 1h)',
    desc: 'Life-threatening trauma or emergency surgery'
  },
  {
    id: 'URGENT',
    title: 'Urgent Requirement',
    badge: 'Within 4 Hours',
    desc: 'Active inpatient deficit, ICU resuscitation or oncology'
  },
  {
    id: 'SCHEDULED',
    title: 'Scheduled / Elective',
    badge: 'Within 24 Hours',
    desc: 'Planned surgical procedure or replenishment reserve'
  }
];

const UNIT_OPTIONS = [1, 2, 3, 4, 5];

const getMinRequiredDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function RequesterPage() {
  const [patientName, setPatientName] = useState('');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('');
  const [units, setUnits] = useState(null);

  const [bloodGroup, setBloodGroup] = useState('');
  const [urgency, setUrgency] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [isImmediate, setIsImmediate] = useState(false);
  const [dateError, setDateError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const minRequiredDate = getMinRequiredDate();
  const isTriageBlocked = Boolean(requiredDate && !isImmediate);

  const handleDateChange = (e) => {
    const val = e.target.value;
    setRequiredDate(val);
    if (val) {
      setUrgency('');
    }
    if (val && val < minRequiredDate) {
      setDateError('Date must be from tomorrow onwards (minimum 24h notice)');
    } else {
      setDateError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isImmediate && requiredDate && requiredDate < minRequiredDate) {
      setDateError('Date must be from tomorrow onwards (minimum 24h notice)');
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const compatibleDonors = bloodGroup && COMPATIBILITY_MAP[bloodGroup] ? COMPATIBILITY_MAP[bloodGroup] : [];

  return (
    <div className="portal-page-layout">
      <PortalHeader pageTitle="Requester" />

      {/* Main 100svh Content Split - Clean 2-Column Layout */}
      <main className="donor-split-grid">

        {/* ── LEFT: Form Column ─────────────────────────── */}
        <div className="donor-form-side">
          <div className="donor-form-card">

            {/* Card Header */}
            <div className="donor-card-top">
              <h2 className="donor-card-heading">
                Request blood<span className="coral-dot">.</span>
              </h2>
              <p className="donor-card-sub">
                Broadcast an emergency requisition to nearby verified voluntary donors.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="donor-fields-stack">
              <div className="donor-form-columns">

                {/* Left Column: Patient & Hospital Logistics */}
                <div className="donor-form-col donor-col-left">

                  {/* Patient Name */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Patient Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="donor-field-input"
                      required
                    />
                  </div>

                  {/* Hospital & ICU Ward */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Hospital & ICU Ward</label>
                    <input
                      type="text"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="e.g. Apollo Hospital, Trauma ICU"
                      className="donor-field-input"
                      required
                    />
                  </div>

                  {/* City Depot */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">City Depot / Region</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="donor-field-input donor-field-select"
                    >
                      <option value="">Select City (e.g. Ahmedabad)</option>
                      {GUJARAT_CITIES.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Required By Date */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Required By Date</label>
                      <label className="donor-checkbox-inline">
                        <input
                          type="checkbox"
                          checked={isImmediate}
                          onChange={(e) => {
                            setIsImmediate(e.target.checked);
                            if (e.target.checked) {
                              setRequiredDate('');
                              setDateError('');
                            }
                          }}
                        />
                        <span>Immediate (STAT)</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      value={requiredDate}
                      min={minRequiredDate}
                      onChange={handleDateChange}
                      disabled={isImmediate}
                      className={`donor-field-input ${isImmediate ? 'is-disabled' : ''} ${dateError ? 'has-error' : ''}`}
                    />
                    {dateError && (
                      <span className="field-hint-error">
                        <span>{dateError}</span>
                      </span>
                    )}
                  </div>

                  {/* Units Needed */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Units Needed</label>
                      <span className="donor-field-hint">
                        {units ? (units === 1 ? '1 Unit (350ml)' : `${units} Units (700ml+)`) : 'Select units'}
                      </span>
                    </div>
                    <div className="requester-units-grid">
                      {UNIT_OPTIONS.map((u) => (
                        <button
                          key={u}
                          type="button"
                          className={`requester-unit-chip ${units === u ? 'active' : ''}`}
                          onClick={() => setUnits(u)}
                        >
                          {u} {u === 5 ? '+' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column: Blood Group, Urgency & Target */}
                <div className="donor-form-col donor-col-right">

                  {/* Blood Group Required */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Blood Group Required</label>
                      <span className="donor-field-hint">Red Cell Match</span>
                    </div>
                    <div className="blood-type-grid-small donor-blood-grid">
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
                    <div className="requester-compat-hint" style={{ marginTop: '4px' }}>
                      <span className="requester-compat-label">Safe voluntary matches:</span>
                      <strong className="requester-compat-pill">
                        {bloodGroup && compatibleDonors.length > 0 ? compatibleDonors.join(', ') : 'Select blood group'}
                      </strong>
                    </div>
                  </div>

                  {/* Emergency Priority */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Emergency Priority Triage</label>
                    <div className={`requester-urgency-stack ${isTriageBlocked ? 'is-blocked' : ''}`}>
                      {URGENCY_LEVELS.map((lvl) => {
                        const isSelected = urgency === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            disabled={isTriageBlocked}
                            className={`requester-priority-card ${lvl.id.toLowerCase()} ${isSelected ? 'active' : ''}`}
                            onClick={() => !isTriageBlocked && setUrgency(lvl.id)}
                          >
                            <div className="priority-card-content">
                              <span className="priority-radio-circle">
                                <span className="priority-radio-inner"></span>
                              </span>
                              <div className="priority-card-body">
                                <div className="priority-card-title-row">
                                  <span className="priority-card-title">{lvl.title}</span>
                                  <span className="priority-time-badge">{lvl.badge}</span>
                                </div>
                                <p className="priority-card-desc">{lvl.desc}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <button type="submit" className="donor-submit-btn">
                <span>
                  Broadcast Emergency Request{units && bloodGroup ? ` (${units} ${units === 1 ? 'Unit' : 'Units'} of ${bloodGroup})` : units ? ` (${units} ${units === 1 ? 'Unit' : 'Units'})` : bloodGroup ? ` (${bloodGroup})` : ''}
                </span>
                <span className="btn-arrow-icon">→</span>
              </button>

              {isSubmitted && (
                <div className="portal-success-toast">
                  <span>✓ Emergency broadcast sent! Alerting verified {bloodGroup ? compatibleDonors.join('/') : 'compatible'} voluntary donors near {hospital || city || 'depot'}.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ── RIGHT: Full Clinic Scene Artwork (Clean, no floating badges) ─── */}
        <div className="donor-art-side">
          <div className="donor-art-glow-bg"></div>
          <img
            src="/illustrations/requester/requester_portal_art.png"
            alt="Voluntary blood requisition coordination"
            className="donor-art-img"
          />
        </div>

      </main>

      {/* Layered bottom waves grounding the page */}
      <div className="donor-bottom-waves" aria-hidden="true">
        <svg viewBox="0 0 1440 70" fill="none" preserveAspectRatio="none">
          <path
            d="M0 35 C280 70 440 10 720 38 C1000 65 1200 18 1440 32 V70 H0 Z"
            fill="url(#requesterWaveGrad1)"
            opacity="0.45"
          />
          <path
            d="M0 50 C320 18 540 68 820 38 C1100 12 1300 58 1440 44 V70 H0 Z"
            fill="url(#requesterWaveGrad2)"
            opacity="0.75"
          />
          <defs>
            <linearGradient id="requesterWaveGrad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFA085" />
              <stop offset="50%" stopColor="#EF4E4E" />
              <stop offset="100%" stopColor="#FF7A85" />
            </linearGradient>
            <linearGradient id="requesterWaveGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FEE4E2" />
              <stop offset="50%" stopColor="#FFB8A8" />
              <stop offset="100%" stopColor="#FEE4E2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
