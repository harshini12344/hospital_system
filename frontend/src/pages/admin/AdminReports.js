import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { reportApi } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1a56db', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminReports = () => {
  const [doctorReport, setDoctorReport] = useState([]);
  const [deptReport, setDeptReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportApi.appointmentsPerDoctor(),
      reportApi.revenuePerDepartment()
    ]).then(([dr, dept]) => {
      setDoctorReport(dr.data.data);
      setDeptReport(dept.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Reports"><div className="loading"><div className="spinner" />Loading...</div></Layout>;

  return (
    <Layout title="Reports">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Hospital performance metrics</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>📊 Appointments per Doctor</h3>
            {doctorReport.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={doctorReport} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="doctorName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="totalAppointments" fill="#1a56db" radius={[4, 4, 0, 0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">No data yet</div></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>💰 Revenue per Department</h3>
            {deptReport.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={deptReport}
                    dataKey="totalRevenue"
                    nameKey="departmentName"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    label={({ departmentName, totalRevenue }) => `${departmentName}: ₹${totalRevenue}`}
                    labelLine={false}
                  >
                    {deptReport.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">💰</div><div className="empty-state-title">No revenue data yet</div></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>👨‍⚕️ Doctor Appointment Details</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Doctor</th><th>Total Appointments</th></tr>
                </thead>
                <tbody>
                  {doctorReport.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.doctorName}</td>
                      <td>
                        <span style={{
                          background: '#dbeafe', color: '#1d4ed8',
                          padding: '0.2rem 0.6rem', borderRadius: '9999px',
                          fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {r.totalAppointments}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {doctorReport.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: '#94a3b8' }}>No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🏥 Department Revenue Details</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Department</th><th>Appointments</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {deptReport.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.departmentName}</td>
                      <td>{r.totalAppointments}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>₹{r.totalRevenue}</td>
                    </tr>
                  ))}
                  {deptReport.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8' }}>No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminReports;
