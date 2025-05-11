const request = require('supertest');
const { AppDataSource } = require('../../src/config/database');
const app = require('../../src/app');

describe('Category Controller', () => {
  let testCategory;

  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testCategory) {
      try {
        const categoryRepository = AppDataSource.getRepository('Category');
        await categoryRepository.delete(testCategory.id);
      } catch (error) {
        console.error('Error cleaning up test category:', error);
      }
    }

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  test('POST /api/v1/categories - Create a new category', async () => {
    // Create category data
    const categoryData = {
      categoryName: 'Test Category',
      categoryImage: { url: 'http://example.com/test-image.jpg' },
      categoryTopic: 'Test Topic',
      status: 'active'
    };

    // Send request to create a category
    const response = await request(app)
      .post('/api/v1/categories')
      .send(categoryData);

    // Check for success
    console.log('Create category response:', JSON.stringify(response.body));
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('category');
    expect(response.body.data.category).toHaveProperty('categoryName', categoryData.categoryName);
    expect(response.body.data.category).toHaveProperty('categoryImage');
    expect(response.body.data.category).toHaveProperty('categoryTopic', categoryData.categoryTopic);
    expect(response.body.data.category).toHaveProperty('status', categoryData.status);
    
    // Save for later tests
    testCategory = response.body.data.category;
  }, 15000);

  test('GET /api/v1/categories - Get all categories', async () => {
    const response = await request(app)
      .get('/api/v1/categories');
    
    console.log('Get all categories response:', JSON.stringify(response.body));
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('categories');
    expect(Array.isArray(response.body.data.categories)).toBe(true);
    
    // Verify our test category is in the list
    if (testCategory) {
      const foundCategory = response.body.data.categories.find(
        category => category.id.toString() === testCategory.id.toString()
      );
      
      expect(foundCategory).toBeTruthy();
    }
  }, 15000);

  test('GET /api/v1/categories/:id - Get a specific category', async () => {
    if (!testCategory) {
      throw new Error('Test category not created, cannot run this test');
    }

    const response = await request(app)
      .get(`/api/v1/categories/${testCategory.id}`);
    
    console.log('Get specific category response:', JSON.stringify(response.body));
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('category');
    expect(response.body.data.category.id.toString()).toBe(testCategory.id.toString());
    expect(response.body.data.category).toHaveProperty('categoryName', testCategory.categoryName);
  }, 15000);

  test('PATCH /api/v1/categories/:id - Update a category', async () => {
    if (!testCategory) {
      throw new Error('Test category not created, cannot run this test');
    }

    const updateData = {
      categoryName: 'Updated Category Name',
      categoryTopic: 'Updated Topic'
    };

    const response = await request(app)
      .patch(`/api/v1/categories/${testCategory.id}`)
      .send(updateData);
    
    console.log('Update category response:', JSON.stringify(response.body));
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('category');
    expect(response.body.data.category).toHaveProperty('categoryName', updateData.categoryName);
    expect(response.body.data.category).toHaveProperty('categoryTopic', updateData.categoryTopic);
    
    // Update test category data for subsequent tests
    testCategory = response.body.data.category;
  }, 15000);

  test('DELETE /api/v1/categories/:id - Delete a category', async () => {
    if (!testCategory) {
      throw new Error('Test category not created, cannot run this test');
    }

    // Save the category ID for verification
    const categoryId = testCategory.id;
    
    const response = await request(app)
      .delete(`/api/v1/categories/${categoryId}`);
    
    console.log('Delete category response status:', response.status);
    
    expect(response.status).toBe(204);
    
    // Add a delay to allow the database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify deletion with a direct database query
    const categoryRepository = AppDataSource.getRepository('Category');
    const deletedCategory = await categoryRepository.findOne({
      where: { id: categoryId }
    });
    
    expect(deletedCategory).toBeNull();
    
    // Reset testCategory since we've deleted it
    testCategory = null;
  }, 15000);
});