import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { doctorApi } from '../../services/api';
import toast from 'react-hot-toast';

const DoctorSlots = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '' });
  const [adding, setAdding] = useState(false);

  const load = () => {
    if (!user?.id) return;
    setLoading(true);
    doctorApi.getSlots(user.id)
      .then(res => setSlots(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const handleAdd = async e => {
    e.preventDefault();
    setAdding(true);
    try {
      await doctorApi.addSlot(form);
      toast.success('Slot added!');
      setForm({ date: '', startTime: '', endTime: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding slot');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await doctorApi.deleteSlot(id);
      toast.success('Slot deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete booked slot');
    }
  };

  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  return (
    <Layout title="Manage Slots">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Available Slots</h1>
          <p className="page-subtitle">Add time slots for patients to book</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>➕ Add New Slot</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-control" type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-control" type="time" value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-control" type="time" value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={adding}>
                {adding ? '⏳ Adding...' : '➕ Add Slot'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>📊 Slot Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>Total Slots</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{slots.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#d1fae5', borderRadius: '8px' }}>
                <span style={{ color: '#065f46' }}>Available</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#065f46' }}>
                  {slots.filter(s => !s.booked).length}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#fee2e2', borderRadius: '8px' }}>
                <span style={{ color: '#991b1b' }}>Booked</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#991b1b' }}>
                  {slots.filter(s => s.booked).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading slots...</div>
      ) : (
        Object.keys(grouped).sort().map(date => (
          <div key={date} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '0.875rem', fontWeight: 600, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'
            }}>
              📅 {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </h3>
            <div className="slot-grid">
              {grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                <div key={slot.id} style={{
                  background: slot.booked ? '#f1f5f9' : 'white',
                  border: `1px solid ${slot.booked ? '#cbd5e1' : '#bfdbfe'}`,
                  borderRadius: '8px', padding: '0.75rem',
                  position: 'relative'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: slot.booked ? '#94a3b8' : '#1e293b' }}>
                    {String(slot.startTime).substring(0, 5)} – {String(slot.endTime).substring(0, 5)}
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {slot.booked
                      ? <span style={{ color: '#ef4444' }}>🔒 Booked</span>
                      : <span style={{ color: '#10b981' }}>✅ Available</span>
                    }
                  </div>
                  {!slot.booked && (
                    <button
                      onClick={() => handleDelete(slot.id)}
                      style={{
                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: '#ef4444', fontSize: '0.75rem'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {!loading && slots.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🕐</div>
            <div className="empty-state-title">No slots added yet</div>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Add your availability so patients can book appointments</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DoctorSlots;
