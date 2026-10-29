package com.expensetracker.dto;

import com.expensetracker.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
    private String name;

    @NotNull(message = "Category type is required (INCOME or EXPENSE)")
    private TransactionType type;

    private String icon = "tag";

    private String color = "#FFFFFF";

    public CategoryRequest() {
    }

    public CategoryRequest(String name, TransactionType type, String icon, String color) {
        this.name = name;
        this.type = type;
        this.icon = icon != null && !icon.isBlank() ? icon : "tag";
        this.color = color != null && !color.isBlank() ? color : "#FFFFFF";
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
}
