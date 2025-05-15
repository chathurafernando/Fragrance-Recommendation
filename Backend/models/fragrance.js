import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';
import Brand from "./brand.js";

// Define the Fragrance model
const Fragrance = sequelize.define("Fragrance", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  looking_for: {
    type: DataTypes.ENUM('Her', 'Him', 'Both'),
    allowNull: true,
  },
  age_range: {
    type: DataTypes.ENUM('below 18', 'in 20s', 'in 30s', 'in 40s', 'in 50s', 'above 50'),
    allowNull: true,
  },
  occasion: {
    type: DataTypes.ENUM('Office', 'Club', 'Casual'),
    allowNull: true,
  },
  smell: {
    type: DataTypes.ENUM('Fruity', 'Fresh', 'Mint'),
    allowNull: true,
  },
  intensity: {
    type: DataTypes.ENUM('EDP', 'EDT', 'Parfum'),
    allowNull: true,
  },
  bid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Brand,
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'createdAt',
  },
}, 

{
  tableName: 'fragrance',
  timestamps: false,
});

// Define the "belongsTo" relationship (a fragrance belongs to one brand)
Fragrance.belongsTo(Brand, {
  foreignKey: 'bid', 
  as: 'brand'
});

Fragrance.associate = (models) => {
  Fragrance.hasMany(models.wishlist, { foreignKey: 'fragrance_id', as: 'wishlists' });
};

export default Fragrance;
