import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import { appointmentApi } from '../../services/api';
import toast from 'react-hot-toast';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    appointmentApi.doctorSchedule()
      .then(res => setAppointments(res.data.data))
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleConfirm = async (id) => {
    try {
      await appointmentApi.confirm(id);
      toast.success('Appointment confirmed!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error confirming');
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentApi.complete(id);
      toast.success('Appointment marked as complete!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error completing');
    }
  };

  // Group by date
  const grouped = appointments.reduce((acc, apt) => {
    const date = apt.appointmentDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <Layout title="My Schedule">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Schedule</h1>
          <p className="page-subtitle">View and manage your appointments</p>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading schedule...</div>
      ) : sortedDates.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No appointments yet</div>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Add available slots so patients can book you</p>
          </div>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '0.875rem', fontWeight: 600, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem'
            }}>
              📅 {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </h3>
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Patient</th><th>Time</th><th>Notes</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(apt => (
                      <tr key={apt.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>🤒 {apt.patient.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.patient.phone}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#1a56db' }}>
                            {String(apt.startTime).substring(0, 5)} – {String(apt.endTime).substring(0, 5)}
                          </span>
                        </td>
                        <td style={{ maxWidth: 200, color: '#64748b', fontSize: '0.8rem' }}>
                          {apt.notes || '—'}
                        </td>
                        <td><StatusBadge status={apt.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {apt.status === 'BOOKED' && (
                              <button className="btn btn-success btn-sm" onClick={() => handleConfirm(apt.id)}>
                                ✅ Confirm
                              </button>
                            )}
                            {apt.status === 'CONFIRMED' && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleComplete(apt.id)}>
                                🏁 Complete
                              </button>
                            )}
                            {(apt.status === 'COMPLETED' || apt.status === 'CANCELLED') && (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </Layout>
  );
};

export default DoctorSchedule;
