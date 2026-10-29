package com.expensetracker.service;

import com.expensetracker.dto.CategoryRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.DeleteCategoryOptionRequest;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Category;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public CategoryService(CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<CategoryResponse> getCategoriesForUser(String userId, TransactionType type) {
        List<Category> categories;
        if (type != null) {
            categories = categoryRepository.findActiveCategoriesForUserAndType(userId, type);
        } else {
            categories = categoryRepository.findActiveCategoriesForUser(userId);
        }

        List<CategoryResponse> responseList = new ArrayList<>();
        for (Category cat : categories) {
            long count = transactionRepository.countByUserIdAndCategory(userId, cat.getName());
            responseList.add(new CategoryResponse(cat, count));
        }
        return responseList;
    }

    public CategoryResponse getCategoryById(String id, String userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.isSystem() && !userId.equals(category.getUserId())) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }

        long count = transactionRepository.countByUserIdAndCategory(userId, category.getName());
        return new CategoryResponse(category, count);
    }

    public CategoryResponse createCategory(String userId, CategoryRequest request) {
        String name = request.getName().trim();

        // Check if name already exists for user or system
        if (categoryRepository.existsByNameIgnoreCaseAndUserId(name, userId)
                || categoryRepository.existsByNameIgnoreCaseAndIsSystemTrue(name)) {
            throw new ConflictException("A category named '" + name + "' already exists");
        }

        Category category = new Category();
        category.setUserId(userId);
        category.setName(name);
        category.setType(request.getType());
        category.setIcon(request.getIcon() != null && !request.getIcon().isBlank() ? request.getIcon() : "tag");
        category.setColor(request.getColor() != null && !request.getColor().isBlank() ? request.getColor() : "#FFFFFF");
        category.setSystem(false);
        category.setArchived(false);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        Category saved = categoryRepository.save(category);
        return new CategoryResponse(saved, 0);
    }

    public CategoryResponse updateCategory(String id, String userId, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (category.isSystem()) {
            throw new BadRequestException("System default categories cannot be modified");
        }

        if (!userId.equals(category.getUserId())) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }

        String oldName = category.getName();
        String newName = request.getName().trim();

        if (!oldName.equalsIgnoreCase(newName)) {
            if (categoryRepository.existsByNameIgnoreCaseAndUserId(newName, userId)
                    || categoryRepository.existsByNameIgnoreCaseAndIsSystemTrue(newName)) {
                throw new ConflictException("A category named '" + newName + "' already exists");
            }

            // Re-label existing transactions to the new category name
            List<Transaction> transactions = transactionRepository.findByUserIdAndCategory(userId, oldName);
            for (Transaction t : transactions) {
                t.setCategory(newName);
                t.setUpdatedAt(LocalDateTime.now());
            }
            if (!transactions.isEmpty()) {
                transactionRepository.saveAll(transactions);
            }
        }

        category.setName(newName);
        category.setType(request.getType());
        if (request.getIcon() != null && !request.getIcon().isBlank()) {
            category.setIcon(request.getIcon());
        }
        if (request.getColor() != null && !request.getColor().isBlank()) {
            category.setColor(request.getColor());
        }
        category.setUpdatedAt(LocalDateTime.now());

        Category saved = categoryRepository.save(category);
        long count = transactionRepository.countByUserIdAndCategory(userId, saved.getName());
        return new CategoryResponse(saved, count);
    }

    public void deleteCategory(String id, String userId, DeleteCategoryOptionRequest options) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (category.isSystem()) {
            throw new BadRequestException("System default categories are protected and cannot be deleted");
        }

        if (!userId.equals(category.getUserId())) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }

        long count = transactionRepository.countByUserIdAndCategory(userId, category.getName());

        if (count > 0) {
            // Check if archive option requested
            if (options != null && options.isArchiveInstead()) {
                category.setArchived(true);
                category.setUpdatedAt(LocalDateTime.now());
                categoryRepository.save(category);
                return;
            }

            // Check if reassignment option requested
            if (options != null && options.getReassignToCategory() != null && !options.getReassignToCategory().isBlank()) {
                String target = options.getReassignToCategory().trim();
                boolean targetExists = categoryRepository.existsByNameIgnoreCaseAndUserId(target, userId)
                        || categoryRepository.existsByNameIgnoreCaseAndIsSystemTrue(target);

                if (!targetExists) {
                    throw new BadRequestException("Target category '" + target + "' does not exist");
                }

                List<Transaction> affected = transactionRepository.findByUserIdAndCategory(userId, category.getName());
                for (Transaction t : affected) {
                    t.setCategory(target);
                    t.setUpdatedAt(LocalDateTime.now());
                }
                transactionRepository.saveAll(affected);

                categoryRepository.delete(category);
                return;
            }

            // Neither option provided: reject with informative conflict
            throw new ConflictException(String.format(
                    "Category '%s' is referenced by %d transaction(s). Please choose to reassign affected transactions to another category or archive this category.",
                    category.getName(), count
            ));
        }

        // If no transactions reference this category, safely delete
        categoryRepository.delete(category);
    }
}
