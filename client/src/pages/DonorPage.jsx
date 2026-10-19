import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function DonorPage() {
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
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

      {/* Main 100svh Content Split */}
      <main className="portal-main-grid">
        {/* Left Column: Form with Decreased Width & Increased Height */}
        <div className="portal-form-column">
          <form className="portal-card-form donor-form-vertical" onSubmit={handleSubmit}>
            <div className="form-card-header">
              <div className="form-card-badge">
                <Heart size={15} color="#EF4E4E" fill="#EF4E4E" />
                <span>Voluntary Donor Registration</span>
              </div>
            </div>

            <div className="form-group-item">
              <label>Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Mehta"
              />
            </div>

            <div className="form-group-item">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div className="form-group-item">
              <label>Select Blood Group</label>
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

            <div className="form-grid-two">
              <div className="form-group-item">
                <label>Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={handleAgeChange}
                  placeholder="e.g. 25 (18 - 65)"
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

              <div className="form-group-item">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 65 kg"
                />
              </div>
            </div>

            <div className="form-group-item">
              <label>Preferred City Depot</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Ahmedabad, Gujarat"
              />
            </div>

            <div className="form-action-row" style={{ marginTop: '4px' }}>
              <button type="submit" className="btn-editorial-primary" style={{ width: '100%' }}>
                <Heart size={18} fill="#FFFFFF" />
                <span>Register as Voluntary Donor</span>
              </button>
            </div>
          </form>

          {isRegistered && (
            <div className="portal-success-toast">
              <Sparkles size={18} color="#EF4E4E" />
              <span>Welcome aboard{name ? `, ${name}` : ''}! Your voluntary donor profile is active.</span>
            </div>
          )}
        </div>

        {/* Right Column: Floating Editorial Art & Visual Anchor */}
        <div className="portal-art-column">
          <div className="portal-illustration-wrapper">
            <div className="portal-art-backdrop-glow"></div>
            <img
              src="/illustrations/donor/donor_portal_art.png"
              alt="Voluntary donor holding registration pass with supportive companion"
              className="portal-floating-art"
            />
            <div className="portal-caption-badge">
              <span className="caption-dot"></span>
              <span className="caption-title">Voluntary Donor Network</span>
              <span className="caption-sub">• Instant Emergency Alerts</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
