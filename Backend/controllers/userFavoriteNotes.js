// controllers/userFavoriteNotesController.js
import { UserFavoriteNote } from '../models/userFavoriteNote.js';
import { User } from '../models/user.js';
import { Notes } from '../models/notes.js';

// Add favorite notes for a user
export const addUserFavoriteNotes = async (req, res) => {
  try {
    const { userId, noteIds } = req.body; // Expecting userId and an array of noteIds from the client

    if (!userId || !noteIds || noteIds.length === 0) {
      return res.status(400).json({ message: 'User ID and note IDs are required' });
    }

    // Validate if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare the data to be inserted into the `user_favorite_notes` table
    const favoriteNotes = noteIds.map((noteId) => ({
      user_id: userId,  // Use 'user_id' instead of 'userId'
      note_id: noteId,   // Use 'note_id' instead of 'noteId'
    }));

    // Bulk create the favorite notes for the user
    await UserFavoriteNote.bulkCreate(favoriteNotes);

    const [updated] = await User.update(
      { onboardingstep: 2 }, // Fields to update
      { where: { id: userId } }    // Condition to find the user
    );



    return res.status(200).json({
      message: 'Favorite notes added successfully', onboardingstep: 2,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error adding favorite notes', error });
  }
};


// Get all favorite notes for a user
export const getUserFavoriteNotes = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user along with their favorite notes
    const user = await User.findByPk(userId, {
      include: [{
        model: Notes,
        as: 'favoriteNotes',
        attributes: ['id', 'name', 'description', 'image']
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user.favoriteNotes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching favorite notes', error });
  }
};
