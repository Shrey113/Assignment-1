import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import { 
  MapPin, 
  Phone, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Clock
} from 'lucide-react';
import '../styles/blood-banks.css';

export default function BloodBankCityPage() {
  const { city } = useParams();
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCityData() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5100/api/blood-banks/city/${encodeURIComponent(city)}`);
        const json = await res.json();
        if (json.success) {
          setCityData(json);
        }
      } catch (err) {
        console.error('Failed to load city blood banks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCityData();
  }, [city]);


  const currentCityName = cityData?.city || city;

  return (
    <div className="bb-page-container">
      <PortalHeader pageTitle={`Blood Banks / ${currentCityName}`} />

      <main className="bb-page-content">

        {/* Stack of Blood Bank Cards in this City */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8E9690' }}>
            <RefreshCw size={24} className="spin-slow" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', fontWeight: 500 }}>Loading depots in {currentCityName}...</p>
          </div>
        ) : (
          <div className="bb-banks-stack">
            {cityData?.banks?.map((bank) => {
              const stockList = [
                { grp: 'O-', val: bank.stock_o_neg },
                { grp: 'O+', val: bank.stock_o_pos },
                { grp: 'A-', val: bank.stock_a_neg },
                { grp: 'A+', val: bank.stock_a_pos },
                { grp: 'B-', val: bank.stock_b_neg },
                { grp: 'B+', val: bank.stock_b_pos },
                { grp: 'AB-', val: bank.stock_ab_neg },
                { grp: 'AB+', val: bank.stock_ab_pos }
              ];

              return (
                <div key={bank.id} className="bb-bank-card">
                  <div className="bb-bank-card-top">
                    <div className="bb-bank-title-block">
                      <div className="bb-bank-header-meta">
                        <span className="bb-bank-id-badge">ID: {bank.bank_code}</span>
                      </div>
                      <h2 className="bb-bank-name">{bank.name}</h2>
                      <div className="bb-bank-address">
                        <MapPin size={14} color="#8E9690" />
                        <span>{bank.address}</span>
                      </div>
                    </div>

                    <div className="bb-bank-quick-actions">
                      <Link
                        to={`/blood-banks/${encodeURIComponent(currentCityName)}/${bank.bank_code}`}
                        className="bb-btn-inspect"
                      >
                        <span>Inspect Depot Stock</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>

                  {/* Contact Strip */}
                  <div className="bb-bank-contact-strip">
                    <a href={`tel:${bank.contact_phone}`} className="bb-contact-item">
                      <Phone size={14} color="#5C625E" />
                      <span>{bank.contact_phone}</span>
                    </a>

                    <a href={`tel:${bank.emergency_phone}`} className="bb-contact-item emergency">
                      <AlertCircle size={14} color="#EF4E4E" />
                      <span>24/7 Helpline: {bank.emergency_phone}</span>
                    </a>

                    <span className="bb-contact-item" style={{ marginLeft: 'auto', color: '#8E9690' }}>
                      <Clock size={14} />
                      <span>{bank.operating_hours || '24/7 Service'}</span>
                    </span>
                  </div>

                  {/* Stock Mini-Grid Chips */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#8E9690', letterSpacing: '0.04em' }}>
                        Cold Storage Stock ({bank.total_units} Units Total)
                      </span>
                    </div>

                    <div className="bb-stock-chips-grid">
                      {stockList.map((s) => {
                        const isCritical = s.val < 6;
                        const isWarning = s.val >= 6 && s.val < 15;
                        return (
                          <div
                            key={s.grp}
                            className={`bb-stock-chip ${isCritical ? 'critical' : isWarning ? 'warning' : ''}`}
                          >
                            <div className="bb-stock-chip-top">
                              <span className="bb-stock-group-label">{s.grp}</span>
                              <span className="bb-stock-units-number">{s.val}</span>
                            </div>
                            <span className="bb-stock-status-text">
                              {isCritical ? 'Critical' : isWarning ? 'Moderate' : 'Good'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
