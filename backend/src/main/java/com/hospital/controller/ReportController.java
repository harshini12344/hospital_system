package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardStats(), "Stats retrieved"));
    }

    @GetMapping("/appointments-per-doctor")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> appointmentsPerDoctor() {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getAppointmentsPerDoctor(), "Report generated"));
    }

    @GetMapping("/revenue-per-department")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> revenuePerDepartment() {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getRevenuePerDepartment(), "Report generated"));
    }
}
