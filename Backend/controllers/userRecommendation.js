import Fragrance from "../models/fragrance.js";
import FragranceNote from "../models/fragranceNote.js";
import User from "../models/user.js";
import UserFavoriteNote from "../models/userFavoriteNote.js";
import UserPersonalTaste from "../models/userPersonalTastes.js";
import { Op } from "sequelize";
import Wishlist from "../models/wishlist.js";
import { sequelize } from '../db.js';


export const getRecommendedFragrances = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // Get limit from query params (defaults to 10)
      const limit = parseInt(req.query.limit) || 10;
  
      // 1. Get user personal taste
      const taste = await UserPersonalTaste.findOne({ where: { user_id: userId } });
      if (!taste) throw new Error("User personal taste not found");
  
      const { looking_for, age_range, occasion, smell, intensity } = taste;
      console.log("User personal taste values:", taste.toJSON());
  
      // 2. Get user favorite notes
      const favNotes = await UserFavoriteNote.findAll({ where: { user_id: userId } });
      const favNoteIds = favNotes.map(n => n.note_id);
      console.log("User favorite note IDs:", favNoteIds);
  
      // 3. Get ALL fragrances
      const allFragrances = await Fragrance.findAll();
      console.log(`Found ${allFragrances.length} total fragrances.`);
  
      // 4. Score each fragrance based on taste match
      const scoreMap = {};
      allFragrances.forEach(frag => {
        let score = 0;
        if (frag.looking_for === looking_for) score += 1;
        if (frag.age_range === age_range) score += 1;
        if (frag.occasion === occasion) score += 1;
        if (frag.smell === smell) score += 1;
        if (frag.intensity === intensity) score += 1;
        scoreMap[frag.id] = score;
      });
  
      // 5. Add score for favorite note matches
      const noteMatches = await FragranceNote.findAll({
        where: {
          noteId: favNoteIds.length > 0 ? favNoteIds : [-1],
        },
      });
  
      noteMatches.forEach(nm => {
        if (scoreMap[nm.fragranceId] !== undefined) {
          scoreMap[nm.fragranceId] += 2; // more weight for note matches
        } else {
          scoreMap[nm.fragranceId] = 2;
        }
      });
  
      console.log("Final fragrance scores:", scoreMap);
  
      // 6. Sort by score
      const sortedFragranceIds = Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]))
        .slice(0, limit); // apply dynamic limit here
  
      console.log(`Top ${limit} sorted fragrance IDs:`, sortedFragranceIds);
  
      // 7. Return final sorted fragrances
      const recommended = await Fragrance.findAll({
        where: {
          id: {
            [Op.in]: sortedFragranceIds,
          },
        },
      });
  
      // Ensure order is preserved
      const orderedRecommended = sortedFragranceIds.map(id =>
        recommended.find(f => f.id === id)
      ).filter(Boolean);
  
      return res.status(200).json(orderedRecommended);
    } catch (err) {
      console.error("Error fetching recommended fragrances:", err);
      return res.status(500).json({ message: "An error occurred while fetching recommended fragrances" });
    }
  };


export const getNewArrivals = async (req, res) => {
  try {
    // Get limit from query params, default is 10
    const limit = parseInt(req.query.limit) || 10;

    // Get newest arrivals
    const newArrivals = await Fragrance.findAll({
      order: [['createdAt', 'DESC']],
      limit,
    });

    return res.status(200).json(newArrivals);
  } catch (err) {
    console.error("Error fetching new arrivals:", err);
    return res.status(500).json({ message: "An error occurred while fetching new arrivals" });
  }
};


export const getPopularPicks = async (req, res) => {
    try {
      // Get limit from query params, default is 10
      const limit = parseInt(req.query.limit) || 10;
  
      // 1. Get fragrance IDs sorted by wishlist count
      const topFragranceData = await Wishlist.findAll({
        attributes: [
          "fragrance_id",
          [sequelize.fn("COUNT", sequelize.col("fragrance_id")), "wishlistCount"],
        ],
        group: ["fragrance_id"],
        order: [[sequelize.literal("wishlistCount"), "DESC"]],
        limit,
      });
  
      // 2. Extract fragrance IDs
      const topFragranceIds = topFragranceData.map(item => item.fragrance_id);
  
      // 3. Get fragrance details
      const fragrances = await Fragrance.findAll({
        where: { id: topFragranceIds },
      });
  
      // 4. Return fragrances ordered as per wishlist count
      const orderedFragrances = topFragranceIds.map(id =>
        fragrances.find(frag => frag.id === id)
      ).filter(Boolean);
  
      return res.status(200).json(orderedFragrances);
    } catch (err) {
      console.error("Error fetching popular picks:", err);
      return res.status(500).json({ message: "An error occurred while fetching popular picks" });
    }
  };

