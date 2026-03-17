import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { doctorApi, departmentApi, appointmentApi } from '../../services/api';
import toast from 'react-hot-toast';

const BookingModal = ({ doctor, onClose, onBooked }) => {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const formatTime = (time) => {
    if (!time) return '';
    // Handle both "09:00:00" and "09:00" formats
    return String(time).substring(0, 5);
  };

  const loadSlots = (date) => {
    if (!date) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    doctorApi.getSlots(doctor.id, date)
      .then(res => {
        const data = res.data.data || [];
        // Show only available (not booked) slots
        const available = data.filter(s => !s.booked);
        setSlots(available);
      })
      .catch((err) => {
        console.error('Error loading slots:', err);
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    loadSlots(date);
  };

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot');
    if (!selectedDate) return toast.error('Please select a date');
    setLoading(true);
    try {
      await appointmentApi.book({
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes
      });
      toast.success('Appointment booked successfully!');
      onBooked();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Book Appointment</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.125rem' }}>
              with {doctor.name} • {doctor.specialization}
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Select Date</label>
            <input
              className="form-control" type="date"
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
            />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label className="form-label">
                Available Time Slots
                {slotsLoading && <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '0.5rem' }}>Loading...</span>}
              </label>
              {slotsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', padding: '1rem 0' }}>
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Fetching available slots...
                </div>
              ) : slots.length === 0 ? (
                <div className="alert alert-info">
                  No available slots for this date. Try another date.
                </div>
              ) : (
                <div className="slot-grid">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      className={`slot-btn ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {formatTime(slot.startTime)}<br />
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>to {formatTime(slot.endTime)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes / Reason for Visit (optional)</label>
            <textarea className="form-control" rows={3} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe your symptoms or reason for visit..." />
          </div>

          {doctor.department?.consultationFee && (
            <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#065f46', fontWeight: 600 }}>
                💰 Consultation Fee: ₹{doctor.department.consultationFee}
              </span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleBook} disabled={loading || !selectedSlot || !selectedDate}>
            {loading ? '⏳ Booking...' : '✅ Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const load = () => {
    setLoading(true);
    const req = selectedDept
      ? doctorApi.byDepartment(selectedDept)
      : doctorApi.search(search);
    req.then(res => setDoctors(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    departmentApi.getAll().then(res => setDepartments(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [search, selectedDept]);

  return (
    <Layout title="Find Doctors">
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onBooked={() => {}}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Find a Doctor</h1>
          <p className="page-subtitle">Search and book appointments with our specialists</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <input
            className="form-control"
            placeholder="🔍 Search by name or specialization..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedDept(''); }}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 220 }}
          value={selectedDept}
          onChange={e => { setSelectedDept(e.target.value); setSearch(''); }}
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Searching...</div>
      ) : (
        <>
          <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid-3">
            {doctors.map(doc => (
              <div key={doc.id} className="doctor-card" onClick={() => setBookingDoctor(doc)}>
                <div className="doctor-avatar">
                  {doc.name.charAt(0)}
                </div>
                <div className="doctor-name">{doc.name}</div>
                <div className="doctor-spec">🩺 {doc.specialization || 'General Physician'}</div>
                <div className="doctor-dept">🏥 {doc.department?.name || 'General'}</div>
                {doc.department?.consultationFee && (
                  <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>
                    💰 ₹{doc.department.consultationFee} consultation
                  </div>
                )}
                <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
                  📅 Book Appointment
                </button>
              </div>
            ))}
          </div>
          {doctors.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No doctors found</div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default PatientDoctors;
