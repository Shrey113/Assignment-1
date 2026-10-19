import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import { Heart, CheckCircle2, Award, Sparkles, MapPin, Calendar, ShieldCheck } from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function DonorPage() {
  const [name, setName] = useState('Arjun Mehta');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(68);
  const [city, setCity] = useState('Ahmedabad, Gujarat');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsRegistered(true);
    setTimeout(() => setIsRegistered(false), 5000);
  };

  return (
    <div className="portal-page-layout">
      <PortalHeader pageTitle="Donor" />

      {/* Main 100svh Content Split */}
      <main className="portal-main-grid">
        {/* Left Column: Form & Live Donor Pass */}
        <div className="portal-form-column">
          <form className="portal-card-form" onSubmit={handleSubmit}>
            <div className="form-card-header">
              <div className="form-card-title-group">
                <div className="form-card-badge">
                  <Heart size={15} color="#EF4E4E" fill="#EF4E4E" />
                  <span>Voluntary Donor Registration</span>
                </div>
              </div>
              <span className="form-card-note">Quick 60s Sign Up</span>
            </div>

            <div className="form-grid-two">
              <div className="form-group-item">
                <label>Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Mehta"
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
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

            <div className="form-grid-three">
              <div className="form-group-item">
                <label>Age (Years)</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  min="45"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Preferred City Depot</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-action-row">
              <button type="submit" className="btn-editorial-primary" style={{ width: '100%' }}>
                <Heart size={18} fill="#FFFFFF" />
                <span>Register as Voluntary Donor</span>
              </button>
            </div>
          </form>

          {/* Live Dynamic Donor Pass Preview */}
          <div className="donor-pass-preview-bar">
            <div className="donor-pass-badge">
              <span className="donor-pass-type">{bloodGroup}</span>
            </div>
            <div className="donor-pass-details">
              <div className="donor-pass-name">{name || 'Your Name'}</div>
              <div className="donor-pass-meta">
                <span>{city}</span> • <span>Ready to Help</span> • <span>Active Member</span>
              </div>
            </div>
            <div className="donor-pass-status">
              <CheckCircle2 size={16} color="#2E7D32" />
              <span>Eligible</span>
            </div>
          </div>

          {isRegistered && (
            <div className="portal-success-toast">
              <Sparkles size={18} color="#EF4E4E" />
              <span>Welcome aboard, {name}! Your voluntary donor pass is active.</span>
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

          {/* Quick Eligibility Requirements Strip */}
          <div className="eligibility-chips-row">
            <div className="eligibility-chip">
              <ShieldCheck size={14} color="#EF4E4E" />
              <span>Age 18 to 65</span>
            </div>
            <div className="eligibility-chip">
              <Award size={14} color="#EF4E4E" />
              <span>Weight ≥ 45 kg</span>
            </div>
            <div className="eligibility-chip">
              <Calendar size={14} color="#EF4E4E" />
              <span>90-Day Cooldown</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
