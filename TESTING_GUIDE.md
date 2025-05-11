# E-Commerce Backend Testing Guide

This guide explains how to write and run tests for the e-commerce backend API.

## Testing Setup

The project uses Jest as the testing framework and SuperTest for making HTTP requests to the API endpoints. The tests are designed to be isolated and run independently, without interfering with each other.

### Test Structure

- Tests are organized by route/feature in the `tests/routes` directory
- Test helpers and utilities are in the `tests/helpers` directory
- The main test setup is in `tests/setup.js`

### Test Database

Tests use the same database as the development environment but with careful cleanup of test data after each test to prevent pollution.

## Running Tests

To run all tests in series (recommended):

```bash
npm test
```

To run a specific test file:

```bash
npm test -- tests/routes/user.test.js
```

## Writing Tests

### Basic Test Structure

Each test file should follow this structure:

```javascript
const request = require('supertest');
const { app, startTestServer } = require('../helpers/testAppExtended');
const { TestDataSource } = require('../../src/config/database.test');
const Entity = require('../../src/entities/Entity');

// Start server with a random port for testing
let server;

describe('Feature Name', () => {
  let testData;
  let dataId;
  let uniqueId = Date.now(); // Ensure unique test data

  beforeAll(async () => {
    // Initialize database and server
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    server = startTestServer();
    
    // Create prerequisite data
    // (e.g., create a user before testing user-related features)
  });

  beforeEach(async () => {
    // Set up test data for each test
  });

  afterEach(async () => {
    // Clean up test data after each test
  });

  afterAll(async () => {
    // Clean up all test data and close server
    if (server) {
      server.close();
    }
  });

  // Test API endpoints
  describe('GET /api/endpoint', () => {
    // Test cases for GET endpoint
  });

  describe('POST /api/endpoint', () => {
    // Test cases for POST endpoint
  });

  // Other endpoints...
});
```

### Testing CRUD Operations

For each route, you should test at least the following:

1. **Create (POST)**: Test creating a new resource
   - Success case with all required fields
   - Validation error case with missing fields
   
2. **Read (GET)**: Test retrieving resources
   - Get all resources
   - Get a single resource by ID
   - Get resources by other criteria (if applicable)
   - Not found case
   
3. **Update (PATCH/PUT)**: Test updating a resource
   - Success case with valid data
   - Not found case
   
4. **Delete (DELETE)**: Test deleting a resource
   - Success case
   - Not found case

### Example: Testing GET Routes

```javascript
describe('GET /api/users', () => {
  it('should return all users', async () => {
    const response = await request(app).get('/api/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('GET /api/users/:id', () => {
  it('should return a single user by ID', async () => {
    const response = await request(app).get(`/api/users/${userId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id', userId);
  });

  it('should return 404 if user not found', async () => {
    const nonExistentId = 9999;
    const response = await request(app).get(`/api/users/${nonExistentId}`);
    
    expect(response.status).toBe(404);
  });
});
```

### Example: Testing POST Routes

```javascript
describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '123-456-7890'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    
    // Clean up the created user
    const userRepository = TestDataSource.getRepository(User);
    await userRepository.delete({ email: userData.email });
  });

  it('should return validation error if required fields are missing', async () => {
    const incompleteData = {
      email: 'incomplete@example.com'
      // Missing required fields
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(incompleteData);
    
    expect(response.status).toBe(400);
  });
});
```

## Dealing with Entity Relationships

Testing routes with complex entity relationships requires careful attention to the creation order:

### Creation Order (Important!)

Always create entities in the correct dependency order:

1. **Independent entities first**: Create entities that don't depend on others
   - Categories
   - Users

2. **First-level dependents**: Create entities that depend on independent entities
   - Sellers (depends on Users)
   - Stores (may depend on Sellers)

3. **Second-level dependents**: Create entities that depend on the above
   - Products (depends on Categories, Sellers, and Stores)
   - Carts (depends on Users)

4. **Third-level dependents**: Create entities that depend on second-level entities
   - CartItems (depends on Carts and Products)
   - Orders (depends on Users and Products)
   - Comments (depends on Users and Products)

For example, when testing products:
```javascript
// 1. Create category (independent)
const category = await categoryRepository.save(categoryData);

// 2. Create user (independent)
const user = await userRepository.save(userData);

// 3. Create seller (depends on user)
const seller = await sellerRepository.save({...sellerData, user});

// 4. Create store (depends on seller)
const store = await storeRepository.save({...storeData, seller});

// 5. Create product (depends on category, seller, store)
const product = await productRepository.save({
  ...productData,
  categories: [category],
  seller,
  store
});
```

### Cleanup Order

Clean up in the reverse order of creation:
1. Delete child entities first (Products, CartItems, Comments)
2. Delete parent entities last (Users, Categories)

### Use Unique Identifiers
Add timestamps to names, emails, etc. to prevent conflicts between test runs:
```javascript
const email = `user-${Date.now()}@example.com`;
```

## Tips for Effective Testing

1. **Run tests in series**: Use `--runInBand` to prevent database conflicts

2. **Isolate tests**: Each test should be independent of others
   - Avoid relying on data created by other tests
   - Clean up after each test

3. **Use descriptive assertions**: Make it clear what you're testing
   - `expect(response.status).toBe(200)` is better than `expect(response.status === 200).toBe(true)`

4. **Test error cases**: Don't just test the happy path

5. **Mock external services**: Use jest.mock() for external dependencies

6. **Keep entity structure in mind**: Pay attention to required fields and relationships

## Troubleshooting Common Issues

### Database Constraint Errors

If you see errors like "violates not-null constraint", check:
- The entity schema for required fields
- Your test data to ensure all required fields are provided
- The order of creating and deleting related entities

### Connection Issues

If tests cannot connect to the database:
- Verify database credentials in .env file
- Check if the database server is running
- Try running only one test file at a time

### Duplicate Key Errors

If you see "duplicate key violates unique constraint" errors:
- Use timestamp-based unique identifiers
- Ensure proper cleanup after tests
- Run tests serially with `--runInBand`