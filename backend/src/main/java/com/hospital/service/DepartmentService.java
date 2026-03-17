package com.hospital.service;

import com.hospital.dto.DepartmentDTO;
import com.hospital.entity.Department;
import com.hospital.exception.BusinessException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BusinessException("Department with this name already exists");
        }
        Department dept = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .consultationFee(dto.getConsultationFee())
                .build();
        return mapToDTO(departmentRepository.save(dept));
    }

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        dept.setConsultationFee(dto.getConsultationFee());
        return mapToDTO(departmentRepository.save(dept));
    }

    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        departmentRepository.delete(dept);
    }

    private DepartmentDTO mapToDTO(Department dept) {
        return DepartmentDTO.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .consultationFee(dept.getConsultationFee())
                .build();
    }
}
