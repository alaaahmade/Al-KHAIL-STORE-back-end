const request = require('supertest');
const { AppDataSource } = require('../../src/config/database');
const app = require('../../src/app');

describe('Store Controller', () => {
  let testStore;

  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testStore) {
      const storeRepository = AppDataSource.getRepository('Store');
      try {
        await storeRepository.delete(testStore.id);
      } catch (error) {
        console.error('Error cleaning up test store:', error);
      }
    }

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  test('POST /api/v1/stores - Create a new store', async () => {
    // Create store data
    const storeData = {
      name: 'Test Store',
      description: 'Test store description',
      logo: 'test-logo.png',
      address: 'Test address',
      phoneNumber: '1234567890',
      email: `teststore${Date.now()}@example.com`,
      isActive: true
    };

    // Send request to create a store
    const response = await request(app)
      .post('/api/v1/stores')
      .send(storeData);

    // Check for success
    console.log('Create store response:', JSON.stringify(response.body));
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('store');
    
    // Save for later tests
    testStore = response.body.data.store;
    
    // Verify store properties
    expect(testStore.name).toBe(storeData.name);
    expect(testStore.description).toBe(storeData.description);
    expect(testStore.address).toBe(storeData.address);
    expect(testStore.phoneNumber).toBe(storeData.phoneNumber);
    expect(testStore.email).toBe(storeData.email);
  }, 15000);

  test('GET /api/v1/stores - Get all stores', async () => {
    const response = await request(app)
      .get('/api/v1/stores');
    
    console.log('Get all stores response:', JSON.stringify(response.body));
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('stores');
    expect(Array.isArray(response.body.data.stores)).toBe(true);
    
    // Verify our test store is in the list
    const foundStore = response.body.data.stores.find(
      store => store.id === testStore.id
    );
    
    expect(foundStore).toBeTruthy();
  }, 15000);

  test('GET /api/v1/stores/:id - Get a specific store', async () => {
    if (!testStore) {
      throw new Error('Test store not created, cannot run this test');
    }

    const response = await request(app)
      .get(`/api/v1/stores/${testStore.id}`);
    
    console.log('Get specific store response:', JSON.stringify(response.body));
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('store');
    expect(response.body.data.store.id).toBe(testStore.id);
    expect(response.body.data.store.name).toBe(testStore.name);
  }, 15000);

  test('PATCH /api/v1/stores/:id - Update a store', async () => {
    if (!testStore) {
      throw new Error('Test store not created, cannot run this test');
    }

    const updateData = {
      name: 'Updated Store Name',
      description: 'Updated store description'
    };

    const response = await request(app)
      .patch(`/api/v1/stores/${testStore.id}`)
      .send(updateData);
    
    console.log('Update store response:', JSON.stringify(response.body));
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('store');
    expect(response.body.data.store.name).toBe(updateData.name);
    expect(response.body.data.store.description).toBe(updateData.description);
    
    // Update test store data for subsequent tests
    testStore = response.body.data.store;
  }, 15000);

  test('PATCH /api/v1/stores/:id/status - Update store status', async () => {
    if (!testStore) {
      throw new Error('Test store not created, cannot run this test');
    }

    // First, explicitly set the store to inactive via direct DB update
    const storeRepo = AppDataSource.getRepository('Store');
    await storeRepo.update(testStore.id, { isActive: false });
    
    // Verify the store is now inactive
    const inactiveStore = await storeRepo.findOne({
      where: { id: testStore.id }
    });
    console.log('Store before status update:', inactiveStore);
    expect(inactiveStore.isActive).toBe(false);
    
    // Now send the request to update to active
    const updateData = {
      status: 'active'
    };

    const response = await request(app)
      .patch(`/api/v1/stores/${testStore.id}/status`)
      .send(updateData);
    
    console.log('Update store status response:', JSON.stringify(response.body));
    
    // Add a small delay to allow the database to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Re-fetch to verify the update
    const updatedStore = await storeRepo.findOne({
      where: { id: testStore.id }
    });
    
    console.log('Store after status update:', updatedStore);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(updatedStore).toBeTruthy();
    expect(updatedStore.isActive).toBe(true);
    
    // Update test store data for subsequent tests
    testStore = updatedStore;
  }, 15000);

  test('DELETE /api/v1/stores/:id - Delete a store', async () => {
    if (!testStore) {
      throw new Error('Test store not created, cannot run this test');
    }

    // Save the store ID for verification
    const storeId = testStore.id;
    
    const response = await request(app)
      .delete(`/api/v1/stores/${storeId}`);
    
    console.log('Delete store response status:', response.status);
    
    expect(response.status).toBe(204);
    
    // Add a delay to allow the database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify deletion with a raw query
    const result = await AppDataSource.query(
      `SELECT COUNT(*) FROM "Store" WHERE "id" = $1`, 
      [storeId]
    );
    
    console.log('Query result after delete:', result);
    
    // Result should be [{ count: '0' }] if the store was deleted
    expect(parseInt(result[0].count)).toBe(0);
    
    // Reset testStore so cleanup doesn't try to delete again
    testStore = null;
  }, 15000);
});