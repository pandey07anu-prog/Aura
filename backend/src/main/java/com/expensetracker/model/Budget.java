package com.expensetracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "budgets")
@CompoundIndexes({
    @CompoundIndex(name = "user_cat_month_year_idx", def = "{'userId': 1, 'category': 1, 'month': 1, 'year': 1}", unique = true)
})
public class Budget {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String name;

    private String category;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal monthlyLimit;

    private int month;

    private int year;

    private double alertThreshold = 80.0; // percentage: 80%

    private LocalDateTime lastAlertSentAt;

    private boolean alertSentForThreshold = false;

    private boolean alertSentForExceeded = false;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    @LastModifiedDate
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Budget() {
    }

    public Budget(String userId, String name, String category, BigDecimal monthlyLimit, int month, int year, double alertThreshold) {
        this.userId = userId;
        this.name = name != null && !name.isBlank() ? name : category + " Budget";
        this.category = category;
        this.monthlyLimit = monthlyLimit;
        this.month = month;
        this.year = year;
        this.alertThreshold = alertThreshold > 0 ? alertThreshold : 80.0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public LocalDateTime getLastAlertSentAt() {
        return lastAlertSentAt;
    }

    public void setLastAlertSentAt(LocalDateTime lastAlertSentAt) {
        this.lastAlertSentAt = lastAlertSentAt;
    }

    public boolean isAlertSentForThreshold() {
        return alertSentForThreshold;
    }

    public void setAlertSentForThreshold(boolean alertSentForThreshold) {
        this.alertSentForThreshold = alertSentForThreshold;
    }

    public boolean isAlertSentForExceeded() {
        return alertSentForExceeded;
    }

    public void setAlertSentForExceeded(boolean alertSentForExceeded) {
        this.alertSentForExceeded = alertSentForExceeded;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
