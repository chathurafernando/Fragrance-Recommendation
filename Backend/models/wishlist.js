import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';
import User from "./user.js";
import Fragrance from "./fragrance.js";

const Wishlist = sequelize.define("Wishlist", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fragrance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'createdAt',
  },
}, 
{
  tableName: 'wishlist',
  timestamps: false,
});

// Define the "belongsTo" relationships
Wishlist.belongsTo(User, {
  foreignKey: 'user_id', 
  as: 'user',
});

Wishlist.belongsTo(Fragrance, {
  foreignKey: 'fragrance_id', 
  as: 'fragrance',
});

export default Wishlist;
