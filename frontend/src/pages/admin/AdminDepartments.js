import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { departmentApi } from '../../services/api';
import toast from 'react-hot-toast';

const DepartmentModal = ({ dept, onClose, onSave }) => {
  const [form, setForm] = useState(dept || { name: '', description: '', consultationFee: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...form, consultationFee: Number(form.consultationFee) };
      if (dept?.id) {
        await departmentApi.update(dept.id, payload);
        toast.success('Department updated!');
      } else {
        await departmentApi.create(payload);
        toast.success('Department created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving department');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{dept?.id ? 'Edit Department' : 'Add Department'}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Department Name</label>
              <input className="form-control" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Cardiology" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Department description..." />
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Fee (₹)</label>
              <input className="form-control" type="number" value={form.consultationFee}
                onChange={e => setForm({ ...form, consultationFee: e.target.value })}
                placeholder="500" required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {dept?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = () => {
    setLoading(true);
    departmentApi.getAll()
      .then(res => setDepartments(res.data.data))
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await departmentApi.delete(id);
      toast.success('Department deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Departments">
      {modal && <DepartmentModal dept={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Manage hospital departments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          ➕ Add Department
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Consultation Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => (
                  <tr key={dept.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>🏥 {dept.name}</div>
                    </td>
                    <td style={{ maxWidth: 300, color: '#64748b' }}>{dept.description || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#10b981' }}>₹{dept.consultationFee || 0}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setModal(dept)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dept.id)}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr><td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🏥</div>
                      <div className="empty-state-title">No departments yet</div>
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

export default AdminDepartments;
