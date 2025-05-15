import { uploadFile } from "../utils/firebase.js"; 
import { Notes } from "../models/notes.js";

 
export const addNote = async (req, res) => {
    try {
      const { name, description } = req.body;
      
      console.log("Received File:", req.file);
      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded!' });
      }
  
      // Upload the image to Firebase and get the public URL
      const uploadedImageUrl = await uploadFile(req.file);

      console.log("Url",uploadedImageUrl)

  
      // Save note details to database
      const newNote = await Notes.create({
        name,
        description,
        image: uploadedImageUrl, // Store Firebase image URL
      });
  
      res.json({ message: "Note has been added successfully.", note: newNote });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the note.' });
    }
  };

  export const getNotes = async (req, res) => {
    try {
        const notes = await Notes.findAll();
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while retrieving notes." });
    }
};
  
  // Update a note
  export const updateNote = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const { file } = req;
  
      // Check if note exists
      const note = await Notes.findByPk(id);
      if (!note) {
        return res.status(404).json("Note not found.");
      }
  
      // Upload new image if available
      let uploadedImageUrl = note.image; // Keep old image URL if no new image is uploaded
      if (req.file) {
        uploadedImageUrl = await uploadFile(req.file);
      }
  
      // Update note in the database
      await note.update({
        name,
        description,
        image: uploadedImageUrl, // Update with new image URL if any
      });
  
      res.json({ message: "Note has been updated successfully.", note });
    } catch (err) {
      console.error(err);
      res.status(500).json("An error occurred while updating the note.");
    }
  };
  
  // Delete a note
  export const deleteNote = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete note
      const note = await Notes.findByPk(id);
      if (!note) {
        return res.status(404).json("Note not found.");
      }
  
      await note.destroy();
      res.json({ message: "Note has been deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json("An error occurred while deleting the note.");
    }
  };
  