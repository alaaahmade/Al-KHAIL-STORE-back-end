// This script is run once after all test suites have completed
// It ensures that the database connection is properly closed

const { AppDataSource } = require('../src/config/database');

module.exports = async () => {
  try {
    // Ensure the database connection is closed
    if (AppDataSource && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed in global teardown');
    } else if (AppDataSource) {
      console.log('Database connection was not initialized, no need to close');
    }
  } catch (error) {
    console.error('Error during database connection cleanup:', error.message);
  } finally {
    // Short delay to ensure connection is fully closed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Force exit process to avoid hanging issues
    console.log('Tests completed, forcing exit');
    process.exit(0);
  }
};