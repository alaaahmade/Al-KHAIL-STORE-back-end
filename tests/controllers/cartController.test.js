const request = require('supertest');
const { AppDataSource } = require('../../src/config/database');
const app = require('../../src/app');

describe('Cart Controller', () => {
  let testUser;
  let testProduct;
  let testStore;
  let testCart;
  let testCartItem;

  // Set up repositories for database operations
  let userRepository;
  let productRepository;
  let storeRepository;
  let cartRepository;
  let cartItemRepository;

  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Initialize repositories
    userRepository = AppDataSource.getRepository('User');
    productRepository = AppDataSource.getRepository('Product');
    storeRepository = AppDataSource.getRepository('Store');
    cartRepository = AppDataSource.getRepository('Cart');
    cartItemRepository = AppDataSource.getRepository('CartItem');

    // Create necessary test data
    
    // 1. Create a test user for the cart
    const userData = {
      firstName: 'Cart',
      lastName: 'Test',
      email: `carttest${Date.now()}@example.com`,
      password: 'password123',
      phoneNumber: '1234567890',
      role: 'USER'
    };

    // First check if user already exists
    let existingUser = await userRepository.findOne({ where: { email: userData.email } });
    if (!existingUser) {
      testUser = await userRepository.save(userData);
    } else {
      testUser = existingUser;
    }

    // 2. Create a test store if needed for product creation
    const storeData = {
      name: 'Test Store Cart',
      description: 'Test store for cart tests',
      logo: 'test-store-cart-logo.png',
      address: 'Test address for cart store',
      phoneNumber: '9876543210',
      email: `teststore.cart${Date.now()}@example.com`,
      isActive: true
    };

    const existingStore = await storeRepository.findOne({ where: { name: storeData.name } });
    if (existingStore) {
      testStore = existingStore;
    } else {
      testStore = await storeRepository.save(storeData);
    }

    // 3. Create a test product for adding to cart
    const productData = {
      productName: 'Test Product for Cart',
      productImage: 'test-product-cart.jpg',
      productStatus: 'ACTIVE',
      standardPrice: 150,
      offerPrice: 120,
      productDescription: 'Test product for cart tests',
      productDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      productQuantity: 50,
      store: testStore
    };

    testProduct = await productRepository.save(productData);
  }, 20000); // Increase timeout for setup

  afterAll(async () => {
    // Clean up test data
    if (testCartItem) {
      try {
        await cartItemRepository.delete(testCartItem.id);
      } catch (error) {
        console.error('Error cleaning up test cart item:', error);
      }
    }

    if (testCart) {
      try {
        await cartRepository.delete(testCart.id);
      } catch (error) {
        console.error('Error cleaning up test cart:', error);
      }
    }

    if (testProduct) {
      try {
        await productRepository.delete(testProduct.id);
      } catch (error) {
        console.error('Error cleaning up test product:', error);
      }
    }

    // Don't delete the test store and user as they might be referenced by other entities

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }, 20000); // Increase timeout for cleanup

  // Tests
  test('POST /api/v1/carts - Create a new cart', async () => {
    const cartData = {
      userId: testUser.id
    };

    const response = await request(app)
      .post('/api/v1/carts')
      .send(cartData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('userId');
    expect(response.body.data.userId).toBe(testUser.id);

    // Save cart for later tests
    testCart = response.body.data;
  }, 15000);

  test('GET /api/v1/carts - Get all carts', async () => {
    const response = await request(app)
      .get('/api/v1/carts')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  }, 15000);

  test('GET /api/v1/carts/:id - Get a specific cart', async () => {
    if (!testCart) {
      throw new Error('Test cart not created, cannot run this test');
    }

    const response = await request(app)
      .get(`/api/v1/carts/${testCart.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe(testCart.id);
    expect(response.body.data.userId).toBe(testUser.id);
  }, 15000);

  test('POST /api/v1/carts/:id/items - Add item to cart', async () => {
    if (!testCart) {
      throw new Error('Test cart not created, cannot run this test');
    }

    const cartItemData = {
      productId: testProduct.id,
      quantity: 2,
      price: testProduct.standardPrice
    };

    const response = await request(app)
      .post(`/api/v1/carts/${testCart.id}/items`)
      .send(cartItemData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('cartId');
    expect(response.body.data).toHaveProperty('productId');
    expect(Number(response.body.data.cartId)).toBe(Number(testCart.id));
    expect(Number(response.body.data.productId)).toBe(Number(testProduct.id));
    expect(Number(response.body.data.quantity)).toBe(cartItemData.quantity);

    // Save cart item for later tests
    testCartItem = response.body.data;
  }, 15000);

  test('GET /api/v1/carts/:id/items - Get cart items', async () => {
    if (!testCart) {
      throw new Error('Test cart not created, cannot run this test');
    }

    const response = await request(app)
      .get(`/api/v1/carts/${testCart.id}/items`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    if (response.body.data.length > 0) {
      const cartItem = response.body.data.find(item => item.id === testCartItem.id);
      expect(cartItem).toBeTruthy();
      expect(Number(cartItem.productId)).toBe(Number(testProduct.id));
    }
  }, 15000);

  test('PATCH /api/v1/carts/:id/items/:itemId - Update cart item', async () => {
    if (!testCart || !testCartItem) {
      throw new Error('Test cart or cart item not created, cannot run this test');
    }

    const updateData = {
      quantity: 3
    };

    const response = await request(app)
      .patch(`/api/v1/carts/${testCart.id}/items/${testCartItem.id}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe(testCartItem.id);
    expect(Number(response.body.data.quantity)).toBe(updateData.quantity);

    // Update test cart item for subsequent tests
    testCartItem = response.body.data;
  }, 15000);

  test('PATCH /api/v1/carts/:id - Update cart', async () => {
    if (!testCart) {
      throw new Error('Test cart not created, cannot run this test');
    }

    const updateData = {
      total: 450 // Updated total based on item price * quantity
    };

    const response = await request(app)
      .patch(`/api/v1/carts/${testCart.id}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe(testCart.id);
    expect(parseFloat(response.body.data.total)).toBe(updateData.total);

    // Update test cart for subsequent tests
    testCart = response.body.data;
  }, 15000);

  test('GET /api/v1/carts/user/:userId - Get user cart', async () => {
    const response = await request(app)
      .get(`/api/v1/carts/user/${testUser.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(Number(response.body.data.userId)).toBe(Number(testUser.id));
  }, 15000);

  test('POST /api/v1/carts/:id/checkout - Checkout cart', async () => {
    if (!testCart) {
      throw new Error('Test cart not created, cannot run this test');
    }

    const response = await request(app)
      .post(`/api/v1/carts/${testCart.id}/checkout`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('message');
  }, 15000);

  test('DELETE /api/v1/carts/:id/items/:itemId - Remove cart item', async () => {
    if (!testCart || !testCartItem) {
      throw new Error('Test cart or cart item not created, cannot run this test');
    }

    await request(app)
      .delete(`/api/v1/carts/${testCart.id}/items/${testCartItem.id}`)
      .expect(204);

    // Reset testCartItem so cleanup doesn't try to delete again
    testCartItem = null;
  }, 15000);

  test('DELETE /api/v1/carts/:id - Delete cart', async () => {
    if (!testCart) {
      throw new Error('Test cart not created, cannot run this test');
    }

    await request(app)
      .delete(`/api/v1/carts/${testCart.id}`)
      .expect(204);

    // Reset testCart so cleanup doesn't try to delete again
    testCart = null;
  }, 15000);
});