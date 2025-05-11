const request = require('supertest');
const { AppDataSource } = require('../../src/config/database');
const app = require('../../src/app');

describe('Product Controller', () => {
  let testProduct;
  let testStore;

  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create a test store if needed for product creation
    const storeRepository = AppDataSource.getRepository('Store');
    const existingStore = await storeRepository.findOne({ where: { name: 'Test Store' } });
    
    if (existingStore) {
      testStore = existingStore;
    } else {
      const storeData = {
        name: 'Test Store',
        description: 'Test store description',
        logo: 'test-logo.png',
        address: 'Test address',
        phoneNumber: '1234567890',
        email: 'teststore@example.com',
        isActive: true
      };
      testStore = await storeRepository.save(storeData);
    }
  });

  afterAll(async () => {
    // Clean up test data if needed
    if (testProduct) {
      const productRepository = AppDataSource.getRepository('Product');
      try {
        await productRepository.delete(testProduct.id);
      } catch (error) {
        console.error('Error cleaning up test product:', error);
      }
    }

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  test('GET /api/v1/products - should return products list', async () => {
    const response = await request(app)
      .get('/api/v1/products')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('products');
  });

  test('POST /api/v1/products - Create a new product', async () => {
    const productData = {
      productName: 'Test Product',
      productImage: 'test-image.jpg',
      productStatus: 'ACTIVE',
      standardPrice: 100,
      offerPrice: 80,
      productDescription: 'Test product description',
      productDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      productQuantity: 10,
      storeId: testStore.id
    };

    const response = await request(app)
      .post('/api/v1/products')
      .send(productData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('product');
    expect(response.body.data.product).toHaveProperty('id');
    expect(response.body.data.product.productName).toBe(productData.productName);
    
    // Save for later use
    testProduct = response.body.data.product;
  }, 20000); // Increase timeout for this test

  test('GET /api/v1/products/:id - Get a specific product', async () => {
    if (!testProduct) {
      throw new Error('Test product not created, cannot run this test');
    }

    const response = await request(app)
      .get(`/api/v1/products/${testProduct.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('product');
    expect(response.body.data.product.id).toBe(testProduct.id);
    expect(response.body.data.product.productName).toBe(testProduct.productName);
  }, 15000); // Increase timeout for this test

  test('PATCH /api/v1/products/:id - Update a product', async () => {
    if (!testProduct) {
      throw new Error('Test product not created, cannot run this test');
    }

    const updateData = {
      productName: 'Updated Product Name',
      productDescription: 'Updated product description'
    };

    const response = await request(app)
      .patch(`/api/v1/products/${testProduct.id}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('product');
    expect(response.body.data.product.productName).toBe(updateData.productName);
    expect(response.body.data.product.productDescription).toBe(updateData.productDescription);
    
    // Update test product data for subsequent tests
    testProduct = response.body.data.product;
  }, 15000); // Increase timeout for this test

  test('DELETE /api/v1/products/:id - Delete a product', async () => {
    if (!testProduct) {
      throw new Error('Test product not created, cannot run this test');
    }

    await request(app)
      .delete(`/api/v1/products/${testProduct.id}`)
      .expect(204);
    
    // Reset testProduct so cleanup doesn't try to delete again
    testProduct = null;
  }, 15000); // Increase Jest timeout for this test to 15 seconds
});