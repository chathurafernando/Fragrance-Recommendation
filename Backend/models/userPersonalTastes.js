import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';  // Sequelize instance
import User from './user.js';  // Import the User model

// Define the UserPersonalTaste model
export const UserPersonalTaste = sequelize.define('UserPersonalTaste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  looking_for: {
    type: DataTypes.ENUM('Her', 'Him', 'Both'),
    allowNull: false,
  },
  age_range: {
    type: DataTypes.ENUM('below 18', 'in 20s', 'in 30s', 'in 40s', 'in 50s', 'above 50'),
    allowNull: false,
  },
  occasion: {
    type: DataTypes.ENUM('Office', 'Club', 'Casual'),
    allowNull: false,
  },
  smell: {
    type: DataTypes.ENUM('Fruity', 'Fresh', 'Mint'),
    allowNull: false,
  },
  intensity: {
    type: DataTypes.ENUM('EDP', 'EDT', 'Parfum'),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',  // Reference to the users table
      key: 'id',  // Primary key column in the User model
    },
    onDelete: 'CASCADE',  // When a user is deleted, their preferences are also deleted
  }
}, {
  tableName: 'user_personal_taste',
  timestamps: false,
});

// Establish the relationship: UserPersonalTaste belongs to User
UserPersonalTaste.belongsTo(User, { foreignKey: 'user_id' });

export default UserPersonalTaste;
