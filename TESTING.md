# E-Commerce Backend Testing Guide

This document outlines the testing strategy for the e-commerce backend service.

## Testing Approach

The project follows a comprehensive testing approach with multiple levels:

1. **Unit Tests:** Testing individual components in isolation
2. **Integration Tests:** Testing interaction between components
3. **API Tests:** Testing API endpoints
4. **End-to-End Tests:** Testing complete workflows

## Test Environment

Tests are designed to run in an isolated environment:

- **In-memory SQLite database** for fast and isolated database testing
- **Test-specific entities** that are simplified versions of production entities
- **Clean database state** between tests to ensure test isolation

## Running Tests

```bash
# Run all tests
npm test

# Run specific tests
npm test -- tests/simplified/user.test.js

# Run tests with coverage
npm test -- --coverage
```

## Test Structure

Tests are organized by route/feature:

```
tests/
├── helpers/              # Test helpers and utilities
│   └── testEntities.js   # Test-specific entity definitions
├── routes/               # API route tests
│   ├── user.test.js
│   ├── product.test.js
│   └── ...
├── simplified/           # Simplified example tests
│   ├── user.test.js      # Basic entity test
│   └── userApi.test.js   # Basic API test
└── setup.js              # Test setup file
```

## Best Practices

1. **Test Isolation:** Each test should be independent of others
2. **Clean Up:** Clean up resources after each test
3. **Mock External Services:** Use mocks for external services
4. **Test Edge Cases:** Include tests for error conditions and edge cases
5. **Test Coverage:** Aim for high test coverage of critical paths

## Example Test

A typical API test structure:

```javascript
describe('Feature: User Management', () => {
  beforeAll(() => {
    // Set up test database
  });

  afterAll(() => {
    // Clean up database connection
  });

  beforeEach(() => {
    // Set up test data
  });

  afterEach(() => {
    // Clean up test data
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Test implementation
    });

    it('should handle pagination', async () => {
      // Test implementation
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      // Test implementation
    });

    it('should validate required fields', async () => {
      // Test implementation
    });
  });
});
```

## Adding New Tests

When adding new features, follow these steps:

1. Create test file in appropriate directory
2. Define test data setup and cleanup
3. Write tests for all endpoints (GET, POST, PATCH, DELETE)
4. Test both success and error cases
5. Run tests and ensure all tests pass