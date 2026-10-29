package com.expensetracker.dto;

import com.expensetracker.model.Category;
import com.expensetracker.model.TransactionType;

public class CategoryResponse {

    private String id;
    private String name;
    private TransactionType type;
    private String icon;
    private String color;
    private boolean isSystem;
    private boolean isArchived;
    private long transactionCount;

    public CategoryResponse() {
    }

    public CategoryResponse(Category category, long transactionCount) {
        if (category != null) {
            this.id = category.getId();
            this.name = category.getName();
            this.type = category.getType();
            this.icon = category.getIcon();
            this.color = category.getColor();
            this.isSystem = category.isSystem();
            this.isArchived = category.isArchived();
            this.transactionCount = transactionCount;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
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

    public boolean isSystem() {
        return isSystem;
    }

    public void setSystem(boolean system) {
        isSystem = system;
    }

    public boolean isArchived() {
        return isArchived;
    }

    public void setArchived(boolean archived) {
        isArchived = archived;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }
}
