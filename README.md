# 🏥 Hospital Appointment & Doctor Scheduling System

A full-stack Java Spring Boot + React application for managing hospital appointments, doctors, and departments.

---

## 📋 Features

### 👨‍💼 Admin
- Dashboard with live statistics
- Manage departments (CRUD) with consultation fees
- View & filter all appointments
- Cancel confirmed appointments
- Reports: Appointments per Doctor (bar chart), Revenue per Department (pie chart)

### 👨‍⚕️ Doctor
- View daily schedule grouped by date
- Confirm BOOKED → CONFIRMED appointments
- Mark CONFIRMED → COMPLETED
- Manage available time slots (add/delete)

### 🤒 Patient
- Search doctors by name, specialization, or department
- View available slots and book appointments
- Cancel BOOKED appointments
- View appointment history (upcoming & past)

### 🔐 Business Rules Enforced
- ❌ No overlapping doctor appointments
- ❌ No overlapping patient appointments at same time
- ✅ Doctor must have availability slot to be booked
- ✅ Only DOCTOR can confirm appointments
- ✅ Only ADMIN can cancel CONFIRMED appointments
- Status flow: BOOKED → CONFIRMED → COMPLETED (or CANCELLED)

---

## 🛠️ Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Backend    | Spring Boot 3.2     |
| Database   | MySQL 8.x           |
| ORM        | Spring Data JPA     |
| Auth       | JWT (jjwt 0.11.5)   |
| Security   | Spring Security     |
| Frontend   | React 18            |
| HTTP       | Axios               |
| Charts     | Recharts            |
| Toasts     | React Hot Toast     |
| Routing    | React Router v6     |

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+ & npm
- MySQL 8.x running locally

### 1️⃣ Setup MySQL Database
```sql
CREATE DATABASE hospital_db;
```
> The schema is auto-created by Hibernate on startup (`ddl-auto=update`)

### 2️⃣ Configure Database (if needed)
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root   ← change this if needed
```

### 3️⃣ Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: http://localhost:8080

### 4️⃣ Start Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

---

## 🔑 Demo Credentials

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@hospital.com       | admin123    |
| Doctor  | dr.priya@hospital.com    | doctor123   |
| Doctor  | dr.arjun@hospital.com    | doctor123   |
| Doctor  | dr.kavitha@hospital.com  | doctor123   |
| Patient | ravi@example.com         | patient123  |
| Patient | anita@example.com        | patient123  |

---

## 📂 Project Structure

```
hospital-system/
├── backend/                        ← Spring Boot App
│   ├── pom.xml
│   └── src/main/java/com/hospital/
│       ├── HospitalSystemApplication.java
│       ├── config/
│       │   ├── DataInitializer.java     ← Seed data
│       │   └── SecurityConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── AppointmentController.java
│       │   ├── DoctorController.java
│       │   ├── DepartmentController.java
│       │   └── ReportController.java
│       ├── dto/                         ← Request/Response DTOs
│       ├── entity/                      ← JPA Entities
│       │   ├── User.java
│       │   ├── Appointment.java
│       │   ├── AvailableSlot.java
│       │   ├── Department.java
│       │   ├── Role.java (enum)
│       │   └── AppointmentStatus.java (enum)
│       ├── exception/                   ← Custom exceptions + handler
│       ├── repository/                  ← JPA Repositories with queries
│       ├── security/                    ← JWT + Spring Security
│       └── service/                     ← Business logic
│
└── frontend/                        ← React App
    ├── package.json
    └── src/
        ├── App.js                       ← Routes + protected routes
        ├── context/AuthContext.js       ← JWT auth state
        ├── services/api.js              ← Axios API calls
        ├── components/
        │   ├── layout/Sidebar.js
        │   ├── layout/Layout.js
        │   └── common/StatusBadge.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── admin/
            │   ├── AdminDashboard.js
            │   ├── AdminDepartments.js
            │   ├── AdminAppointments.js
            │   └── AdminReports.js
            ├── doctor/
            │   ├── DoctorSchedule.js
            │   └── DoctorSlots.js
            └── patient/
                ├── PatientDoctors.js
                └── PatientAppointments.js
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Access  |
|--------|-----------------------|---------|
| POST   | /api/auth/register    | Public  |
| POST   | /api/auth/login       | Public  |

### Appointments
| Method | Endpoint                         | Access         |
|--------|----------------------------------|----------------|
| POST   | /api/appointments                | PATIENT        |
| GET    | /api/appointments/my             | PATIENT        |
| GET    | /api/appointments/doctor/schedule| DOCTOR         |
| GET    | /api/appointments                | ADMIN          |
| PATCH  | /api/appointments/{id}/confirm   | DOCTOR         |
| PATCH  | /api/appointments/{id}/complete  | DOCTOR         |
| PATCH  | /api/appointments/{id}/cancel    | ADMIN/PATIENT  |

### Doctors & Slots
| Method | Endpoint                          | Access  |
|--------|-----------------------------------|---------|
| GET    | /api/doctors/search               | Public  |
| GET    | /api/doctors/department/{deptId}  | Public  |
| POST   | /api/doctors/slots                | DOCTOR  |
| GET    | /api/doctors/{id}/slots           | Public  |
| DELETE | /api/doctors/slots/{id}           | DOCTOR  |

### Departments
| Method | Endpoint                | Access  |
|--------|-------------------------|---------|
| GET    | /api/departments        | Public  |
| POST   | /api/departments        | ADMIN   |
| PUT    | /api/departments/{id}   | ADMIN   |
| DELETE | /api/departments/{id}   | ADMIN   |

### Reports
| Method | Endpoint                              | Access |
|--------|---------------------------------------|--------|
| GET    | /api/reports/dashboard                | ADMIN  |
| GET    | /api/reports/appointments-per-doctor  | ADMIN  |
| GET    | /api/reports/revenue-per-department   | ADMIN  |

---

## 🧩 Database Schema (MySQL)

```
users           → id, name, email, password, role, specialization, phone, department_id
departments     → id, name, description, consultation_fee
available_slots → id, doctor_id, date, start_time, end_time, is_booked
appointments    → id, patient_id, doctor_id, appointment_date, start_time, end_time, status, notes, created_at
```
