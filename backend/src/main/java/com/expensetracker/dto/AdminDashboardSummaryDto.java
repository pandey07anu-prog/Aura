package com.expensetracker.dto;

import java.math.BigDecimal;

public class AdminDashboardSummaryDto {

    private long totalUsers = 0;
    private long activeUsers = 0;
    private long suspendedUsers = 0;
    private long newUsersThisMonth = 0;
    private long totalTransactions = 0;
    private BigDecimal aggregateIncomeVolume = BigDecimal.ZERO;
    private BigDecimal aggregateExpenseVolume = BigDecimal.ZERO;
    private long totalCategoriesCount = 0;
    private long totalActiveRecurringRules = 0;

    public AdminDashboardSummaryDto() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getSuspendedUsers() {
        return suspendedUsers;
    }

    public void setSuspendedUsers(long suspendedUsers) {
        this.suspendedUsers = suspendedUsers;
    }

    public long getNewUsersThisMonth() {
        return newUsersThisMonth;
    }

    public void setNewUsersThisMonth(long newUsersThisMonth) {
        this.newUsersThisMonth = newUsersThisMonth;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public BigDecimal getAggregateIncomeVolume() {
        return aggregateIncomeVolume;
    }

    public void setAggregateIncomeVolume(BigDecimal aggregateIncomeVolume) {
        this.aggregateIncomeVolume = aggregateIncomeVolume;
    }

    public BigDecimal getAggregateExpenseVolume() {
        return aggregateExpenseVolume;
    }

    public void setAggregateExpenseVolume(BigDecimal aggregateExpenseVolume) {
        this.aggregateExpenseVolume = aggregateExpenseVolume;
    }

    public long getTotalCategoriesCount() {
        return totalCategoriesCount;
    }

    public void setTotalCategoriesCount(long totalCategoriesCount) {
        this.totalCategoriesCount = totalCategoriesCount;
    }

    public long getTotalActiveRecurringRules() {
        return totalActiveRecurringRules;
    }

    public void setTotalActiveRecurringRules(long totalActiveRecurringRules) {
        this.totalActiveRecurringRules = totalActiveRecurringRules;
    }
}
