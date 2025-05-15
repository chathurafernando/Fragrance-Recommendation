// // models/FragranceNote.js
// import { DataTypes } from "sequelize";
// import { sequelize } from '../db.js';
// import Fragrance from "../models/fragrance.js"; // Import the Fragrance model
// import { Notes } from "../models/notes.js";

// // Define the many-to-many relationship through FragranceNotes table
// const FragranceNote = sequelize.define("FragranceNote", {
//     // fragranceId: {  
//     //   type: DataTypes.INTEGER,
//     //   references: {
//     //     model: Fragrance,
//     //     key: "id",
//     //   },
//     //   allowNull: false,
//     //   field: "fragranceId"  // Ensure Sequelize uses correct column name
//     // },
//     // noteId: {  
//     //   type: DataTypes.INTEGER,
//     //   references: {
//     //     model: Notes,
//     //     key: "id",
//     //   },
//     //   allowNull: false,
//     //   field: "noteId"  // Ensure Sequelize uses correct column name
//     // },
//     noteType: {
//       type: DataTypes.ENUM('Top', 'Middle', 'Base'),
//       allowNull: false,
//     },
//   }, {
//     tableName: 'fragrancenotes',
//     timestamps: false,
//   });
  
// // Define relationships
// Fragrance.belongsToMany(Notes, { through: FragranceNote });
// Notes.belongsToMany(Fragrance, { through: FragranceNote });

// // Export the FragranceNote model
// export default FragranceNote;


import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';
import Fragrance from "./fragrance.js";
import Notes from "./notes.js";

const FragranceNote = sequelize.define("FragranceNote", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fragranceId: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Fragrance,
      key: "id",
    },
    field: "fragranceId",
  },
  noteId: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Notes,
      key: "id",
    },
    field: "noteId",
  },
  noteType: {
    type: DataTypes.ENUM('Top', 'Middle', 'Base'),
    allowNull: false,
  },
}, {
  tableName: 'fragrancenotes',
  timestamps: false,
});

// Define relationships
Fragrance.belongsToMany(Notes, {
  through: FragranceNote,
  as: 'fragranceNotes',
  foreignKey: 'fragranceId'
});
Notes.belongsToMany(Fragrance, {
  through: FragranceNote,
  as: 'notesFragrance',
  foreignKey: 'noteId'
});

export default FragranceNote;
