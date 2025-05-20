import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";  // Your sequelize instance
import User from "./user.js";
import Fragrance from "./fragrance.js";

const FragranceClick = sequelize.define("FragranceClick", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fragranceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Fragrance,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  },
}, {
  tableName: "fragranceclicks",
  timestamps: false,
});

// Associations

// User has many clicks
User.hasMany(FragranceClick, {
  foreignKey: "userId",
  as: "clicks",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Click belongs to User
FragranceClick.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Fragrance has many clicks
Fragrance.hasMany(FragranceClick, {
  foreignKey: "fragranceId",
  as: "clicks",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Click belongs to Fragrance
FragranceClick.belongsTo(Fragrance, {
  foreignKey: "fragranceId",
  as: "fragrance",
});

export default FragranceClick;
