import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Sequelize connection using environment variables
export const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  'australia0610#', // Todo : need to have a new passwrord without #
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // or 'postgres', 'sqlite', 'mssql' depending on your DBMS
  }
);

// Synchronize models with the database
export async function syncModels() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Sync models (User and Post models are imported after this)
    console.log("Syncing models...");
    await sequelize.sync({ alter: true });

    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Database synchronization failed:', error);
  }
}
