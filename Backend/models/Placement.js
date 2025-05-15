// models/Placement.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Placement = sequelize.define('Placement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'placements', // matches the SQL table
  timestamps: false, // no createdAt/updatedAt
});
