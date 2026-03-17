import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import { appointmentApi } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = (status) => {
    setLoading(true);
    appointmentApi.all({ status: status || undefined })
      .then(res => setAppointments(res.data.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleFilterChange = (status) => {
    setFilter(status);
    load(status);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this confirmed appointment?')) return;
    try {
      await appointmentApi.cancel(id);
      toast.success('Appointment cancelled');
      load(filter);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling');
    }
  };

  return (
    <Layout title="All Appointments">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Appointments</h1>
          <p className="page-subtitle">Manage and monitor all appointments</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['', 'BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
          <button
            key={status}
            className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleFilterChange(status)}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.patient.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.patient.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.doctor.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.doctor.specialization}</div>
                    </td>
                    <td>{apt.doctor.department?.name || '—'}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {String(apt.startTime).substring(0,5)} – {String(apt.endTime).substring(0,5)}
                      </div>
                    </td>
                    <td><StatusBadge status={apt.status} /></td>
                    <td>
                      {apt.status === 'CONFIRMED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt.id)}>
                          ❌ Cancel
                        </button>
                      )}
                      {apt.status === 'BOOKED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt.id)}>
                          ❌ Cancel
                        </button>
                      )}
                      {(apt.status === 'COMPLETED' || apt.status === 'CANCELLED') && (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-title">No appointments found</div>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminAppointments;
