const { AppDataSource } = require("../config/database");
const Category = require("../entities/Category");
const AppError = require("../utils/AppError");

class CategoryService {
  getRepository() {
    return AppDataSource.getRepository(Category);
  }

  async createCategory(categoryData) {
    try {
      const now = new Date();

      const category = this.getRepository().create({
        ...categoryData,
        created_at: now,
        time: now,
      });

      return await this.getRepository().save(category);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError("Category already exists", 400);
      }
      throw error;
    }
  }

  async getAllCategories() {
    return await this.getRepository().find();
  }

  async getCategoryById(id) {
    const category = await this.getRepository().findOne({ where: { id } });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  }

  async updateCategory(id, categoryData) {
    const category = await this.getCategoryById(id);
    Object.assign(category, categoryData);
    return await this.getRepository().save(category);
  }

  async deleteCategory(id) {
    const category = await this.getCategoryById(id);
    await this.getRepository().remove(category);
    return { message: "Category deleted successfully" };
  }
}

module.exports = new CategoryService();
