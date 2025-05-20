import { Op, fn, col, literal } from 'sequelize';
import VendorProduct from '../models/vendorProducts.js';
import Fragrance from '../models/fragrance.js';
import Product from '../models/products.js';
import Brand from '../models/brand.js';

export const getFilteredFragrances = async (req, res) => {
  try {
    const { brandId, availability, sortBy, search } = req.query;

    // Build WHERE conditions dynamically
    let fragranceWhere = {};
    let vendorWhere = {};

    // Filter by Brand
    if (brandId) {
      fragranceWhere.bid = brandId;
    }

    // Search by fragrance name or description
    if (search) {
      fragranceWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by availability
    let vendorRequired = false;
    if (availability === 'In stock' || availability === 'Out of stock') {
      vendorWhere.availability = availability;
      vendorRequired = true;
    }

    // Sorting
    let fragranceOrder = [];
    if (sortBy === 'latest') {
      fragranceOrder.push(['createdAt', 'DESC']);
    } else if (sortBy === 'oldest') {
      fragranceOrder.push(['createdAt', 'ASC']);
    }

    const fragrances = await Fragrance.findAll({
      where: fragranceWhere,
      include: [
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name'],
        },
        {
          model: Product,
          as: 'products',
          required: vendorRequired,
          include: [
            {
              model: VendorProduct,
              as: 'vendorOffers',
              where: vendorWhere,
              required: vendorRequired,
            }
          ]
        }
      ],
      order: fragranceOrder
    });

    res.json(fragrances);

  } catch (err) {
    console.error('Error fetching filtered fragrances:', err);
    res.status(500).json({ error: 'An error occurred while fetching filtered fragrances.' });
  }
};