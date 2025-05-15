import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import User from './user.js';

export const VendorPayment = sequelize.define('VendorPayment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user', // Vendor records are in 'user' table
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  payhereRef: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'vendor_payments',
  timestamps: false, // includes createdAt & updatedAt
});

// Define relationship (Vendor is a User)
VendorPayment.belongsTo(User, { foreignKey: 'vendorId' });
User.hasMany(VendorPayment, { foreignKey: 'vendorId' });
