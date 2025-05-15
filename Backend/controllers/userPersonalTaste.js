import User from "../models/user.js";
import UserPersonalTaste from "../models/userPersonalTastes.js";

// Function to save user preferences
export const saveUserPreferences = async (req, res) => {
  const { userId, lookingFor, ageRange, occasion, smell, intensity } = req.body;

  // Validate user input
  if (!userId || !lookingFor || !ageRange || !occasion || !smell || !intensity) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if preferences already exist
    const existingPreference = await UserPersonalTaste.findOne({
      where: { user_id: userId },
    });

    if (existingPreference) {
      // Update the existing preferences
      await existingPreference.update({
        looking_for: lookingFor,
        age_range: ageRange,
        occasion: occasion,
        smell: smell,
        intensity: intensity,
      });
    } else {
      // Create new preferences
      await UserPersonalTaste.create({
        user_id: userId,
        looking_for: lookingFor,
        age_range: ageRange,
        occasion: occasion,
        smell: smell,
        intensity: intensity,
      });
    }

    // Update user's onboarding step
    await User.update(
      { onboardingstep: 3 },
      { where: { id: userId } }
    );

    res.status(200).json({ message: 'Personal preferences saved successfully', onboardingstep: 3 });

  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Function to fetch user preferences
export const getUserPreferences = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user preferences
    const personalTaste = await UserPersonalTaste.findOne({
      where: { user_id: userId },
    });

    if (!personalTaste) {
      return res.status(404).json({ error: 'No preferences found for this user' });
    }

    res.status(200).json(personalTaste);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

