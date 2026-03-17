package com.hospital.repository;

import com.hospital.entity.AvailableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AvailableSlotRepository extends JpaRepository<AvailableSlot, Long> {

    List<AvailableSlot> findByDoctorIdAndDateAndBooked(Long doctorId, LocalDate date, boolean booked);

    List<AvailableSlot> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<AvailableSlot> findByDoctorId(Long doctorId);

    /**
     * Find an available slot that CONTAINS the requested booking window.
     * The slot's startTime must be <= requested startTime,
     * and slot's endTime must be >= requested endTime.
     */
    @Query("SELECT s FROM AvailableSlot s WHERE s.doctor.id = :doctorId " +
           "AND s.date = :date AND s.booked = false " +
           "AND s.startTime <= :startTime AND s.endTime >= :endTime")
    List<AvailableSlot> findAvailableSlot(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
