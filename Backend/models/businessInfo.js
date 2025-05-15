import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import { User } from './user.js';
import { Advertisement } from './Advertisement.js';

export const BusinessInfo = sequelize.define('BusinessInfo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneOffice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  websiteURL: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verification: {
    type: DataTypes.ENUM('pending', 'verified'),
    allowNull: false,
    defaultValue: 'pending',
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user', // Make sure this matches the actual table name in your DB
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'business_info',
  timestamps: false,
});

// Define relationship


// Advertisement.belongsTo(BusinessInfo, { foreignKey: 'company_id' });
// BusinessInfo.hasMany(Advertisement, { foreignKey: 'company_id' });