import { Op, fn, col, literal } from "sequelize";
import Fragrance from "../models/fragrance.js";
import VendorProduct from "../models/vendorProducts.js";
import Product from "../models/products.js";
import { sequelize } from '../db.js';
import Notes from "../models/notes.js";


export const searchFragrances = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    const excludeIds = req.query.exclude ? req.query.exclude.split(',').map(id => Number(id)) : [];

    const fragrances = await Fragrance.findAll({
      where: {
        name: {
          [Op.like]: `%${searchQuery}%`
        },
        id: {
          [Op.notIn]: excludeIds
        }
      },
      limit: 10 // Optional: limit search results
    });

    res.json(fragrances);
  } catch (err) {
    console.error('Error searching fragrances:', err);
    res.status(500).json({ error: 'An error occurred while searching fragrances.' });
  }
};



export const getCompareFragrances = async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',').map(id => Number(id)) : [];

    if (ids.length === 0 || ids.length > 3) {
      return res.status(400).json({ error: 'You must provide 1 to 3 fragrance IDs.' });
    }

    // Fetch fragrance details + products + notes with noteType
    const fragrances = await Fragrance.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'name', 'description', 'image'],
      include: [
        {
          model: Product,
          as: 'products',
          include: [{ model: VendorProduct, as: 'vendorOffers' }]
        },
        {
          model: Notes,
          as: 'fragranceNotes',
          through: { attributes: ['noteType'] }
        }
      ]
    });

    // Fetch price ranges per fragrance
    const priceRanges = await VendorProduct.findAll({
      include: [{
        model: Product,
        as: 'product',
        where: { fragrance_id: { [Op.in]: ids } },
        attributes: ['fragrance_id']
      }],
      attributes: [
        [col('product.fragrance_id'), 'fragrance_id'],
        [fn('MIN', col('price')), 'min_price'],
        [fn('MAX', col('price')), 'max_price']
      ],
      group: ['product.fragrance_id'],
      raw: true
    });

    // Map fragrances adding min_price, max_price, and grouped notes inline
    const fragrancesWithPricesAndNotes = fragrances.map(frag => {
      const noteGroups = {};

      frag.fragranceNotes.forEach(note => {
        // Adjust join table alias if needed:
        const noteType = note.fragranceNotes_Notes?.noteType || 'Other';
        if (!noteGroups[noteType]) noteGroups[noteType] = [];
        noteGroups[noteType].push({ id: note.id, name: note.name });
      });

      const price = priceRanges.find(p => p.fragrance_id === frag.id);

      return {
        ...frag.toJSON(),
        min_price: price ? price.min_price : null,
        max_price: price ? price.max_price : null,
        noteGroups
      };
    });

    res.json(fragrancesWithPricesAndNotes);
  } catch (err) {
    console.error('Error fetching fragrances for comparison:', err);
    res.status(500).json({ error: 'An error occurred while fetching comparison fragrances.' });
  }
};


