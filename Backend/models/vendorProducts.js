import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Product from "./products.js";
import { BusinessInfo } from "./BusinessInfo.js";

const VendorProduct = sequelize.define("VendorProduct", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company_id: { // Changed from user_id
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BusinessInfo,
      key: "id",
    },
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: "id",
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  availability: {
    type: DataTypes.ENUM('In stock', 'Out of stock'),
    allowNull: false,
  },
  purchaseLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  warranty: {
    type: DataTypes.ENUM('3months', '6months', '1year', '2years'),
    allowNull: true,
  }
}, {
  tableName: "vendor_products",
  timestamps: false,
});

// Relationships
VendorProduct.belongsTo(Product, { foreignKey: "product_id", as: "product", onDelete: "CASCADE" });
VendorProduct.belongsTo(BusinessInfo, { foreignKey: "company_id", as: "company", onDelete: "CASCADE" });

Product.hasMany(VendorProduct, { foreignKey: "product_id", as: "vendorOffers", onDelete: "CASCADE" });
BusinessInfo.hasMany(VendorProduct, { foreignKey: "company_id", as: "companyOffers", onDelete: "CASCADE" });

export default VendorProduct;
