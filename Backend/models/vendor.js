// import { DataTypes } from "sequelize";
// import { sequelize } from "../db.js";

// export const Vendor = sequelize.define(
//   "Vendor",
//   {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     image: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     verification: {
//       type: DataTypes.ENUM("verified", "pending"), // Restrict to these values
//       allowNull: false,
//       defaultValue: "pending", // Default status is pending
//     },
//   },
//   {
//     tableName: "vendors",
//     timestamps: false, // No createdAt or updatedAt fields
//   }
// );

// export default Vendor;
