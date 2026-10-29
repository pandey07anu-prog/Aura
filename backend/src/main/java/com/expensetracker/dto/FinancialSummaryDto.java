package com.expensetracker.dto;

import java.math.BigDecimal;

public class FinancialSummaryDto {

    private BigDecimal totalIncome = BigDecimal.ZERO;
    private BigDecimal totalExpenses = BigDecimal.ZERO;
    private BigDecimal currentBalance = BigDecimal.ZERO;
    private BigDecimal remainingMonthlyBudget = BigDecimal.ZERO;
    private double savingsRate = 0.0;
    private long totalTransactions = 0;
    private Double incomeChangePercent;
    private Double expenseChangePercent;
    private boolean hasData = false;

    public FinancialSummaryDto() {
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

    public BigDecimal getRemainingMonthlyBudget() {
        return remainingMonthlyBudget;
    }

    public void setRemainingMonthlyBudget(BigDecimal remainingMonthlyBudget) {
        this.remainingMonthlyBudget = remainingMonthlyBudget;
    }

    public double getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(double savingsRate) {
        this.savingsRate = savingsRate;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public Double getIncomeChangePercent() {
        return incomeChangePercent;
    }

    public void setIncomeChangePercent(Double incomeChangePercent) {
        this.incomeChangePercent = incomeChangePercent;
    }

    public Double getExpenseChangePercent() {
        return expenseChangePercent;
    }

    public void setExpenseChangePercent(Double expenseChangePercent) {
        this.expenseChangePercent = expenseChangePercent;
    }

    public boolean isHasData() {
        return hasData;
    }

    public void setHasData(boolean hasData) {
        this.hasData = hasData;
    }
}
