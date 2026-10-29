package com.expensetracker.dto;

import com.expensetracker.model.Frequency;
import com.expensetracker.model.PaymentMethod;
import com.expensetracker.model.RecurringStatus;
import com.expensetracker.model.RecurringTransaction;
import com.expensetracker.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class RecurringTransactionResponse {

    private String id;
    private String userId;
    private TransactionType type;
    private BigDecimal amount;
    private String category;
    private String description;
    private PaymentMethod paymentMethod;
    private Frequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextExecutionDate;
    private LocalDate lastExecutedDate;
    private RecurringStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RecurringTransactionResponse() {
    }

    public RecurringTransactionResponse(RecurringTransaction recurring) {
        if (recurring != null) {
            this.id = recurring.getId();
            this.userId = recurring.getUserId();
            this.type = recurring.getType();
            this.amount = recurring.getAmount();
            this.category = recurring.getCategory();
            this.description = recurring.getDescription();
            this.paymentMethod = recurring.getPaymentMethod();
            this.frequency = recurring.getFrequency();
            this.startDate = recurring.getStartDate();
            this.endDate = recurring.getEndDate();
            this.nextExecutionDate = recurring.getNextExecutionDate();
            this.lastExecutedDate = recurring.getLastExecutedDate();
            this.status = recurring.getStatus();
            this.createdAt = recurring.getCreatedAt();
            this.updatedAt = recurring.getUpdatedAt();
        }
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Frequency getFrequency() {
        return frequency;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getNextExecutionDate() {
        return nextExecutionDate;
    }

    public void setNextExecutionDate(LocalDate nextExecutionDate) {
        this.nextExecutionDate = nextExecutionDate;
    }

    public LocalDate getLastExecutedDate() {
        return lastExecutedDate;
    }

    public void setLastExecutedDate(LocalDate lastExecutedDate) {
        this.lastExecutedDate = lastExecutedDate;
    }

    public RecurringStatus getStatus() {
        return status;
    }

    public void setStatus(RecurringStatus status) {
        this.status = status;
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
