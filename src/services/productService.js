// src/services/productService.js

import { AppDataSource } from "../config/database.js"
import { Category, Product, Store } from '../entities/index.js';
import AppError from "../utils/AppError.js"

class ProductService {
  getRepository() {
    return AppDataSource.getRepository(Product);
  }
  getCategoryRepo(){
    return AppDataSource.getRepository(Category);
  }
  getStoreRepo(){
    return AppDataSource.getRepository(Store);
  }

  async getAllProducts() {
    return await this.getRepository().find({
      relations: ["category", "store", "comments"], // تعديل من "categories" إلى "category"
    });
  }

  async getProductById(id) {
    const product = await this.getRepository().findOne({
      where: { id },
      relations: [
      "category",
      "store",
      "store.seller",
      "store.seller.user",
      "comments",
      "comments.commentReplies",
      "comments.user",
      "comments.commentReplies.user"
    ], // تعديل من "categories" إلى "category"
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  async createProduct(productData) {
    try {
      // Accepts store and category as objects/arrays
      // No need to fetch store by userId; store should be { id }
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

  async getProductsByStoreId(storeId) {
    const ProductRepo = AppDataSource.getRepository(Product);

    return await ProductRepo.find({
      where: { store: { id: storeId } },
      relations: ["category", "store", "comments", "category", "comments"],
    });
  }

  async getFeaturedProducts() {
    return await this.getRepository().find({
      where: { isFeatured: true },
      relations: ["category", "store", "comments",],
    }); 
  }

  async getProductsWithCategories() {
    return this.getCategoryRepo().find({
      relations: ['products', "products.store", "products.comments",]
    })
  }

}

export default new ProductService();
