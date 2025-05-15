// models/UserFavoriteNote.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const UserFavoriteNote = sequelize.define('UserFavoriteNote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'user_favorite_notes',
  timestamps: false,
});

// Define associations
UserFavoriteNote.associate = (models) => {
  // Association with User
  UserFavoriteNote.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Association with Notes
  UserFavoriteNote.belongsTo(models.Notes, {
    foreignKey: 'note_id',
    as: 'note',
  });
};

export default UserFavoriteNote;
