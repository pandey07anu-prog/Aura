package com.expensetracker.dto;

import com.expensetracker.model.TransactionType;

import java.math.BigDecimal;

public class CategorySpendingDto {

    private String category;
    private TransactionType type;
    private BigDecimal amount = BigDecimal.ZERO;
    private double percentage = 0.0;
    private long count = 0;
    private String icon = "tag";
    private String color = "#FFFFFF";

    public CategorySpendingDto() {
    }

    public CategorySpendingDto(String category, TransactionType type, BigDecimal amount,
                               double percentage, long count, String icon, String color) {
        this.category = category;
        this.type = type;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.percentage = percentage;
        this.count = count;
        this.icon = icon != null ? icon : "tag";
        this.color = color != null ? color : "#FFFFFF";
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
