package com.expensetracker.dto;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private UserSummaryDto user;
    private boolean requiresVerification = false;
    private String email;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserSummaryDto user) {
        this.token = token;
        this.type = "Bearer";
        this.user = user;
        this.requiresVerification = false;
    }

    public AuthResponse(boolean requiresVerification, String email, String message) {
        this.requiresVerification = requiresVerification;
        this.email = email;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }

    public boolean isRequiresVerification() {
        return requiresVerification;
    }

    public void setRequiresVerification(boolean requiresVerification) {
        this.requiresVerification = requiresVerification;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
