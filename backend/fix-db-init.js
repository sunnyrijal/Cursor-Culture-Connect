/**
 * This script fixes the database name in the Sequelize config
 * to ensure it uses culture_connect instead of culture-connect
 */

const fs = require('fs');
const path = require('path');

// Paths to check
const paths = [
  path.join(__dirname, 'src', 'config', 'config.js'),
  path.join(__dirname, 'src', 'config', 'config.json'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env.development')
];

console.log('Starting database configuration fix...');

// Function to fix a file if it exists
function fixFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Checking ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains "culture-connect"
    if (content.includes('culture-connect')) {
      console.log(`Found "culture-connect" in ${filePath}, fixing...`);
      
      // Replace all occurrences
      const newContent = content.replace(/culture-connect/g, 'culture_connect');
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      console.log(`Fixed ${filePath}`);
    } else {
      console.log(`No issues found in ${filePath}`);
    }
  }
}

// Check and fix each file
paths.forEach(fixFile);

// Special handling for Sequelize models/index.js
const modelsIndexPath = path.join(__dirname, 'src', 'models', 'index.js');
if (fs.existsSync(modelsIndexPath)) {
  console.log(`Checking Sequelize models/index.js...`);
  let content = fs.readFileSync(modelsIndexPath, 'utf8');
  
  // Add code to force the database name if needed
  if (!content.includes('force database name')) {
    const sequelizeInitPattern = /sequelize = new Sequelize\(([^)]+)\)/g;
    
    // This will add database name override code
    const replacement = `
    // Force database name to use underscore
    if (config.database === 'culture-connect') {
      config.database = 'culture_connect';
      console.log('Forced database name to culture_connect');
    }
    
    sequelize = new Sequelize($1)`;
    
    const newContent = content.replace(sequelizeInitPattern, replacement);
    fs.writeFileSync(modelsIndexPath, newContent, 'utf8');
    
    console.log('Added database name override to models/index.js');
  }
}

console.log('Database configuration fix completed.'); 