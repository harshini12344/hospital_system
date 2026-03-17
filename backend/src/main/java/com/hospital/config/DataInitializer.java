package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.AvailableSlotRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AvailableSlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) return;

        // Create departments
        Department cardiology = departmentRepository.save(Department.builder()
                .name("Cardiology")
                .description("Heart and cardiovascular system")
                .consultationFee(500.0)
                .build());

        Department neurology = departmentRepository.save(Department.builder()
                .name("Neurology")
                .description("Brain and nervous system")
                .consultationFee(600.0)
                .build());

        Department orthopedics = departmentRepository.save(Department.builder()
                .name("Orthopedics")
                .description("Bones, joints and muscles")
                .consultationFee(450.0)
                .build());

        Department pediatrics = departmentRepository.save(Department.builder()
                .name("Pediatrics")
                .description("Child healthcare")
                .consultationFee(400.0)
                .build());

        // Create admin
        userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@hospital.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .phone("9000000000")
                .build());

        // Create doctors
        User dr1 = userRepository.save(User.builder()
                .name("Dr. Priya Sharma")
                .email("dr.priya@hospital.com")
                .password(passwordEncoder.encode("doctor123"))
                .role(Role.DOCTOR)
                .specialization("Cardiologist")
                .phone("9000000001")
                .department(cardiology)
                .build());

        User dr2 = userRepository.save(User.builder()
                .name("Dr. Arjun Mehta")
                .email("dr.arjun@hospital.com")
                .password(passwordEncoder.encode("doctor123"))
                .role(Role.DOCTOR)
                .specialization("Neurologist")
                .phone("9000000002")
                .department(neurology)
                .build());

        User dr3 = userRepository.save(User.builder()
                .name("Dr. Kavitha Nair")
                .email("dr.kavitha@hospital.com")
                .password(passwordEncoder.encode("doctor123"))
                .role(Role.DOCTOR)
                .specialization("Orthopedic Surgeon")
                .phone("9000000003")
                .department(orthopedics)
                .build());

        User dr4 = userRepository.save(User.builder()
                .name("Dr. Suresh Kumar")
                .email("dr.suresh@hospital.com")
                .password(passwordEncoder.encode("doctor123"))
                .role(Role.DOCTOR)
                .specialization("Pediatrician")
                .phone("9000000004")
                .department(pediatrics)
                .build());

        // Create patients
        User patient1 = userRepository.save(User.builder()
                .name("Ravi Verma")
                .email("ravi@example.com")
                .password(passwordEncoder.encode("patient123"))
                .role(Role.PATIENT)
                .phone("9111111111")
                .build());

        userRepository.save(User.builder()
                .name("Anita Singh")
                .email("anita@example.com")
                .password(passwordEncoder.encode("patient123"))
                .role(Role.PATIENT)
                .phone("9222222222")
                .build());

        // Create available slots for next 7 days
        for (int i = 1; i <= 7; i++) {
            LocalDate futureDate = LocalDate.now().plusDays(i);
            createSlots(dr1, futureDate);
            createSlots(dr2, futureDate);
            if (i <= 5) createSlots(dr3, futureDate);
            if (i <= 4) createSlots(dr4, futureDate);
        }

        System.out.println("==============================================");
        System.out.println("  HOSPITAL SYSTEM - SEED DATA LOADED!");
        System.out.println("==============================================");
        System.out.println("  ADMIN:   admin@hospital.com / admin123");
        System.out.println("  DOCTOR:  dr.priya@hospital.com / doctor123");
        System.out.println("  DOCTOR:  dr.arjun@hospital.com / doctor123");
        System.out.println("  PATIENT: ravi@example.com / patient123");
        System.out.println("  PATIENT: anita@example.com / patient123");
        System.out.println("==============================================");
    }

    private void createSlots(User doctor, LocalDate date) {
        LocalTime[] starts = {
            LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
            LocalTime.of(14, 0), LocalTime.of(15, 0), LocalTime.of(16, 0)
        };
        for (LocalTime start : starts) {
            slotRepository.save(AvailableSlot.builder()
                    .doctor(doctor)
                    .date(date)
                    .startTime(start)
                    .endTime(start.plusMinutes(59))
                    .booked(false)
                    .build());
        }
    }
}
