import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import { AlertCircle } from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   time: '8 AM – 12 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12 PM – 4 PM' },
  { id: 'evening',   label: 'Evening',   time: '4 PM – 8 PM' },
  { id: 'flexible',  label: 'Flexible',  time: 'Anytime' },
];

export default function DonorPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [city, setCity] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [availableDays, setAvailableDays] = useState(['Sat', 'Sun']);
  const [preferredSlot, setPreferredSlot] = useState('morning');
  const [ageError, setAgeError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleAgeChange = (e) => {
    const val = e.target.value;
    setAge(val);
    if (val && (Number(val) < 18 || Number(val) > 65)) {
      setAgeError('Eligible donor age is between 18 and 65 years');
    } else {
      setAgeError('');
    }
  };

  const toggleDay = (day) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (age && (Number(age) < 18 || Number(age) > 65)) {
      setAgeError('Eligible donor age is between 18 and 65 years');
      return;
    }
    setAgeError('');
    setIsRegistered(true);
    setTimeout(() => setIsRegistered(false), 5000);
  };

  return (
    <div className="portal-page-layout">
      <PortalHeader pageTitle="Donor" />

      <main className="donor-split-grid">

        {/* ── LEFT: Form Column (Expanded Width) ─────────────────────────── */}
        <div className="donor-form-side">
          <div className="donor-form-card">

            {/* Card Header */}
            <div className="donor-card-top">
              <h2 className="donor-card-heading">Become a donor.</h2>
              <p className="donor-card-sub">Your voluntary profile coordinates critical emergency matches.</p>
            </div>

            <form onSubmit={handleSubmit} className="donor-fields-stack">
              <div className="donor-form-columns">

                {/* Left Sub-column: Personal & Contact */}
                <div className="donor-form-col">
                  {/* Name */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="donor-field-input"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="donor-field-input"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Contact Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="donor-field-input"
                    />
                  </div>

                  {/* Gender as 3 radios */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Gender</label>
                    <div className="donor-gender-radios">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <label key={g} className={`donor-radio-card ${gender === g ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="donor-gender"
                            value={g}
                            checked={gender === g}
                            onChange={(e) => setGender(e.target.value)}
                            className="donor-radio-input"
                          />
                          <span className="donor-radio-circle"></span>
                          <span className="donor-radio-text">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Age & Weight inline */}
                  <div className="donor-row-two">
                    <div className="donor-field-group">
                      <label className="donor-field-label">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={handleAgeChange}
                        placeholder="18 - 65"
                        className={`donor-field-input ${ageError ? 'has-error' : ''}`}
                        min="18"
                        max="65"
                      />
                      {ageError && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{ageError}</span>
                        </span>
                      )}
                    </div>

                    <div className="donor-field-group">
                      <label className="donor-field-label">Weight (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="≥ 45 kg"
                        className="donor-field-input"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">City Depot</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Ahmedabad, Gujarat"
                      className="donor-field-input"
                    />
                  </div>
                </div>

                {/* Right Sub-column: Blood, Last Donation & Availability */}
                <div className="donor-form-col">
                  {/* Blood Group */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Blood Group</label>
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
                  </div>

                  {/* Last Donation Date */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Last Donation Date</label>
                      <label className="donor-checkbox-inline">
                        <input
                          type="checkbox"
                          checked={isFirstTime}
                          onChange={(e) => {
                            setIsFirstTime(e.target.checked);
                            if (e.target.checked) setLastDonationDate('');
                          }}
                        />
                        <span>First-time donor</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      value={lastDonationDate}
                      onChange={(e) => setLastDonationDate(e.target.value)}
                      disabled={isFirstTime}
                      className={`donor-field-input ${isFirstTime ? 'is-disabled' : ''}`}
                    />
                  </div>

                  {/* Availability Days (Multiple selection) */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Availability Days</label>
                      <span className="donor-field-hint">Multi-select</span>
                    </div>
                    <div className="donor-days-grid">
                      {DAYS.map((day) => {
                        const isSelected = availableDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            className={`donor-day-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleDay(day)}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Preferred Time Slot</label>
                    <div className="donor-slots-grid">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = preferredSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            className={`donor-slot-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => setPreferredSlot(slot.id)}
                          >
                            <span className="donor-slot-name">{slot.label}</span>
                            <span className="donor-slot-time">{slot.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit & Toast */}
              <button type="submit" className="donor-submit-btn">
                Register as a donor
              </button>

              {isRegistered && (
                <div className="portal-success-toast">
                  <span>✓ Your voluntary donor profile is now active{name ? `, ${name}` : ''}.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ── RIGHT: Illustration Column (Enlarged + Floating Objective SVGs) ─── */}
        <div className="donor-art-side">
          {/* Soft ambient peach glow */}
          <div className="donor-art-glow-bg"></div>

          {/* Floating Pill Badge 1: Top-left of illustration */}
          <div className="donor-floating-pill donor-float-top-left">
            <span className="donor-live-dot"></span>
            <svg className="donor-ecg-svg" viewBox="0 0 46 16" fill="none">
              <path d="M0 8 H12 L15 2 L19 14 L23 5 L26 11 L29 8 H46" stroke="#EF4E4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Emergency Lifeline</span>
          </div>

          {/* Floating Pill Badge 2: Top-right of illustration */}
          <div className="donor-floating-pill donor-float-top-right">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4E4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>Hospital Verified</span>
          </div>

          {/* Enlarged Main Character Illustration */}
          <img
            src="/illustrations/donor/donor_portal_art.png"
            alt="Voluntary blood donor character"
            className="donor-art-img"
          />

          {/* Floating Objective Stat Badge (Replaces the 3 boxes in blank space) */}
          <div className="donor-floating-stat-card">
            <div className="donor-stat-icon-wrapper">
              <svg className="donor-stat-icon-svg" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="16" fill="#FEE4E2" />
                <path d="M18 8C18 8 11 16.5 11 21C11 24.866 14.134 28 18 28C21.866 28 25 24.866 25 21C25 16.5 18 8 18 8Z" fill="#EF4E4E" />
                <path d="M15.5 21H20.5M18 18.5V23.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="donor-stat-content">
              <div className="donor-stat-title">1 Donation = 3 Lives Saved</div>
              <div className="donor-stat-desc">Your single voluntary unit provides red cells, platelets & plasma to emergency patients.</div>
            </div>
          </div>
        </div>

        {/* ── BACKGROUND: Scattered Decorative Objective SVGs across blank spaces ─── */}
        <div className="donor-deco-layer" aria-hidden="true">
          {/* Top-right corner: Radiating droplet cell */}
          <svg className="donor-deco-svg donor-deco-tr" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="#EF4E4E" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.25" />
            <circle cx="50" cy="50" r="26" fill="#EF4E4E" opacity="0.06" />
            <path d="M50 24 C50 24 37 40 37 49 C37 56.2 42.8 62 50 62 C57.2 62 63 56.2 63 49 C63 40 50 24 50 24 Z" fill="#EF4E4E" opacity="0.3" />
          </svg>

          {/* Bottom-left margin (under form): Lifeline Pulse wave */}
          <svg className="donor-deco-svg donor-deco-bl" viewBox="0 0 160 40" fill="none">
            <path d="M0 20 H40 L48 6 L56 34 L64 12 L71 26 L78 20 H160" stroke="#EF4E4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
          </svg>

          {/* Bottom-right corner: Medical Lifesaver Cross */}
          <svg className="donor-deco-svg donor-deco-br" viewBox="0 0 64 64" fill="none">
            <rect x="27" y="8" width="10" height="48" rx="5" fill="#EF4E4E" opacity="0.16" />
            <rect x="8" y="27" width="48" height="10" rx="5" fill="#EF4E4E" opacity="0.16" />
          </svg>

          {/* Mid-canvas floating soft droplet */}
          <svg className="donor-deco-svg donor-deco-mid" viewBox="0 0 44 44" fill="none">
            <path d="M22 6C22 6 10 20 10 27C10 33.6 15.4 39 22 39C28.6 39 34 33.6 34 27C34 20 22 6 22 6Z" fill="#EF4E4E" opacity="0.2" />
            <circle cx="18" cy="24" r="2.5" fill="#FFFFFF" opacity="0.7" />
          </svg>
        </div>

      </main>
    </div>
  );
}
