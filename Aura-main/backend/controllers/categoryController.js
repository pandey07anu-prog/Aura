const categoryService = require('../services/categoryService');
const { success } = require('../utils/apiResponse');

async function getCategories(req, res, next) {
  try {
    const type = req.query.type || null;
    const categories = await categoryService.getCategoriesForUser(req.user._id, type);
    res.json(success(categories));
  } catch (err) {
    next(err);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id, req.user._id);
    res.json(success(category));
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.user._id, req.body);
    res.status(201).json(success(category, 'Category created successfully'));
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.user._id, req.body);
    res.json(success(category, 'Category updated successfully'));
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const options = {
      reassignToCategory: req.query.reassignToCategory || req.body?.reassignToCategory || null,
      archiveInstead: req.query.archiveInstead === 'true' || req.body?.archiveInstead === true
    };
    await categoryService.deleteCategory(req.params.id, req.user._id, options);
    res.json(success(null, 'Category deleted or updated successfully'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
