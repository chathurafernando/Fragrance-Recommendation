import Fragrance from "../models/fragrance.js";
import Product from "../models/products.js";
import VendorProduct from "../models/vendorProducts.js";
import { sequelize } from '../db.js';
import { BusinessInfo } from "../models/businessInfo.js";

export const getFragranceWithVendors = async (req, res) => {
  try {
    const fragranceId = req.params.id;

    // Step 1: Get fragrance details + its products (without price aggregation)
    const fragrance = await Fragrance.findOne({
      where: { id: fragranceId },
      include: [
        {
          model: Product,
          as: 'products',
          include: [
            {
              model: VendorProduct,
              as: 'vendorOffers'
            }
          ]
        }
      ]
    });

    if (!fragrance) {
      return res.status(404).json({ message: 'Fragrance not found' });
    }

    // Step 2: Get min and max price separately
    const priceRange = await VendorProduct.findOne({
      include: [
        {
          model: Product,
          as: 'product',
          where: { fragrance_id: fragranceId },
          attributes: []
        }
      ],
      attributes: [
        [sequelize.fn('MIN', sequelize.col('price')), 'min_price'],
        [sequelize.fn('MAX', sequelize.col('price')), 'max_price']
      ],
      raw: true
    });

    // Step 3: Get companies offering this fragrance
    const vendorList = await VendorProduct.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          where: { fragrance_id: fragranceId },
          attributes: []
        },
        {
          model: BusinessInfo,
          as: 'company',
          attributes: ['id', 'companyName', 'image', 'websiteURL'] // Return company info
        }
      ],
      attributes: ['price', 'availability', 'purchaseLink', 'warranty']
    });

    return res.json({
      fragrance,
      min_price: priceRange.min_price,
      max_price: priceRange.max_price,
      vendors: vendorList
    });

  } catch (error) {
    console.error('Error fetching fragrance and vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
