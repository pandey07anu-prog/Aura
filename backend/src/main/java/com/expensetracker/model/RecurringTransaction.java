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
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "recurring_transactions")
@CompoundIndexes({
    @CompoundIndex(name = "status_next_exec_idx", def = "{'status': 1, 'nextExecutionDate': 1}"),
    @CompoundIndex(name = "user_status_idx", def = "{'userId': 1, 'status': 1}")
})
public class RecurringTransaction {

    @Id
    private String id;

    @Indexed
    private String userId;

    private TransactionType type = TransactionType.EXPENSE;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    private String category;

    private String description;

    private PaymentMethod paymentMethod = PaymentMethod.BANK_TRANSFER;

    private Frequency frequency = Frequency.MONTHLY;

    private LocalDate startDate;

    private LocalDate endDate;

    @Indexed
    private LocalDate nextExecutionDate;

    private LocalDate lastExecutedDate;

    private RecurringStatus status = RecurringStatus.ACTIVE;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    @LastModifiedDate
    private LocalDateTime updatedAt = LocalDateTime.now();

    public RecurringTransaction() {
    }

    public RecurringTransaction(String userId, TransactionType type, BigDecimal amount, String category,
                                String description, PaymentMethod paymentMethod, Frequency frequency,
                                LocalDate startDate, LocalDate endDate) {
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.paymentMethod = paymentMethod;
        this.frequency = frequency;
        this.startDate = startDate;
        this.endDate = endDate;
        this.nextExecutionDate = startDate;
        this.status = RecurringStatus.ACTIVE;
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
