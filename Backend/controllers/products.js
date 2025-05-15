// import Product from '../models/products.js';

// export const addBrandFragranceProduct = async (req, res) => {
//   try {
//     const { brandId, fragranceId, warranty, availability, purchaseLink } = req.body;

//     // Check for required fields
//     if (!brandId || !fragranceId || !warranty || !availability) {
//       return res.status(400).json({ error: 'BrandId, fragranceId, warranty, and availability are required.' });
//     }

//     // Validate warranty value
//     const validWarranties = ['3months', '6months', '1year', '2years'];
//     if (!validWarranties.includes(warranty)) {
//       return res.status(400).json({ error: 'Invalid warranty value. Choose from 3months, 6months, 1year, 2years.' });
//     }

//     // Validate availability value
//     const validAvailabilities = ['In stock', 'Out of stock'];
//     if (!validAvailabilities.includes(availability)) {
//       return res.status(400).json({ error: 'Invalid availability value. Choose from In stock or Out of stock.' });
//     }

//     // Create a new product with brand, fragrance, warranty, availability, and purchase link
//     const newProduct = await Product.create({
//       brand_id: brandId,
//       fragrance_id: fragranceId,
//       warranty,
//       availability,
//       purchaseLink,
//     });

//     res.json({ message: 'Brand-Fragrance product added successfully.', product: newProduct });
//   } catch (err) {
//     console.error('Error adding brand-fragrance product:', err);
//     res.status(500).json({ error: 'An error occurred while adding the product.' });
//   }
// };
