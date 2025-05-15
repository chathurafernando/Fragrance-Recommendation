import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Fragrance from "./fragrance.js";
import Brand from "./brand.js";

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fragrance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Fragrance,
      key: "id",
    },
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Brand,
      key: "id",
    },
  },
}, {
  tableName: "products",
  timestamps: false,
});

// Relationships
Product.belongsTo(Fragrance, { foreignKey: "fragrance_id", as: "fragrance", onDelete: "CASCADE" });
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "brand", onDelete: "CASCADE" });

Fragrance.hasMany(Product, { foreignKey: "fragrance_id", as: "products", onDelete: "CASCADE" });
Brand.hasMany(Product, { foreignKey: "brand_id", as: "products", onDelete: "CASCADE" });

export default Product;
