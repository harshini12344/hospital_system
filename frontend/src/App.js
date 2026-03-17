import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminReports from './pages/admin/AdminReports';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorSlots from './pages/doctor/DoctorSlots';
import PatientDoctors from './pages/patient/PatientDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/schedule" />;
  return <Navigate to="/patient/doctors" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminDepartments /></ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminAppointments /></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor/schedule" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}><DoctorSchedule /></ProtectedRoute>
          } />
          <Route path="/doctor/slots" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}><DoctorSlots /></ProtectedRoute>
          } />

          {/* Patient routes */}
          <Route path="/patient/doctors" element={
            <ProtectedRoute allowedRoles={['PATIENT']}><PatientDoctors /></ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['PATIENT']}><PatientAppointments /></ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
