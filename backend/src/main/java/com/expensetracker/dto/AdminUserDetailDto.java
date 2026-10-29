package com.expensetracker.dto;

import com.expensetracker.model.AuditLog;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AdminUserDetailDto {

    private UserSummaryDto user;
    private BigDecimal totalIncome = BigDecimal.ZERO;
    private BigDecimal totalExpenses = BigDecimal.ZERO;
    private BigDecimal currentBalance = BigDecimal.ZERO;
    private long transactionCount = 0;
    private List<CategorySpendingDto> topCategories = new ArrayList<>();
    private List<TransactionResponse> recentTransactions = new ArrayList<>();
    private List<AuditLog> auditLogs = new ArrayList<>();

    public AdminUserDetailDto() {
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }

    public List<CategorySpendingDto> getTopCategories() {
        return topCategories;
    }

    public void setTopCategories(List<CategorySpendingDto> topCategories) {
        this.topCategories = topCategories;
    }

    public List<TransactionResponse> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionResponse> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogs;
    }

    public void setAuditLogs(List<AuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }
}
