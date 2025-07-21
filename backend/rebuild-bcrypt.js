/**
 * This script checks if bcrypt is working, and if not, attempts to rebuild it
 */
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('Checking bcrypt installation...');

try {
  // Attempt to load bcrypt
  require('bcrypt');
  console.log('bcrypt is working properly!');
} catch (error) {
  console.error('bcrypt loading error:', error.message);
  console.log('Attempting to rebuild bcrypt...');

  try {
    // Check if bcrypt is installed
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const hasBcrypt = packageJson.dependencies && packageJson.dependencies.bcrypt;
    
    if (hasBcrypt) {
      console.log('Found bcrypt in package.json. Reinstalling...');
      
      // Execute the rebuild command
      execSync('npm uninstall bcrypt && npm install bcrypt --build-from-source', {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      console.log('bcrypt has been rebuilt successfully!');
    } else {
      console.log('bcrypt not found in package.json. Skipping rebuild.');
    }
  } catch (rebuildError) {
    console.error('Failed to rebuild bcrypt:', rebuildError.message);
    process.exit(1);
  }
}

console.log('bcrypt check completed.'); 