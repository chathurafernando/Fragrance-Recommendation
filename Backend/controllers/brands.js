import { uploadFile } from "../utils/firebase.js"; 
import Fragrance from "../models/fragrance.js";
import Brand from "../models/brand.js";

export const addBrand = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    console.log("Received File:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded!" });
    }

    const uploadedImageUrl = await uploadFile(req.file);
    console.log("Uploaded Image URL:", uploadedImageUrl);

    // Save brand details to database using Sequelize
    const newBrand = await Brand.create({
      name,
      description,
      image: uploadedImageUrl, // Store Firebase image URL
    });

    res.json({ message: "Brand has been added successfully.", brand: newBrand });
  } catch (err) {
    console.error("Error adding brand:", err);
    res.status(500).json({ error: "An error occurred while adding the brand." });
  }
};

export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        // Check if the brand exists
        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ error: "Brand not found." });
        }

        // Upload new image if available
        let uploadedImageUrl = brand.image; // Keep old image URL if no new image is uploaded
        if (req.file) {
            uploadedImageUrl = await uploadFile(req.file);
        }

        // Update brand in the database
        await brand.update({
            name,
            description,
            image: uploadedImageUrl, // Update with new image URL if any
        });

        res.json({ message: "Brand has been updated successfully.", brand });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while updating the brand." });
    }
};

export const getBrands = async (req, res) => {
  try {
      const brands = await Brand.findAll(); // Fetch all brands from the database
      res.json(brands);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred while retrieving brands." });
  }
};

export const getBrandsByFragrance = async (req, res) => {
  try {
    const brands = await Brand.findAll();

    // Step 2: For each brand, get its associated fragrances
    const brandsWithFragrances = await Promise.all(
      brands.map(async (brand) => {
        const fragrances = await Fragrance.findAll({
          where: { bid: brand.id },
        });

        return {
          ...brand.toJSON(),
          fragrances,
        };
      })
    );

    res.json({ brands: brandsWithFragrances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while retrieving brands." });
  }
};

export const deleteBrand = async (req, res) => {
  try {
      const { id } = req.params;

      // Find the brand by ID
      const brand = await Brand.findByPk(id);
      if (!brand) {
          return res.status(404).json("Brand not found.");
      }

      // Delete the brand
      await brand.destroy();
      res.json({ message: "Brand has been deleted successfully." });
  } catch (err) {
      console.error(err);
      res.status(500).json("An error occurred while deleting the brand.");
  }
};
