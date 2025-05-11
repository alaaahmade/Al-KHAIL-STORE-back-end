// Simple test to verify database connection

const { AppDataSource } = require('./src/config/database');

async function testDatabaseConnection() {
  try {
    console.log('Attempting to connect to database...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    console.log('Database connected successfully!');
    
    // Try a simple query
    const result = await AppDataSource.query('SELECT NOW()');
    console.log('Current database time:', result[0].now);
    
    // Close the connection
    await AppDataSource.destroy();
    console.log('Database connection closed');
    
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    console.log('Test completed, success:', success);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });