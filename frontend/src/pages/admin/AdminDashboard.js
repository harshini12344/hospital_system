import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { reportApi } from '../../services/api';

const StatCard = ({ icon, label, value, bg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg }}>{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.dashboard()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div className="loading"><div className="spinner" />Loading...</div></Layout>;

  return (
    <Layout title="Admin Dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Hospital statistics at a glance</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="👨‍⚕️" label="Total Doctors" value={stats?.totalDoctors || 0} bg="#ede9fe" />
        <StatCard icon="🤒" label="Total Patients" value={stats?.totalPatients || 0} bg="#dbeafe" />
        <StatCard icon="📅" label="Total Appointments" value={stats?.totalAppointments || 0} bg="#f3f4f6" />
        <StatCard icon="⏳" label="Booked" value={stats?.totalBooked || 0} bg="#dbeafe" />
        <StatCard icon="✅" label="Confirmed" value={stats?.totalConfirmed || 0} bg="#d1fae5" />
        <StatCard icon="🏁" label="Completed" value={stats?.totalCompleted || 0} bg="#f3f4f6" />
        <StatCard icon="❌" label="Cancelled" value={stats?.totalCancelled || 0} bg="#fee2e2" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '🏥', label: 'Manage Departments', path: '/admin/departments' },
                { icon: '📋', label: 'View All Appointments', path: '/admin/appointments' },
                { icon: '📊', label: 'View Reports', path: '/admin/reports' },
              ].map(action => (
                <a key={action.path} href={action.path} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                  textDecoration: 'none', color: '#1e293b', fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
                  {action.label}
                  <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Appointment Status Distribution</h3>
            {stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Booked', value: stats.totalBooked, color: '#3b82f6', total: stats.totalAppointments },
                  { label: 'Confirmed', value: stats.totalConfirmed, color: '#10b981', total: stats.totalAppointments },
                  { label: 'Completed', value: stats.totalCompleted, color: '#6b7280', total: stats.totalAppointments },
                  { label: 'Cancelled', value: stats.totalCancelled, color: '#ef4444', total: stats.totalAppointments },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.label}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }}>
                      <div style={{
                        height: '100%', borderRadius: 4, background: item.color,
                        width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
