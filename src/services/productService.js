// src/services/productService.js

const { AppDataSource } = require("../config/database");
const Product = require("../entities/Product");
const Category = require("../entities/Category");
const AppError = require("../utils/AppError");

class ProductService {
  getRepository() {
    return AppDataSource.getRepository(Product);
  }

  async getAllProducts() {
    return await this.getRepository().find({
      relations: ["category", "store", "comments"], // تعديل من "categories" إلى "category"
    });
  }

  async getProductById(id) {
    const product = await this.getRepository().findOne({
      where: { id },
      relations: ["category", "store", "comments"], // تعديل من "categories" إلى "category"
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  async createProduct(productData) {
    try {
      if (productData.storeId) {
        productData.store = { id: productData.storeId };
        delete productData.storeId; // إزالة storeId لتجنب التضارب
      }

      const product = this.getRepository().create(productData);
      return await this.getRepository().save(product);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError("Product already exists", 400);
      }
      throw error;
    }
  }

  async updateProduct(id, productData) {
    const product = await this.getProductById(id);

    if (productData.storeId) {
      product.store = { id: productData.storeId };
      delete productData.storeId;
    }

    Object.assign(product, productData);
    return await this.getRepository().save(product);
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    await this.getRepository().remove(product);
    return { message: "Product deleted successfully" };
  }

  async addCategoryToProduct(productId, categoryId) {
    const product = await this.getProductById(productId);
    const categoryRepo = AppDataSource.getRepository(Category);
    const category = await categoryRepo.findOneBy({ id: categoryId });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (!product.category) {
      // تعديل من "categories" إلى "category"
      product.category = [];
    }

    const alreadyExists = product.category.some(
      (cat) => cat.id === category.id
    );
    if (!alreadyExists) {
      product.category.push(category);
      return await this.getRepository().save(product);
    }

    return product; // التصنيف موجود مسبقًا
  }

  async removeCategoryFromProduct(productId, categoryId) {
    const product = await this.getProductById(productId);

    product.category = product.category.filter((cat) => cat.id !== categoryId);

    return await this.getRepository().save(product);
  }
}

module.exports = new ProductService();
