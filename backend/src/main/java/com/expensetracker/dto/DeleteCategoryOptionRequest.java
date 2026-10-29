package com.expensetracker.dto;

public class DeleteCategoryOptionRequest {

    /**
     * If existing transactions use this category, reassign them to this target category name.
     */
    private String reassignToCategory;

    /**
     * If true, archive the category instead of removing it permanently.
     */
    private boolean archiveInstead = false;

    public DeleteCategoryOptionRequest() {
    }

    public DeleteCategoryOptionRequest(String reassignToCategory, boolean archiveInstead) {
        this.reassignToCategory = reassignToCategory;
        this.archiveInstead = archiveInstead;
    }

    public String getReassignToCategory() {
        return reassignToCategory;
    }

    public void setReassignToCategory(String reassignToCategory) {
        this.reassignToCategory = reassignToCategory;
    }

    public boolean isArchiveInstead() {
        return archiveInstead;
    }

    public void setArchiveInstead(boolean archiveInstead) {
        this.archiveInstead = archiveInstead;
    }
}
