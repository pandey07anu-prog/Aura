package com.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class BudgetRequest {

    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.01", message = "Monthly limit must be greater than zero")
    private BigDecimal monthlyLimit;

    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private int month;

    @Min(value = 2000, message = "Year must be valid")
    private int year;

    @Min(value = 1, message = "Alert threshold must be at least 1%")
    @Max(value = 100, message = "Alert threshold cannot exceed 100%")
    private double alertThreshold = 80.0;

    public BudgetRequest() {
    }

    public BudgetRequest(String name, String category, BigDecimal monthlyLimit, int month, int year, double alertThreshold) {
        this.name = name;
        this.category = category;
        this.monthlyLimit = monthlyLimit;
        this.month = month;
        this.year = year;
        this.alertThreshold = alertThreshold > 0 ? alertThreshold : 80.0;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getMonthlyLimit() {
        return monthlyLimit;
    }

    public void setMonthlyLimit(BigDecimal monthlyLimit) {
        this.monthlyLimit = monthlyLimit;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public double getAlertThreshold() {
        return alertThreshold;
    }

    public void setAlertThreshold(double alertThreshold) {
        this.alertThreshold = alertThreshold;
    }
}
