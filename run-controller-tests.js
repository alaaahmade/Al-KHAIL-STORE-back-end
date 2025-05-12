// Script to run all controller tests sequentially
// This avoids database connection conflicts that occur when running tests in parallel

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define the controllers directory
const controllersDir = path.join(__dirname, 'tests', 'controllers');

// Get all controller test files
const testFiles = fs.readdirSync(controllersDir)
  .filter(file => file.endsWith('.test.js'))
  .map(file => path.join(controllersDir, file));

console.log('Found the following controller test files:');
testFiles.forEach(file => console.log(` - ${path.basename(file)}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection:', reason);
  // Continue with next tests
});

// Run tests sequentially
async function runTests() {
  for (const testFile of testFiles) {
    console.log(`\n\n=========================================`);
    console.log(`Running tests for: ${path.basename(testFile)}`);
    console.log(`=========================================\n`);
    
    try {
      // Run the test with --forceExit to ensure it closes properly
      await new Promise((resolve, reject) => {
        const child = exec(`npx jest ${testFile} --forceExit`, 
          { timeout: 60000 }, 
          (error, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            
            // Always resolve, even on error, to continue to next test
            resolve();
          }
        );
        
        // Pipe the command output to the current process
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
      });
      
      // Short pause between tests to ensure connections are properly closed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error running ${path.basename(testFile)}: ${error.message}`);
    }
  }
  
  console.log('\n\nAll controller tests completed.');
}

// Run the tests
runTests()
  .then(() => {
    console.log('Test script finished execution.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script error:', error.message);
    process.exit(1);
  });