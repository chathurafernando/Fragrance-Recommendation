import Fragrance from "../models/fragrance.js"; // Import the Fragrance model
import { uploadFile } from "../utils/firebase.js"; // Assuming you have a utility function to upload to Firebase
import FragranceNote from "../models/fragranceNote.js";
import Notes from "../models/notes.js";
import Brand from "../models/brand.js";
import Product from "../models/products.js";


export const addFragrance = async (req, res) => {
  try {
    const {
      bid,
      name,
      description,
      notes,
      looking_for,
      age_range,
      occasion,
      smell,
      intensity
    } = req.body;

    console.log("Notes:", {bid,
      name,
      description,
      notes,
      looking_for,
      age_range,
      occasion,
      smell,
      intensity});

    // Validate brand
    const existingBrand = await Brand.findByPk(bid);
    if (!existingBrand) {
      return res.status(404).json({ error: `Brand with ID ${bid} not found.` });
    }
    console.log("Selected Brand Name:", existingBrand.name);

    // Check for duplicate fragrance under the brand
    const duplicateFragrance = await Fragrance.findOne({
      where: { name, bid },
    });

    if (duplicateFragrance) {
      return res.status(409).json({
        error: `A fragrance named "${name}" already exists for the selected brand.`,
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded!' });
    }

    // Upload image and get URL
    const uploadedImageUrl = await uploadFile(req.file);

    // Create fragrance with new fields
    const newFragrance = await Fragrance.create({
      name,
      description,
      image: uploadedImageUrl,
      bid,
      looking_for,
      age_range,
      occasion,
      smell,
      intensity,
    });

    // Add notes (if any)
    // if (notes && notes.length > 0) {
    //   for (const note of notes) {
    //     const { NoteId, noteType } = note;
    //     await FragranceNote.create({
    //       fragranceId: newFragrance.id,
    //       noteId: NoteId,
    //       noteType,
    //     });
    //   }
    // }

    if (notes && notes.length > 0) {
      const fragranceNotes = notes.map(({ NoteId, noteType }) => ({
        fragranceId: newFragrance.id,
        noteId: NoteId,
        noteType,
      }));

  await FragranceNote.bulkCreate(fragranceNotes);
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({
      where: { brand_id: bid, fragrance_id: newFragrance.id },
    });

    if (existingProduct) {
      return res.status(409).json({
        error: 'This fragrance is already registered under this brand. Choose a different combination.',
      });
    }

    // Create product record
    const newProduct = await Product.create({
      brand_id: bid,
      fragrance_id: newFragrance.id,
    });

    res.json({
      message: "Fragrance and its notes have been added successfully, and product entry created.",
      fragrance: newFragrance,
      product: newProduct,
    });

  } catch (err) {
    console.error("Error adding fragrance:", err);
    res.status(500).json({ error: 'An error occurred while adding the fragrance.' });
  }
};


export const getFragrance = async (req, res) => {
  try {
    const fragrances = await Fragrance.findAll({
      include: [
        {
          model: Notes,
          as: 'fragranceNotes',
          attributes: ['id'],
          through: {
            attributes: ['noteType'],
          },
        },
        {
          model: Brand,
          attributes: ['id', 'name'],
          as: 'brand',
        }
      ],
    });

    if (!fragrances || fragrances.length === 0) {
      return res.status(404).json({ error: "No fragrances found!" });
    }

    const groupedNotes = fragrances.map(fragrance => {
      const noteGroups = {
        Top: [],
        Middle: [],
        Base: [],
      };

      // Check how the note data is structured
      console.log(JSON.stringify(fragrance.fragranceNotes, null, 2));

      fragrance.fragranceNotes.forEach(note => {
        // Access noteType correctly from the join table
        const noteType = note.FragranceNote.noteType;
        // Directly access the join table data
        const noteId = note.id;

        if (noteType && noteGroups[noteType]) {
          noteGroups[noteType].push(noteId); // No duplicate check needed
        }
      });

      return {
        id: fragrance.id,
        name: fragrance.name,
        brand: {
          id: fragrance.brand?.id || null,
          name: fragrance.brand?.name || null,
        },
        description: fragrance.description,
        image: fragrance.image,
        looking_for: fragrance.looking_for,
        age_range: fragrance.age_range,
        occasion: fragrance.occasion,
        smell: fragrance.smell,
        intensity: fragrance.intensity,
        noteGroups: noteGroups,
      };
    });

    res.json({ fragrances: groupedNotes });
  } catch (err) {
    console.error("Error fetching all fragrances:", err);
    res.status(500).json({ error: "An error occurred while fetching all fragrances." });
  }
};
export const updateFragrance = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, name, description, notes } = req.body;

    // 1. Find the fragrance
    const fragrance = await Fragrance.findByPk(id);
    if (!fragrance) {
      return res.status(404).json({ error: "Fragrance not found!" });
    }

    // 2. Update basic info (brand, name, description, image)
    let uploadedImageUrl = fragrance.image;
    if (req.file) {
      uploadedImageUrl = await uploadFile(req.file);
    }
    await fragrance.update({ brand, name, description, image: uploadedImageUrl });

    // 3. DELETE ALL existing notes (no conditions, just wipe them)
    await FragranceNote.destroy({
      where: { fragranceId: id }
    });

    // 4. INSERT ALL new notes (exactly as received, no checks)
    if (notes && notes.length > 0) {
      const fragranceNotes = notes.map(({ NoteId, noteType }) => ({
        fragranceId: id,
        noteId: NoteId,
        noteType
      }));
      await FragranceNote.bulkCreate(fragranceNotes); // Saves ALL, even duplicates
    }

    res.status(200).json(fragrance);
  } catch (error) {
    console.error("Error updating fragrance:", error);
    res.status(500).json({ error: "Failed to update fragrance" });
  }
};

// export const updateFragrance = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { brand, name, description, notes } = req.body;

//     const fragrance = await Fragrance.findByPk(id);
//     if (!fragrance) {
//       return res.status(404).json({ error: "Fragrance not found!" });
//     }

//     let uploadedImageUrl = fragrance.image;
//     if (req.file) {
//       uploadedImageUrl = await uploadFile(req.file);
//     }

//     await fragrance.update({ brand, name, description, image: uploadedImageUrl });

//     const existingNotes = await FragranceNote.findAll({ where: { fragranceId: id } });

//     const incomingNoteTypes = new Set(); // to track uniqueness per noteType

//     for (const note of notes) {
//       const { NoteId, noteType } = note;

//       // 🔒 Enforce unique noteType per fragrance
//       // if (incomingNoteTypes.has(noteType)) {
//       //   return res.status(400).json({
//       //     error: `Duplicate noteType '${noteType}' found. Each noteType must be unique for this fragrance.`,
//       //   });
//       // }
//       // incomingNoteTypes.add(noteType);

//       // Check if a note with the same noteType already exists (for the same fragrance)
//       const noteWithSameType = existingNotes.find(n => n.noteType === noteType);

//       if (noteWithSameType) {
//         // If noteId is different, update it
//         if (noteWithSameType.noteId !== NoteId) {
//           await noteWithSameType.update({ noteId: NoteId });
//         }
//         // If noteType exists with same noteId, do nothing
//       } else {
//         // Create new note entry
//         await FragranceNote.create({
//           fragranceId: id,
//           noteId: NoteId,
//           noteType,
//         });
//       }
//     }

//     // Optional: Remove old notes not in incoming notes
//     const incomingNoteTypesArray = Array.from(incomingNoteTypes);
//     const toDelete = existingNotes.filter(
//       n => !incomingNoteTypesArray.includes(n.noteType)
//     );

//     for (const note of toDelete) {
//       await note.destroy();
//     }

//     const updatedNotes = await FragranceNote.findAll({ where: { fragranceId: id } });

//     res.json({
//       message: "Fragrance updated successfully.",
//       fragrance,
//       notes: updatedNotes,
//     });
//   } catch (err) {
//     console.error("Error updating fragrance:", err);
//     res.status(500).json({ error: "An error occurred while updating the fragrance." });
//   }
// };




export const deleteFragrance = async (req, res) => {
  try {
    const { id } = req.params; // Get fragrance ID

    // Find the fragrance
    const fragrance = await Fragrance.findByPk(id);
    if (!fragrance) {
      return res.status(404).json({ error: "Fragrance not found!" });
    }

    // Now, delete the fragrance (cascade will delete related notes)
    await fragrance.destroy();

    res.json({
      message: "Fragrance deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting fragrance:", err);
    res.status(500).json({ error: "An error occurred while deleting the fragrance." });
  }
};
