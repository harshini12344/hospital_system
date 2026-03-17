package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.AppointmentStatus;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(
            @Valid @RequestBody AppointmentRequest request,
            Principal principal) {
        AppointmentResponse response = appointmentService.bookAppointment(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment booked successfully"));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirm(
            @PathVariable Long id, Principal principal) {
        AppointmentResponse response = appointmentService.confirmAppointment(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment confirmed"));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> complete(
            @PathVariable Long id, Principal principal) {
        AppointmentResponse response = appointmentService.completeAppointment(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment completed"));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(
            @PathVariable Long id, Principal principal) {
        AppointmentResponse response = appointmentService.cancelAppointment(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment cancelled"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> myAppointments(Principal principal) {
        List<AppointmentResponse> appointments = appointmentService.getPatientAppointments(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(appointments, "Appointments retrieved"));
    }

    @GetMapping("/doctor/schedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> doctorSchedule(Principal principal) {
        List<AppointmentResponse> appointments = appointmentService.getDoctorAppointments(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(appointments, "Schedule retrieved"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> all(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId) {
        List<AppointmentResponse> appointments = appointmentService.getAllAppointments(status, doctorId, patientId);
        return ResponseEntity.ok(ApiResponse.success(appointments, "Appointments retrieved"));
    }
}
