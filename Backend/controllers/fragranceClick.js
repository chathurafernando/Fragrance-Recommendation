// import { FragranceClick, Fragrance, User, sequelize } from '../models/index.js';

import { Op } from "sequelize";
import { sequelize } from "../db.js";
import Fragrance from "../models/fragrance.js";
import FragranceClick from "../models/FragranceClick.js";
import User from "../models/user.js";



  // Record a click on a fragrance
  export const recordClick = async (req, res) => {
    const { fragranceId, userId } = req.body;

    if (!fragranceId) {
      return res.status(400).json({ error: 'fragranceId is required' });
    }

    try {
      // Validate fragrance exists
      const fragrance = await Fragrance.findByPk(fragranceId);
      if (!fragrance) {
        return res.status(404).json({ error: 'Fragrance not found' });
      }

      // Validate user if userId provided
      if (userId) {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
      }

      // Create click record
      const click = await FragranceClick.create({
        fragranceId,
        userId: userId || null
      });

      res.json({ success: true, click });

    } catch (error) {
      console.error('Error recording click:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get total and unique clicks count for a fragrance



export const getClickStats = async (req, res) => {
  try {
    // Get all fragrances
    const fragrances = await Fragrance.findAll();

    // Get click statistics for all fragrances
    const clickStats = await FragranceClick.findAll({
      attributes: [
        'fragranceId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalClicks'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUserClicks']
      ],
      group: ['fragranceId'],
      raw: true
    });

    // Combine fragrance data with click statistics
    const result = fragrances.map(fragrance => {
      const stats = clickStats.find(stat => stat.fragranceId === fragrance.id) || {
        fragranceId: fragrance.id,
        totalClicks: 0,
        uniqueUserClicks: 0
      };
      
      return {
        fragranceId: fragrance.id,
        fragranceName: fragrance.name, // assuming there's a 'name' field
        totalClicks: stats.totalClicks,
        uniqueUserClicks: stats.uniqueUserClicks
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching click statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



