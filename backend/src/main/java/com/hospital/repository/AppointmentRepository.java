package com.hospital.repository;

import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND a.status NOT IN ('CANCELLED') " +
           "AND ((a.startTime < :endTime AND a.endTime > :startTime))")
    List<Appointment> findOverlappingDoctorAppointments(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.appointmentDate = :date " +
           "AND a.status NOT IN ('CANCELLED') " +
           "AND ((a.startTime < :endTime AND a.endTime > :startTime))")
    List<Appointment> findOverlappingPatientAppointments(
            @Param("patientId") Long patientId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    // Aggregation: Count appointments per doctor
    @Query("SELECT a.doctor.id, a.doctor.name, COUNT(a) as total FROM Appointment a " +
           "WHERE a.status != 'CANCELLED' GROUP BY a.doctor.id, a.doctor.name")
    List<Object[]> countAppointmentsPerDoctor();

    // Aggregation: Revenue per department
    @Query("SELECT d.name, SUM(d.consultationFee) as revenue, COUNT(a) as total " +
           "FROM Appointment a JOIN a.doctor u JOIN u.department d " +
           "WHERE a.status IN ('CONFIRMED', 'COMPLETED') " +
           "GROUP BY d.name")
    List<Object[]> revenuePerDepartment();

    // All appointments with filters
    @Query("SELECT a FROM Appointment a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:doctorId IS NULL OR a.doctor.id = :doctorId) AND " +
           "(:patientId IS NULL OR a.patient.id = :patientId)")
    List<Appointment> findWithFilters(
            @Param("status") AppointmentStatus status,
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    Long countByStatus(@Param("status") AppointmentStatus status);
}
