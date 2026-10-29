const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { BadRequestError, ConflictError, NotFoundError } = require('../middleware/errorHandler');

function buildCategoryResponse(cat, count = 0) {
  return {
    id: cat._id.toString(),
    name: cat.name,
    type: cat.type,
    icon: cat.icon || 'tag',
    color: cat.color || '#FFFFFF',
    isSystem: !!cat.isSystem,
    isArchived: !!cat.isArchived,
    transactionCount: count
  };
}

async function getCategoriesForUser(userId, type = null) {
  const query = {
    $or: [{ userId: userId.toString() }, { isSystem: true }],
    isArchived: false
  };

  if (type) {
    query.type = type.toUpperCase();
  }

  const categories = await Category.find(query);
  const responseList = [];

  for (const cat of categories) {
    const count = await Transaction.countDocuments({
      userId: userId.toString(),
      category: cat.name
    });
    responseList.push(buildCategoryResponse(cat, count));
  }

  return responseList;
}

async function getCategoryById(id, userId) {
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError(`Category not found with id: ${id}`);
  }

  if (!category.isSystem && category.userId !== userId.toString()) {
    throw new NotFoundError(`Category not found with id: ${id}`);
  }

  const count = await Transaction.countDocuments({
    userId: userId.toString(),
    category: category.name
  });

  return buildCategoryResponse(category, count);
}

async function createCategory(userId, request) {
  const name = (request.name || '').trim();
  if (!name || name.length < 2 || name.length > 50) {
    throw new BadRequestError('Category name must be between 2 and 50 characters');
  }

  const type = (request.type || '').toUpperCase();
  if (!['INCOME', 'EXPENSE'].includes(type)) {
    throw new BadRequestError('Category type is required (INCOME or EXPENSE)');
  }

  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    $or: [{ userId: userId.toString() }, { isSystem: true }]
  });

  if (existing) {
    throw new ConflictError(`A category named '${name}' already exists`);
  }

  const category = await Category.create({
    userId: userId.toString(),
    name,
    type,
    icon: request.icon && request.icon.trim() ? request.icon.trim() : 'tag',
    color: request.color && request.color.trim() ? request.color.trim() : '#FFFFFF',
    isSystem: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return buildCategoryResponse(category, 0);
}

async function updateCategory(id, userId, request) {
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError(`Category not found with id: ${id}`);
  }

  if (category.isSystem) {
    throw new BadRequestError('System default categories cannot be modified');
  }

  if (category.userId !== userId.toString()) {
    throw new NotFoundError(`Category not found with id: ${id}`);
  }

  const oldName = category.name;
  const newName = (request.name || '').trim();
  if (!newName || newName.length < 2 || newName.length > 50) {
    throw new BadRequestError('Category name must be between 2 and 50 characters');
  }

  const type = (request.type || '').toUpperCase();
  if (!['INCOME', 'EXPENSE'].includes(type)) {
    throw new BadRequestError('Category type is required (INCOME or EXPENSE)');
  }

  if (oldName.toLowerCase() !== newName.toLowerCase()) {
    const existing = await Category.findOne({
      _id: { $ne: category._id },
      name: { $regex: new RegExp(`^${newName}$`, 'i') },
      $or: [{ userId: userId.toString() }, { isSystem: true }]
    });

    if (existing) {
      throw new ConflictError(`A category named '${newName}' already exists`);
    }

    // Re-label existing transactions to the new category name
    await Transaction.updateMany(
      { userId: userId.toString(), category: oldName },
      { $set: { category: newName, updatedAt: new Date() } }
    );
  }

  category.name = newName;
  category.type = type;
  if (request.icon && request.icon.trim()) {
    category.icon = request.icon.trim();
  }
  if (request.color && request.color.trim()) {
    category.color = request.color.trim();
  }
  category.updatedAt = new Date();

  await category.save();

  const count = await Transaction.countDocuments({
    userId: userId.toString(),
    category: category.name
  });

  return buildCategoryResponse(category, count);
}

async function deleteCategory(id, userId, options = {}) {
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError(`Category not found with id: ${id}`);
  }

  if (category.isSystem) {
    throw new BadRequestError('System default categories are protected and cannot be deleted');
  }

  if (category.userId !== userId.toString()) {
    throw new NotFoundError(`Category not found with id: ${id}`);
  }

  const count = await Transaction.countDocuments({
    userId: userId.toString(),
    category: category.name
  });

  if (count > 0) {
    if (options && options.archiveInstead) {
      category.isArchived = true;
      category.updatedAt = new Date();
      await category.save();
      return;
    }

    if (options && options.reassignToCategory && options.reassignToCategory.trim()) {
      const target = options.reassignToCategory.trim();
      const targetExists = await Category.findOne({
        name: { $regex: new RegExp(`^${target}$`, 'i') },
        $or: [{ userId: userId.toString() }, { isSystem: true }]
      });

      if (!targetExists) {
        throw new BadRequestError(`Target category '${target}' does not exist`);
      }

      await Transaction.updateMany(
        { userId: userId.toString(), category: category.name },
        { $set: { category: target, updatedAt: new Date() } }
      );

      await Category.deleteOne({ _id: id });
      return;
    }

    throw new ConflictError(
      `Category '${category.name}' is referenced by ${count} transaction(s). Please choose to reassign affected transactions to another category or archive this category.`
    );
  }

  await Category.deleteOne({ _id: id });
}

module.exports = {
  getCategoriesForUser,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
