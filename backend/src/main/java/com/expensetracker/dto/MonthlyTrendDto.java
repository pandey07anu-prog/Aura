package com.expensetracker.dto;

import java.math.BigDecimal;

public class MonthlyTrendDto {

    private int month;
    private int year;
    private String monthLabel;
    private BigDecimal income = BigDecimal.ZERO;
    private BigDecimal expense = BigDecimal.ZERO;
    private BigDecimal netSavings = BigDecimal.ZERO;

    public MonthlyTrendDto() {
    }

    public MonthlyTrendDto(int month, int year, String monthLabel, BigDecimal income, BigDecimal expense) {
        this.month = month;
        this.year = year;
        this.monthLabel = monthLabel;
        this.income = income != null ? income : BigDecimal.ZERO;
        this.expense = expense != null ? expense : BigDecimal.ZERO;
        this.netSavings = this.income.subtract(this.expense);
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

    public String getMonthLabel() {
        return monthLabel;
    }

    public void setMonthLabel(String monthLabel) {
        this.monthLabel = monthLabel;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
        recalculateNet();
    }

    public BigDecimal getExpense() {
        return expense;
    }

    public void setExpense(BigDecimal expense) {
        this.expense = expense;
        recalculateNet();
    }

    public BigDecimal getNetSavings() {
        return netSavings;
    }

    public void setNetSavings(BigDecimal netSavings) {
        this.netSavings = netSavings;
    }

    private void recalculateNet() {
        BigDecimal inc = this.income != null ? this.income : BigDecimal.ZERO;
        BigDecimal exp = this.expense != null ? this.expense : BigDecimal.ZERO;
        this.netSavings = inc.subtract(exp);
    }
}
