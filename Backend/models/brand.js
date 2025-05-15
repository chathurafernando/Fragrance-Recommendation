import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

// Define Brand model
export const Brand = sequelize.define("Brand", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "brands",
  timestamps: false,
});

export default Brand;