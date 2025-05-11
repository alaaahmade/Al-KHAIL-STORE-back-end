const request = require('supertest');
const { AppDataSource } = require('../../src/config/database');
const app = require('../../src/app');

/**
 * User Controller Tests
 * 
 * These tests verify that the user endpoints work correctly:
 * - Create user
 * - Get all users
 * - Get user by ID
 * - Update user
 * - Delete user
 */

let testUser;

describe('User Controller', () => {
  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Clean up test data if needed
    if (testUser) {
      const userRepository = AppDataSource.getRepository('User');
      try {
        await userRepository.delete(testUser.id);
      } catch (error) {
        console.error('Error cleaning up test user:', error);
      }
    }
  });

  // Test user creation
  test('POST /api/users - Create a new user', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`, // Ensure unique email
      password: 'test123',
      phoneNumber: '1234567890',
      role: 'USER',
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user.firstName).toBe(userData.firstName);
    expect(response.body.data.user.lastName).toBe(userData.lastName);
    expect(response.body.data.user.email).toBe(userData.email);
    
    testUser = response.body.data.user; // Save for later use
  });

  // Test getting all users
  test('GET /api/users - Get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('users');
    expect(Array.isArray(response.body.data.users)).toBe(true);
  });

  // Test getting a specific user
  test('GET /api/users/:id - Get a specific user', async () => {
    if (!testUser) {
      throw new Error('Test user not created, cannot run this test');
    }

    const response = await request(app)
      .get(`/api/users/${testUser.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.id).toBe(testUser.id);
    expect(response.body.data.user.email).toBe(testUser.email);
  });

  // Test updating a user
  test('PATCH /api/users/:id - Update a user', async () => {
    if (!testUser) {
      throw new Error('Test user not created, cannot run this test');
    }

    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    const response = await request(app)
      .patch(`/api/users/${testUser.id}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.firstName).toBe(updateData.firstName);
    expect(response.body.data.user.lastName).toBe(updateData.lastName);
    expect(response.body.data.user.email).toBe(testUser.email); // Email should not change
    
    // Update test user data for subsequent tests
    testUser = response.body.data.user;
  });

  // Test deleting a user
  test('DELETE /api/users/:id - Delete a user', async () => {
    if (!testUser) {
      throw new Error('Test user not created, cannot run this test');
    }

    const response = await request(app)
      .delete(`/api/users/${testUser.id}`)
      .expect(204);
    
    // Reset testUser so cleanup doesn't try to delete again
    testUser = null;
  }, 30000); // Increase Jest timeout for this test to 30 seconds
});