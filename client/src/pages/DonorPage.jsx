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

        {/* ── RIGHT: Illustration Column ─── */}
        <div className="donor-art-side">
          {/* Soft ambient peach glow */}
          <div className="donor-art-glow-bg"></div>

          {/* Main Character Illustration */}
          <img
            src="/illustrations/donor/donor_portal_art.png"
            alt="Voluntary blood donor character"
            className="donor-art-img"
          />
        </div>

      </main>
    </div>
  );
}
