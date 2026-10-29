package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.RecurringTransactionRequest;
import com.expensetracker.dto.RecurringTransactionResponse;
import com.expensetracker.model.RecurringStatus;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    public RecurringTransactionController(RecurringTransactionService recurringService) {
        this.recurringService = recurringService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringTransactionResponse>>> getRecurring(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RecurringTransactionResponse> list = recurringService.getRecurringForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> getRecurringById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        RecurringTransactionResponse response = recurringService.getRecurringById(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> createRecurring(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RecurringTransactionRequest request) {
        RecurringTransactionResponse response = recurringService.createRecurring(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Recurring transaction rule scheduled successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> updateRecurring(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody RecurringTransactionRequest request) {
        RecurringTransactionResponse response = recurringService.updateRecurring(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Recurring transaction rule updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, String> statusMap) {
        String statusStr = statusMap.get("status");
        RecurringStatus status = RecurringStatus.valueOf(statusStr.toUpperCase());
        RecurringTransactionResponse response = recurringService.updateStatus(id, principal.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Recurring rule status set to " + status, response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecurring(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        recurringService.deleteRecurring(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Recurring rule cancelled and removed", null));
    }

    @PostMapping("/process-now")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processNow() {
        int processed = recurringService.processDueRecurringTransactions();
        return ResponseEntity.ok(ApiResponse.success(Map.of("processedCount", processed, "message", "Recurring execution batch finished")));
    }
}
