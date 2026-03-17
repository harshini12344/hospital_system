import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import { appointmentApi } from '../../services/api';
import toast from 'react-hot-toast';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    appointmentApi.myAppointments()
      .then(res => setAppointments(res.data.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentApi.cancel(id);
      toast.success('Appointment cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling');
    }
  };

  const upcoming = appointments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
  const past = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  const AppointmentCard = ({ apt }) => (
    <div className="card" style={{ marginBottom: '0.75rem' }}>
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1.25rem', flexShrink: 0
            }}>
              {apt.doctor.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{apt.doctor.name}</div>
              <div style={{ color: '#1a56db', fontSize: '0.875rem' }}>{apt.doctor.specialization}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{apt.doctor.department?.name}</div>
            </div>
          </div>
          <StatusBadge status={apt.status} />
        </div>

        <div style={{
          display: 'flex', gap: '1.5rem', marginTop: '1rem',
          padding: '0.75rem', background: '#f8fafc', borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>DATE</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>
              {new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TIME</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>
              {String(apt.startTime).substring(0, 5)} – {String(apt.endTime).substring(0, 5)}
            </div>
          </div>
          {apt.notes && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>NOTES</div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{apt.notes}</div>
            </div>
          )}
        </div>

        {(apt.status === 'BOOKED' || apt.status === 'CONFIRMED') && (
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            {apt.status === 'BOOKED' && (
              <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt.id)}>
                ❌ Cancel Appointment
              </button>
            )}
            {apt.status === 'CONFIRMED' && (
              <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600, background: '#d1fae5', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                ✅ Confirmed — please arrive on time
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout title="My Appointments">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">Track your appointment history</p>
        </div>
        <a href="/patient/doctors" className="btn btn-primary">➕ Book New</a>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
                📅 Upcoming ({upcoming.length})
              </h2>
              {upcoming.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#64748b' }}>
                📁 Past ({past.length})
              </h2>
              {past.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
            </div>
          )}

          {appointments.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">No appointments yet</div>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Find a doctor and book your first appointment</p>
                <a href="/patient/doctors" className="btn btn-primary" style={{ marginTop: '1rem' }}>🔍 Find Doctors</a>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default PatientAppointments;
