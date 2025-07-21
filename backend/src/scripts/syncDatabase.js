require('dotenv').config();
const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    // This will drop all tables and recreate them
    console.log('Synchronizing database...');
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully!');
    
    console.log('\nWarning: All existing data has been deleted.');
    console.log('You can now run the seed scripts:');
    console.log('npm run seed:activities');
    console.log('npm run seed:mock');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    process.exit();
  }
}

syncDatabase();

