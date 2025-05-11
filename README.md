# E-Commerce Backend Service

This is a RESTful API service for an e-commerce platform built with Node.js, Express, and TypeORM.

## Features

- User Management
- Product Catalog
- Order Management
- Shopping Cart
- Reviews and Ratings
- Seller Management
- Store Management
- Manager Dashboard
- Invoice Generation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file
4. Run database migrations
   ```bash
   npm run migration:run
   ```
5. Start the server
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Testing

This project uses Jest and Supertest for API testing.

To run tests:
```bash
npm test
```

### Test Approach

The tests are organized as follows:

1. **Unit Tests:** Testing individual components like services and controllers
2. **Integration Tests:** Testing the interaction between components
3. **API Tests:** Testing the API endpoints
4. **End-to-End Tests:** Complete workflow tests

For simplified examples of testing, see:
- `tests/simplified/user.test.js`: Basic entity test
- `tests/simplified/userApi.test.js`: Basic API test

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the ISC License.