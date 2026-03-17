package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.SlotRequest;
import com.hospital.dto.SlotResponse;
import com.hospital.dto.UserDTO;
import com.hospital.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDTO>>> search(
            @RequestParam(required = false) String query) {
        List<UserDTO> doctors = doctorService.searchDoctors(query);
        return ResponseEntity.ok(ApiResponse.success(doctors, "Doctors found"));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> byDepartment(@PathVariable Long deptId) {
        List<UserDTO> doctors = doctorService.getDoctorsByDepartment(deptId);
        return ResponseEntity.ok(ApiResponse.success(doctors, "Doctors found"));
    }

    @PostMapping("/slots")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<SlotResponse>> addSlot(
            @Valid @RequestBody SlotRequest request,
            Principal principal) {
        SlotResponse slot = doctorService.addSlot(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(slot, "Slot added successfully"));
    }

    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SlotResponse> slots = doctorService.getDoctorSlots(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success(slots, "Slots retrieved"));
    }

    @DeleteMapping("/slots/{slotId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(
            @PathVariable Long slotId, Principal principal) {
        doctorService.deleteSlot(slotId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Slot deleted"));
    }
}
