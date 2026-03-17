package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.DepartmentDTO;
import com.hospital.dto.UserDTO;
import com.hospital.entity.*;
import com.hospital.exception.BusinessException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.AvailableSlotRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AvailableSlotRepository slotRepository;

    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request, String patientEmail) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (patient.getRole() != Role.PATIENT) {
            throw new UnauthorizedException("Only patients can book appointments");
        }

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new BusinessException("Selected user is not a doctor");
        }

        // Validate times
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessException("Start time must be before end time");
        }

        // Check doctor overlap
        List<Appointment> doctorConflicts = appointmentRepository.findOverlappingDoctorAppointments(
                doctor.getId(), request.getAppointmentDate(),
                request.getStartTime(), request.getEndTime());
        if (!doctorConflicts.isEmpty()) {
            throw new BusinessException("Doctor already has an appointment in this time slot");
        }

        // Check patient overlap
        List<Appointment> patientConflicts = appointmentRepository.findOverlappingPatientAppointments(
                patient.getId(), request.getAppointmentDate(),
                request.getStartTime(), request.getEndTime());
        if (!patientConflicts.isEmpty()) {
            throw new BusinessException("You already have an appointment in this time slot");
        }

        // Check doctor availability
        List<AvailableSlot> availableSlots = slotRepository.findAvailableSlot(
                doctor.getId(), request.getAppointmentDate(),
                request.getStartTime(), request.getEndTime());
        if (availableSlots.isEmpty()) {
            throw new BusinessException("Doctor is not available in this time slot");
        }

        // Mark slot as booked
        AvailableSlot slot = availableSlots.get(0);
        slot.setBooked(true);
        slotRepository.save(slot);

        // Create appointment
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(AppointmentStatus.BOOKED)
                .notes(request.getNotes())
                .build();

        return mapToResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse confirmAppointment(Long id, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("You can only confirm your own appointments");
        }

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new BusinessException("Only BOOKED appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse completeAppointment(Long id, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("You can only complete your own appointments");
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Only CONFIRMED appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse cancelAppointment(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Only ADMIN can cancel confirmed appointments
        if (appointment.getStatus() == AppointmentStatus.CONFIRMED && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only Admin can cancel confirmed appointments");
        }

        // Patients/Doctors can cancel BOOKED ones
        if (appointment.getStatus() == AppointmentStatus.BOOKED) {
            boolean isOwner = appointment.getPatient().getId().equals(user.getId())
                    || appointment.getDoctor().getId().equals(user.getId())
                    || user.getRole() == Role.ADMIN;
            if (!isOwner) {
                throw new UnauthorizedException("You don't have permission to cancel this appointment");
            }
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED ||
            appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BusinessException("Cannot cancel a " + appointment.getStatus() + " appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> getPatientAppointments(String email) {
        User patient = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return appointmentRepository.findByPatientId(patient.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorAppointments(String email) {
        User doctor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctorId(doctor.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAllAppointments(AppointmentStatus status,
                                                         Long doctorId, Long patientId) {
        return appointmentRepository.findWithFilters(status, doctorId, patientId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AppointmentResponse mapToResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .patient(mapUserToDTO(a.getPatient()))
                .doctor(mapUserToDTO(a.getDoctor()))
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private UserDTO mapUserToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setSpecialization(user.getSpecialization());
        dto.setPhone(user.getPhone());
        if (user.getDepartment() != null) {
            DepartmentDTO deptDTO = new DepartmentDTO();
            deptDTO.setId(user.getDepartment().getId());
            deptDTO.setName(user.getDepartment().getName());
            deptDTO.setDescription(user.getDepartment().getDescription());
            deptDTO.setConsultationFee(user.getDepartment().getConsultationFee());
            dto.setDepartment(deptDTO);
        }
        return dto;
    }
}
