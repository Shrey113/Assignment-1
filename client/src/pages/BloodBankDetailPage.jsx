import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import { 
  Building2, 
  MapPin, 
  Droplet, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  RefreshCw,
  Clock,
  Sparkles,
  Truck,
  Activity,
  Layers
} from 'lucide-react';
import '../styles/blood-banks.css';

export default function BloodBankDetailPage() {
  const { city, id } = useParams();

  const [depotData, setDepotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadDepot() {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await fetch(`http://localhost:5100/api/blood-banks/city/${encodeURIComponent(city)}/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.success && json.bank) {
          setDepotData(json);
        } else {
          setErrorMsg(json.message || 'Depot not found');
        }
      } catch (err) {
        console.error('Failed to load depot details:', err);
        setErrorMsg('Network error connecting to blood bank depot service.');
      } finally {
        setLoading(false);
      }
    }
    loadDepot();
  }, [city, id]);

  const bank = depotData?.bank;
  const backupDonors = depotData?.backup_donors || { donor_count: 0, o_neg_donors: 0, o_pos_donors: 0 };
  const requisitions = depotData?.requisitions || [];

  return (
    <div className="bb-page-container">
      <PortalHeader pageTitle={`Depot / ${bank?.name || id}`} />

      <main className="bb-page-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#8E9690' }}>
            <RefreshCw size={26} className="spin-slow" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', fontWeight: 500 }}>Connecting to Depot Cold Storage Terminal...</p>
          </div>
        ) : errorMsg ? (
          <div className="bb-hero-banner" style={{ textAlign: 'center', borderColor: '#FCA5A5' }}>
            <AlertCircle size={32} color="#EF4E4E" style={{ margin: '0 auto 12px auto' }} />
            <h2 style={{ color: '#1C201D', margin: '0 0 8px 0' }}>Depot Information Unavailable</h2>
            <p style={{ color: '#5C625E', marginBottom: '20px' }}>{errorMsg}</p>
            <Link to="/blood-banks" className="bb-btn-inspect" style={{ display: 'inline-flex' }}>
              Return to All Gujarat Blood Banks
            </Link>
          </div>
        ) : (
          <div className="bb-depot-detail-layout">
            {/* Depot Identification Card */}
            <section className="bb-depot-header-card">
              <div className="bb-depot-header-top">
                <div className="bb-depot-title-group">
                  <div className="bb-bank-header-meta">
                    <span className="bb-bank-id-badge">DEPOT CODE: {bank.bank_code}</span>
                  </div>

                  <h1 className="bb-depot-name">{bank.name}</h1>
                  <div className="bb-bank-address" style={{ marginTop: '4px' }}>
                    <MapPin size={15} color="#EF4E4E" />
                    <span style={{ color: '#1C201D', fontWeight: 500 }}>{bank.address}</span>
                  </div>
                </div>

                <div className="bb-metric-chip" style={{ background: '#FAF8F5' }}>
                  <div className="bb-metric-icon red">
                    <Droplet size={18} />
                  </div>
                  <div className="bb-metric-content">
                    <span className="bb-metric-value">{bank.total_units} Units</span>
                    <span className="bb-metric-label">In Cold Storage</span>
                  </div>
                </div>
              </div>

              {/* Direct Calling & Helpline Strip */}
              <div className="bb-depot-action-buttons">
                <a href={`tel:${bank.emergency_phone}`} className="bb-btn-call emergency-red">
                  <Phone size={15} />
                  <span>24/7 Emergency Dispatch Helpline: {bank.emergency_phone}</span>
                </a>

                <a href={`tel:${bank.contact_phone}`} className="bb-btn-call">
                  <Phone size={15} color="#5C625E" />
                  <span>Landline: {bank.contact_phone}</span>
                </a>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#5C625E' }}>
                  <Clock size={14} color="#8E9690" />
                  <span>Operating Status: <strong>{bank.operating_hours || '24/7 Active'}</strong></span>
                </div>
              </div>
            </section>

            {/* Cold Storage Reserve Matrix (8 Blood Groups) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#EF4E4E" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1C201D' }}>
                    Live Cold Storage Reserve Inventory
                  </h2>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#5C625E', fontWeight: 500 }}>
                  Real-time Units Monitor (Read-Only)
                </span>
              </div>

              <div className="bb-stock-matrix-grid">
                {bank.stock_breakdown?.map((item) => {
                  const isCritical = item.units < 6;
                  const isWarning = item.units >= 6 && item.units < 15;
                  const tier = isCritical ? 'critical' : isWarning ? 'warning' : 'good';

                  return (
                    <div key={item.group} className={`bb-matrix-card ${tier}`}>
                      <div className="bb-matrix-card-top">
                        <div className="bb-matrix-group-pill">
                          {item.group}
                        </div>
                        <div className="bb-matrix-units-wrap">
                          <div className="bb-matrix-units-value" style={{ color: isCritical ? '#EF4E4E' : '#1C201D' }}>
                            {item.units}
                          </div>
                          <div className="bb-matrix-units-sub">Units Available</div>
                        </div>
                      </div>

                      <div className="bb-matrix-bar-track">
                        <div
                          className={`bb-matrix-bar-fill ${tier}`}
                          style={{ width: `${Math.max(8, item.pct)}%` }}
                        ></div>
                      </div>

                      <div className="bb-matrix-status-label">
                        <span style={{ color: isCritical ? '#EF4E4E' : isWarning ? '#B45309' : '#2E7D32' }}>
                          {isCritical ? 'CRITICAL DEFICIT' : isWarning ? 'MODERATE RESERVE' : 'ADEQUATE STOCK'}
                        </span>
                        <span style={{ color: '#8E9690' }}>{item.pct}% Capacity</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split Section: Hospital Requisitions & Local Backup Donors */}
            <div className="bb-depot-two-col">
              {/* Left Column: Hospital Emergency Requisitions */}
              <div className="bb-panel-card">
                <div className="bb-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#EF4E4E" />
                    <h3 className="bb-panel-title">Active Hospital Priority Requisitions ({bank.city})</h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', background: '#F4F1ED', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {requisitions.length} Active Demands
                  </span>
                </div>

                <div className="bb-req-stack">
                  {requisitions.map((req) => (
                    <div key={req.id} className="bb-req-row">
                      <div className="bb-req-left">
                        <div className="bb-req-group">{req.blood_group}</div>
                        <div className="bb-req-info">
                          <div className="bb-req-patient">
                            {req.patient_name} • <span style={{ color: '#5C625E', fontWeight: 500 }}>{req.units} Units</span>
                          </div>
                          <div className="bb-req-hospital">{req.hospital}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`bb-req-badge ${req.urgency?.toLowerCase() || 'scheduled'}`}>
                          {req.urgency || 'SCHEDULED'}
                        </span>
                        {req.status === 'Dispatched' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#2E7D32', fontWeight: 600 }}>
                            <CheckCircle2 size={13} color="#2E7D32" /> Dispatched
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#5C625E', fontWeight: 600 }}>
                            <Truck size={13} color="#8E9690" /> Courier Standby
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Local Backup Voluntary Donors */}
              <div className="bb-panel-card">
                <div className="bb-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="#2E7D32" />
                    <h3 className="bb-panel-title">Local Backup Donor Pool</h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#8E9690' }}>{bank.city} District</span>
                </div>

                <div className="bb-donors-widget-content">
                  <div className="bb-donor-highlight-box">
                    <div className="bb-donor-big-count">{backupDonors.donor_count}</div>
                    <div className="bb-donor-count-label">Registered Voluntary Donors in {bank.city}</div>
                    <p style={{ fontSize: '0.8rem', color: '#5C625E', margin: '8px 0 0 0' }}>
                      In case this blood bank enters critical shortage, {backupDonors.donor_count} voluntary donors are ready for immediate on-call mobilization.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#FAF8F5', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#5C625E' }}>Universal O- Donors in City:</span>
                    <strong style={{ color: '#EF4E4E' }}>{backupDonors.o_neg_donors || 0} Registered</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#FAF8F5', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#5C625E' }}>Common O+ Donors in City:</span>
                    <strong style={{ color: '#1C201D' }}>{backupDonors.o_pos_donors || 0} Registered</strong>
                  </div>

                  <Link to="/our-area" className="bb-btn-map-redirect">
                    <MapPin size={15} />
                    <span>View {bank.city} Donors on Map</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
