// models/Notes.js
import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

export const Notes = sequelize.define('Notes', {
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
  tableName: 'notes',
  timestamps: false,
});

// Association with User through UserFavoriteNote
Notes.associate = (models) => {
  Notes.belongsToMany(models.User, {
    through: models.UserFavoriteNote,
    foreignKey: 'note_id',
    otherKey: 'user_id',
    as: 'favoritedByUsers'
  });
};

export default Notes;
