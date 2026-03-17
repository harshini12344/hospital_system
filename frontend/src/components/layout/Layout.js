import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children, title }) => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <div>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{title || 'Dashboard'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            <span>Welcome,</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{user?.name}</span>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
