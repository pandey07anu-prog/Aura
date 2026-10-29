package com.expensetracker.dto;

import com.expensetracker.model.PaymentMethod;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransactionResponse {

    private String id;
    private String userId;
    private TransactionType type;
    private BigDecimal amount;
    private String category;
    private LocalDate date;
    private String description;
    private PaymentMethod paymentMethod;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TransactionResponse() {
    }

    public TransactionResponse(Transaction transaction) {
        if (transaction != null) {
            this.id = transaction.getId();
            this.userId = transaction.getUserId();
            this.type = transaction.getType();
            this.amount = transaction.getAmount();
            this.category = transaction.getCategory();
            this.date = transaction.getDate();
            this.description = transaction.getDescription();
            this.paymentMethod = transaction.getPaymentMethod();
            this.notes = transaction.getNotes();
            this.createdAt = transaction.getCreatedAt();
            this.updatedAt = transaction.getUpdatedAt();
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
