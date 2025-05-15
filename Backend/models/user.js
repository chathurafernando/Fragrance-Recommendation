// models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import { Post } from './Post.js';
import { Advertisement } from './Advertisement.js';
import { BusinessInfo } from './BusinessInfo.js';

export const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'vendor', 'admin'),
    allowNull: false,
    defaultValue: 'user',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  onboardingstep: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'user',
  timestamps: false,
});

// Relationship with Post
User.hasMany(Post, { foreignKey: 'uid' });
Post.belongsTo(User, { foreignKey: 'uid' });

// Association with Notes through UserFavoriteNote
User.associate = (models) => {
  User.belongsToMany(models.Notes, {
    through: models.UserFavoriteNote,
    foreignKey: 'user_id',
    otherKey: 'note_id',
    as: 'favoriteNotes'
  });
};

User.associate = (models) => {
  User.hasMany(models.wishlist, { foreignKey: 'user_id', as: 'wishlists' });
};

// Define relationship with Advertisement
// User.hasMany(Advertisement, { foreignKey: 'userId' });

// Advertisement.belongsTo(User, { foreignKey: 'userId' });
// User.hasMany(Advertisement, { foreignKey: 'userId' });
BusinessInfo.belongsTo(User, { foreignKey: 'uid' });
User.hasOne(BusinessInfo, { foreignKey: 'uid' });
export default User;
