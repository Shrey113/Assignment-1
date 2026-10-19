import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplet, Home, Heart, ShieldAlert, ArrowLeftRight, ChevronDown } from 'lucide-react';

export default function PortalHeader({ pageTitle }) {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine current active page name for breadcrumb
  const currentPath = location.pathname;
  const pageName = pageTitle || (
    currentPath === '/donor' ? 'Donor' :
    currentPath === '/requester' ? 'Requester' :
    currentPath === '/admin' ? 'Admin' : 'Portal'
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown options based on current route
  const getDropdownLinks = () => {
    if (currentPath === '/donor') {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/requester', label: 'Requester Portal', icon: Droplet, color: '#EF4E4E' }
      ];
    }
    if (currentPath === '/requester') {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/donor', label: 'Donor Portal', icon: Heart, color: '#EF4E4E' }
      ];
    }
    return [
      { to: '/', label: 'Home', icon: Home },
      { to: '/donor', label: 'Donor Portal', icon: Heart, color: '#EF4E4E' },
      { to: '/requester', label: 'Requester Portal', icon: Droplet, color: '#EF4E4E' }
    ];
  };

  const links = getDropdownLinks();

  return (
    <header className="portal-header">
      {/* Left: {Logo} BloodLink / Donor */}
      <div className="portal-header-left">
        <Link to="/" className="editorial-logo">
          <Droplet size={26} color="#EF4E4E" fill="#EF4E4E" />
          <div className="logo-monogram">Blood<span>Link</span></div>
        </Link>
        <span className="portal-breadcrumb-sep">/</span>
        <span className="portal-breadcrumb-page">{pageName}</span>
      </div>

      {/* Right: Switch Portal Button with Dropdown */}
      <div className="portal-header-right" ref={dropdownRef}>
        <button
          type="button"
          className={`portal-switch-trigger ${isDropdownOpen ? 'active' : ''}`}
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          aria-expanded={isDropdownOpen}
          aria-label="Switch portal navigation"
        >
          <ArrowLeftRight size={15} />
          <span>Switch</span>
          <ChevronDown size={13} className={`switch-caret ${isDropdownOpen ? 'open' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="portal-switch-dropdown">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="portal-dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Icon size={15} color={link.color || 'var(--text-secondary)'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
