package com.expensetracker.dto;

import com.expensetracker.model.Budget;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class BudgetResponse {

    private String id;
    private String name;
    private String category;
    private BigDecimal monthlyLimit;
    private BigDecimal spent;
    private BigDecimal remaining;
    private double percentageUsed;
    private boolean isOverBudget;
    private boolean isNearThreshold;
    private int month;
    private int year;
    private double alertThreshold;

    public BudgetResponse() {
    }

    public BudgetResponse(Budget budget, BigDecimal spent) {
        if (budget != null) {
            this.id = budget.getId();
            this.name = budget.getName();
            this.category = budget.getCategory();
            this.monthlyLimit = budget.getMonthlyLimit() != null ? budget.getMonthlyLimit() : BigDecimal.ZERO;
            this.spent = spent != null ? spent : BigDecimal.ZERO;
            this.remaining = this.monthlyLimit.subtract(this.spent);
            if (this.remaining.compareTo(BigDecimal.ZERO) < 0) {
                this.remaining = BigDecimal.ZERO;
            }
            this.month = budget.getMonth();
            this.year = budget.getYear();
            this.alertThreshold = budget.getAlertThreshold();

            if (this.monthlyLimit.compareTo(BigDecimal.ZERO) > 0) {
                this.percentageUsed = this.spent.divide(this.monthlyLimit, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            } else {
                this.percentageUsed = 0.0;
            }

            this.isOverBudget = this.spent.compareTo(this.monthlyLimit) > 0;
            this.isNearThreshold = this.percentageUsed >= this.alertThreshold;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }

    public BigDecimal getRemaining() {
        return remaining;
    }

    public void setRemaining(BigDecimal remaining) {
        this.remaining = remaining;
    }

    public double getPercentageUsed() {
        return percentageUsed;
    }

    public void setPercentageUsed(double percentageUsed) {
        this.percentageUsed = percentageUsed;
    }

    public boolean isOverBudget() {
        return isOverBudget;
    }

    public void setOverBudget(boolean overBudget) {
        isOverBudget = overBudget;
    }

    public boolean isNearThreshold() {
        return isNearThreshold;
    }

    public void setNearThreshold(boolean nearThreshold) {
        isNearThreshold = nearThreshold;
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
