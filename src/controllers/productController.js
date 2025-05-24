import productService from "../services/productService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";


/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productImage
 *               - productStatus
 *               - standardPrice
 *               - offerPrice
 *               - productDescription
 *               - productDate
 *               - productQuantity
 *               - storeId
 *             properties:
 *               productName:
 *                 type: string
 *               productImage:
 *                 type: string
 *               productStatus:
 *                 type: string
 *               standardPrice:
 *                 type: number
 *               offerPrice:
 *                 type: number
 *               productDescription:
 *                 type: string
 *               productDate:
 *                 type: string
 *                 format: date
 *               productQuantity:
 *                 type: number
 *               storeId:
 *                 type: integer
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 */
const createProduct = catchAsync(async (req, res, next) => {
  try {
    const { category, storeId, productGallery, ...productData } = req.body;
    // Validate required fields
    if (!storeId) {
      return next(new AppError('storeId is required', 400));
    }
    if (!category || !Array.isArray(category) || category.length === 0) {
      return next(new AppError('At least one category is required', 400));
    }
    // Fetch categories
    const categories = await productService.getCategoryRepo().findByIds(category);
    if (categories.length !== category.length) {
      return next(new AppError('One or more categories not found', 404));
    }
    // Prepare product data
    const newProductData = {
      ...productData,
      productGallery: Array.isArray(productGallery) ? productGallery : [],
      store: { id: storeId },
      category: categories
    };
    // Create and save product
    const product = await productService.createProduct(newProductData);
    res.status(201).json({
      status: "success",
      data: { product },
    });
  } catch (err) {
    next(err);
  }
});
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await productService.getAllProducts();
  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
const getProduct = catchAsync(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               productImage:
 *                 type: string
 *               productStatus:
 *                 type: string
 *               standardPrice:
 *                 type: number
 *               offerPrice:
 *                 type: number
 *               productDescription:
 *                 type: string
 *               productDate:
 *                 type: string
 *                 format: date
 *               productQuantity:
 *                 type: number
 *               storeId:
 *                 type: integer
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
const updateProduct = catchAsync(async (req, res, next) => {
  try {
    const { category, storeId, productGallery, ...productData } = req.body;
    // Validate required fields
    if (!storeId) {
      return next(new AppError('storeId is required', 400));
    }
    if (!category || !Array.isArray(category) || category.length === 0) {
      return next(new AppError('At least one category is required', 400));
    }
    // Fetch categories
    const categories = await productService.getCategoryRepo().findByIds(category);
    if (categories.length !== category.length) {
      return next(new AppError('One or more categories not found', 404));
    }
    // Prepare updated product data
    const updatedProductData = {
      ...productData,
      productGallery: Array.isArray(productGallery) ? productGallery : [],
      store: { id: storeId },
      category: categories
    };
    // Update and save product
    const product = await productService.updateProduct(req.params.id, updatedProductData);
    res.status(200).json({
      status: "success",
      data: { product },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
const deleteProduct = catchAsync(async (req, res, next) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/v1/products/{id}/categories/{categoryId}:
 *   post:
 *     summary: Add a category to a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category added to product successfully
 *       404:
 *         description: Product or Category not found
 */
const addCategory = catchAsync(async (req, res, next) => {
  const product = await productService.addCategoryToProduct(
    req.params.id,
    req.params.categoryId
  );
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

/**
 * @swagger
 * /api/v1/products/{id}/categories/{categoryId}:
 *   delete:
 *     summary: Remove a category from a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category removed from product successfully
 *       404:
 *         description: Product or Category not found
 */
const removeCategory = catchAsync(async (req, res, next) => {
  const product = await productService.removeCategoryFromProduct(
    req.params.id,
    req.params.categoryId
  );
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

/**
 * @swagger
 * /api/products/store/{storeId}:
 *   get:
 *     summary: Get products by store ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Store ID
 *     responses:
 *       200:
 *         description: List of products for the store
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 */
const getProductsByStore = catchAsync(async (req, res) => {
  const products = await productService.getProductsByStoreId(
    req.params.storeId
  );
  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

const getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await productService.getFeaturedProducts();
  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

const getProductsWithCategories = catchAsync(async(req, res) => {
  const products = await productService.getProductsWithCategories()
  res.status(200).json({
    data: products,
    status: 'success'
  })
})


export default {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  removeCategory,
  getProductsByStore,
  getFeaturedProducts,
  getProductsWithCategories
}