import Fragrance from "../models/fragrance.js";
import Wishlist from "../models/wishlist.js";


// Add to wishlist
export const addToWishlist = async (req, res) => {
  const { user_id, fragrance_id } = req.body;

  try {
    // Prevent duplicates
    const existing = await Wishlist.findOne({ where: { user_id, fragrance_id } });
    if (existing) {
      return res.status(400).json({ message: 'Already in wishlist' });
    }

    await Wishlist.create({ user_id, fragrance_id });
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  const { user_id, fragrance_id } = req.body;

  try {
    await Wishlist.destroy({ where: { user_id, fragrance_id } });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's wishlist
export const getUserWishlist = async (req, res) => {
  const user_id = req.params.id;

  try {
    const wishlist = await Wishlist.findAll({
      where: { user_id },
      include: [{ model: Fragrance, as: 'fragrance' }]
    });

    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
