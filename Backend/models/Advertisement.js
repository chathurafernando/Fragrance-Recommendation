import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';
import { BusinessInfo } from "./BusinessInfo.js"; // import BusinessInfo model

export const Advertisement = sequelize.define('Advertisement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  description: {
    type: DataTypes.STRING,
  },
  placement: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  bannerUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_id: { // 🔄 updated foreign key column
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'business_info', // SQL table name
      key: 'id'
    }
  }
}, {
  tableName: 'offers', // matches your SQL table
  timestamps: false,
});

// Set up the association
Advertisement.belongsTo(BusinessInfo, { foreignKey: 'company_id' });
BusinessInfo.hasMany(Advertisement, { foreignKey: 'company_id' });
