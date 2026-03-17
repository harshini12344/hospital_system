package com.hospital.service;

import com.hospital.dto.DepartmentDTO;
import com.hospital.dto.SlotRequest;
import com.hospital.dto.SlotResponse;
import com.hospital.dto.UserDTO;
import com.hospital.entity.AvailableSlot;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.BusinessException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.repository.AvailableSlotRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;
    private final AvailableSlotRepository slotRepository;

    public List<UserDTO> searchDoctors(String query) {
        List<User> doctors = (query == null || query.isEmpty())
                ? userRepository.findByRole(Role.DOCTOR)
                : userRepository.searchDoctors(query);
        return doctors.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<UserDTO> getDoctorsByDepartment(Long deptId) {
        return userRepository.findDoctorsByDepartment(deptId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public SlotResponse addSlot(SlotRequest request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new UnauthorizedException("Only doctors can add slots");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessException("Start time must be before end time");
        }

        if (request.getDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Cannot add slots for past dates");
        }

        AvailableSlot slot = AvailableSlot.builder()
                .doctor(doctor)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .booked(false)
                .build();

        return mapSlotToDTO(slotRepository.save(slot));
    }

    public List<SlotResponse> getDoctorSlots(Long doctorId, LocalDate date) {
        List<AvailableSlot> slots = (date != null)
                ? slotRepository.findByDoctorIdAndDate(doctorId, date)
                : slotRepository.findByDoctorId(doctorId);
        return slots.stream().map(this::mapSlotToDTO).collect(Collectors.toList());
    }

    public void deleteSlot(Long slotId, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        AvailableSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("Cannot delete another doctor's slot");
        }
        if (slot.isBooked()) {
            throw new BusinessException("Cannot delete a booked slot");
        }
        slotRepository.delete(slot);
    }

    private UserDTO mapToDTO(User user) {
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

    private SlotResponse mapSlotToDTO(AvailableSlot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctor().getId())
                .doctorName(slot.getDoctor().getName())
                .date(slot.getDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .booked(slot.isBooked())
                .build();
    }
}
