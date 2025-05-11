// Simple script to run the seed data

require('dotenv').config();
const { seedDatabase } = require('./src/seedData');

console.log('Starting to seed database...');

seedDatabase()
  .then(() => {
    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });