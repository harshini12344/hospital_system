import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = {
  ADMIN: [
    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: '🏥', label: 'Departments', path: '/admin/departments' },
    { icon: '📋', label: 'All Appointments', path: '/admin/appointments' },
    { icon: '👥', label: 'Reports', path: '/admin/reports' },
  ],
  DOCTOR: [
    { icon: '📅', label: 'My Schedule', path: '/doctor/schedule' },
    { icon: '🕐', label: 'Manage Slots', path: '/doctor/slots' },
  ],
  PATIENT: [
    { icon: '🔍', label: 'Find Doctors', path: '/patient/doctors' },
    { icon: '📋', label: 'My Appointments', path: '/patient/appointments' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = navItems[user?.role] || [];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>🏥 MedSchedule</h1>
        <p>Hospital Management System</p>
      </div>

      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Navigation</div>
          {items.map(item => (
            <button
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ padding: '1rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          className="sidebar-link"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ color: '#f87171' }}
        >
          <span className="sidebar-link-icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
