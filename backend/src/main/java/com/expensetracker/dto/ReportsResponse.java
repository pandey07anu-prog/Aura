package com.expensetracker.dto;

import java.util.ArrayList;
import java.util.List;

public class ReportsResponse {

    private FinancialSummaryDto summary = new FinancialSummaryDto();
    private List<CategorySpendingDto> categoryDistribution = new ArrayList<>();
    private List<MonthlyTrendDto> monthlyTrends = new ArrayList<>();
    private CategorySpendingDto highestSpendingCategory;

    public ReportsResponse() {
    }

    public ReportsResponse(FinancialSummaryDto summary, List<CategorySpendingDto> categoryDistribution,
                           List<MonthlyTrendDto> monthlyTrends, CategorySpendingDto highestSpendingCategory) {
        this.summary = summary;
        this.categoryDistribution = categoryDistribution;
        this.monthlyTrends = monthlyTrends;
        this.highestSpendingCategory = highestSpendingCategory;
    }

    public FinancialSummaryDto getSummary() {
        return summary;
    }

    public void setSummary(FinancialSummaryDto summary) {
        this.summary = summary;
    }

    public List<CategorySpendingDto> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(List<CategorySpendingDto> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public List<MonthlyTrendDto> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<MonthlyTrendDto> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }

    public CategorySpendingDto getHighestSpendingCategory() {
        return highestSpendingCategory;
    }

    public void setHighestSpendingCategory(CategorySpendingDto highestSpendingCategory) {
        this.highestSpendingCategory = highestSpendingCategory;
    }
}
