package com.hospital.service;

import com.hospital.entity.AppointmentStatus;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.UserRepository;
import com.hospital.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalDoctors = userRepository.findByRole(Role.DOCTOR).size();
        long totalPatients = userRepository.findByRole(Role.PATIENT).size();
        long totalBooked = appointmentRepository.countByStatus(AppointmentStatus.BOOKED);
        long totalConfirmed = appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED);
        long totalCompleted = appointmentRepository.countByStatus(AppointmentStatus.COMPLETED);
        long totalCancelled = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);

        stats.put("totalDoctors", totalDoctors);
        stats.put("totalPatients", totalPatients);
        stats.put("totalBooked", totalBooked);
        stats.put("totalConfirmed", totalConfirmed);
        stats.put("totalCompleted", totalCompleted);
        stats.put("totalCancelled", totalCancelled);
        stats.put("totalAppointments", totalBooked + totalConfirmed + totalCompleted + totalCancelled);

        return stats;
    }

    public List<Map<String, Object>> getAppointmentsPerDoctor() {
        List<Object[]> results = appointmentRepository.countAppointmentsPerDoctor();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("doctorId", row[0]);
            entry.put("doctorName", row[1]);
            entry.put("totalAppointments", row[2]);
            report.add(entry);
        }

        return report;
    }

    public List<Map<String, Object>> getRevenuePerDepartment() {
        List<Object[]> results = appointmentRepository.revenuePerDepartment();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("departmentName", row[0]);
            entry.put("totalRevenue", row[1] != null ? row[1] : 0);
            entry.put("totalAppointments", row[2]);
            report.add(entry);
        }

        return report;
    }
}
