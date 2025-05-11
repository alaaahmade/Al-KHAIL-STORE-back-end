const request = require('supertest');
const { AppDataSource } = require('../../src/config/database');
const app = require('../../src/app');
const { generateToken } = require('../../src/middleware/auth');

describe('Order Controller', () => {
  let testUser;
  let testAdmin;
  let testOrder;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // 1. Create a test user
    testUser = {
      id: 1, // Assuming ID 1 exists or doesn't matter for token gen
      firstName: 'Order',
      lastName: 'Test',
      email: 'ordertest@example.com',
      phoneNumber: '5555551234',
      role: 'USER'
    };

    // 2. Create a test admin user
    testAdmin = {
      id: 2, // Assuming ID 2 exists or doesn't matter for token gen
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admintest@example.com',
      phoneNumber: '5555557890',
      role: 'ADMIN'
    };

    // Generate tokens for test users
    userToken = generateToken(testUser);
    adminToken = generateToken(testAdmin);

  }, 30000); // Longer timeout for initial setup

  afterAll(async () => {
    // Simplified cleanup
    if (AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }, 30000);

  // Authentication tests
  test('GET /api/v1/orders - Should succeed with admin token', async () => {
    const response = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
  }, 15000);

  // Test for non-existent order
  test('GET /api/v1/orders/:id - Should return 404 for non-existent order', async () => {
    const nonExistentId = 999999999; // Unlikely to exist

    const response = await request(app)
      .get(`/api/v1/orders/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBeDefined();
    expect(response.body.message.toLowerCase()).toContain('not found');
  }, 15000);
});