package com.expensetracker.controller;

import com.expensetracker.dto.*;
import com.expensetracker.model.AuditLog;
import com.expensetracker.model.Role;
import com.expensetracker.model.UserStatus;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryDto>> getDashboardSummary() {
        AdminDashboardSummaryDto summary = adminService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserSummaryDto>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Page<UserSummaryDto> users = adminService.getAllUsers(role, status, search, page, size, sortBy, direction);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserDetailDto>> getUserDetails(@PathVariable String id) {
        AdminUserDetailDto userDetails = adminService.getUserDetails(id);
        return ResponseEntity.ok(ApiResponse.success(userDetails));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateUserStatus(
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            @PathVariable String id,
            @Valid @RequestBody UserStatusUpdateRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        UserSummaryDto updated = adminService.updateUserStatus(
                id, request, adminPrincipal.getId(), adminPrincipal.getEmail(), ipAddress
        );
        return ResponseEntity.ok(ApiResponse.success("User account status updated successfully", updated));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = adminService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
