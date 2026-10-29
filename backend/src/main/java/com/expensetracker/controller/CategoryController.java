package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.CategoryRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.DeleteCategoryOptionRequest;
import com.expensetracker.model.TransactionType;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TransactionType type) {
        List<CategoryResponse> categories = categoryService.getCategoriesForUser(principal.getId(), type);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        CategoryResponse response = categoryService.getCategoryById(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestParam(required = false) String reassignToCategory,
            @RequestParam(required = false, defaultValue = "false") boolean archiveInstead,
            @RequestBody(required = false) DeleteCategoryOptionRequest requestBodyOptions) {

        DeleteCategoryOptionRequest options = requestBodyOptions;
        if (options == null) {
            options = new DeleteCategoryOptionRequest(reassignToCategory, archiveInstead);
        } else {
            if (options.getReassignToCategory() == null && reassignToCategory != null) {
                options.setReassignToCategory(reassignToCategory);
            }
            if (!options.isArchiveInstead() && archiveInstead) {
                options.setArchiveInstead(true);
            }
        }

        categoryService.deleteCategory(id, principal.getId(), options);
        return ResponseEntity.ok(ApiResponse.success("Category deleted or updated successfully", null));
    }
}
