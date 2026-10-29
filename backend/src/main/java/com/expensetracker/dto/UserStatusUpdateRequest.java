package com.expensetracker.dto;

import com.expensetracker.model.UserStatus;
import jakarta.validation.constraints.NotNull;

public class UserStatusUpdateRequest {

    @NotNull(message = "Status is required (ACTIVE or SUSPENDED)")
    private UserStatus status;

    private String reason;

    public UserStatusUpdateRequest() {
    }

    public UserStatusUpdateRequest(UserStatus status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
