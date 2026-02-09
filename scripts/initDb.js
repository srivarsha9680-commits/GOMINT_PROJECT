require('dotenv').config();
const sequelize = require('../config/database');
const User = require('../models/userPostgres');

async function initializeDatabase() {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('✓ Database connection successful');

        console.log('Syncing models with database...');
        await sequelize.sync({ alter: false });
        console.log('✓ Database synchronized');

        console.log('✓ Database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('✗ Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();
