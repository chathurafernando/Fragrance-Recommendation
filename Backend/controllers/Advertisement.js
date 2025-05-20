import { Advertisement } from "../models/Advertisement.js";
import { Placement } from "../models/Placement.js";
import { uploadFile } from "../utils/firebase.js"; 
import { BusinessInfo } from "../models/BusinessInfo.js"; // Import business info model
import User from "../models/user.js";
import { Op } from "sequelize";

// POST controller to add advertisement offer
// export const addAdvertisement = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required." });
//     }

//     // 1. Check user
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     if (user.role !== 'vendor') {
//       return res.status(403).json({ error: "Only vendors can add advertisement offers." });
//     }

//     // 2. Find business info (company) by uid (foreign key to user.id)
//     const company = await BusinessInfo.findOne({ where: { uid: userId } });
//     if (!company) {
//       return res.status(404).json({ error: "Company (Business Info) not found for this vendor." });
//     }

//     // 3. Validate dates
//     const { description, placement, startDate, endDate } = req.body;

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffInMs = end - start;
//     const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

//     if (diffInDays > 14) {
//       return res.status(400).json({ error: "Offer period cannot exceed 2 weeks." });
//     }

//     // 4. Check if file is uploaded
//     if (!req.file) {
//       return res.status(400).json({ error: "No banner image uploaded!" });
//     }

//     // 5. Upload banner image to Firebase (or local/cloud storage)
//     const uploadedImageUrl = await uploadFile(req.file);
//     console.log("Banner uploaded URL:", uploadedImageUrl);

//     // 6. Fetch placement price
//     const placementRecord = await Placement.findOne({ where: { name: placement } });
//     if (!placementRecord) {
//       return res.status(400).json({ error: "Invalid placement selected!" });
//     }

//     const price = placementRecord.price;

//     // 7. Save to Advertisement table with company_id (not userId)
//     const newAd = await Advertisement.create({
//       description,
//       placement,
//       price,
//       startDate,
//       endDate,
//       bannerUrl: uploadedImageUrl,
//       company_id: company.id, // ✅ Use business_info.id here
//     });

// res.json({ 
//   message: "Advertisement offer added successfully!", 
//   id: newAd.id,          // <-- include advertisement ID here
//   price: newAd.price ,    // <-- include price here
//   placement :newAd.placement
// });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "An error occurred while adding the advertisement offer." });
//   }
// };
export const addAdvertisement = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // 1. Check user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors can add advertisement offers." });
    }

    // 2. Find business info (company) by uid (foreign key to user.id)
    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company) {
      return res.status(404).json({ error: "Company (Business Info) not found for this vendor." });
    }

    // ✅ Check if company is verified
    if (company.verification !== 'verified') {
      return res.status(403).json({ error: "Company is not verified. Only verified vendors can add advertisement offers." });
    }

    // 3. Validate dates
    const { description, placement, startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays > 14) {
      return res.status(400).json({ error: "Offer period cannot exceed 2 weeks." });
    }

    // 4. Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No banner image uploaded!" });
    }

    // 5. Upload banner image to Firebase (or local/cloud storage)
    const uploadedImageUrl = await uploadFile(req.file);
    console.log("Banner uploaded URL:", uploadedImageUrl);

    // 6. Fetch placement price
    const placementRecord = await Placement.findOne({ where: { name: placement } });
    if (!placementRecord) {
      return res.status(400).json({ error: "Invalid placement selected!" });
    }

    const price = placementRecord.price;

    // 7. Save to Advertisement table with company_id (not userId)
    const newAd = await Advertisement.create({
      description,
      placement,
      price,
      startDate,
      endDate,
      bannerUrl: uploadedImageUrl,
      company_id: company.id,
      payment_status: 0, // Initialize with pending status
      is_published: false // Initialize as not published
    });

    res.json({ 
      message: "Advertisement offer added successfully! It will be published after payment confirmation.", 
      id: newAd.id,
      price: newAd.price,
      placement: newAd.placement
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while adding the advertisement offer." });
  }
};


//  GET controller to fetch all placements
export const getPlacements = async (req, res) => {
  try {
    const placements = await Placement.findAll({
      attributes: ['name', 'price']  // Only send name & price
    });

    res.json(placements);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch placements." });
  }
};

//  GET controller to fetch all ads of a vendor
export const getVendorAdvertisements = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // 1. Check if user exists and is vendor
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors can view their advertisements." });
    }

    // 2. Get company ID from the business_info table using userId
    const businessInfo = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!businessInfo) {
      return res.status(404).json({ error: "Business information not found for this user." });
    }

    const companyId = businessInfo.id;

    // 3. Get only paid & published advertisements (payment_status = 2 and is_published = true)
    const ads = await Advertisement.findAll({
      where: {
        company_id: companyId,
        payment_status: 2,
        is_published: true
      },
      // order: [['createdAt', 'DESC']]  // optional
    });

    res.json(ads);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch advertisements." });
  }
};


export const getBannersByPlacement = async (req, res) => {
  const { placement } = req.params;

  try {
    const banners = await Advertisement.findAll({
      where: {
        placement,
        endDate: { [Op.gte]: new Date() }, // This will filter for future or current dates
        payment_status: 2,
        is_published: true
      },
      order: [['startDate', 'DESC']],
      limit: 5
    });

    if (!banners.length) {
      return res.status(404).json({ message: 'No banners found for this placement' });
    }

    res.json(banners);

  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// export const getAdvertisementByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // Validate user
//     const user = await User.findByPk(userId);
//     console.log(user);
//     if (!user || user.role !== 'vendor') {
//       return res.status(404).json({ error: "Valid vendor not found." });
//     }

//     // Get company for vendor
//     const company = await BusinessInfo.findOne({ where: { uid: userId } });
//     if (!company) {
//       return res.status(404).json({ error: "Business Info not found for vendor." });
//     }

//     // Get latest advertisement for that company
//     const ad = await Advertisement.findOne({
//       where: { company_id: company.id },
//     });

//     if (!ad) {
//       return res.status(404).json({ error: "No advertisement found for vendor." });
//     }

//     // Return the entire advertisement object
//     return res.json(ad);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error fetching advertisement." });
//   }
// };

export const updateAdvertisement = async (req, res) => {
  try {
    const adId = req.params.adId;
    const userId = req.params.id;

    if (!userId || !adId) {
      return res.status(400).json({ error: "User ID and Advertisement ID are required." });
    }

    // 1. Check user
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors can update advertisement offers." });
    }

    // 2. Get Advertisement and validate ownership
    const ad = await Advertisement.findByPk(adId);
    if (!ad) {
      return res.status(404).json({ error: "Advertisement not found." });
    }

    // 3. Check ownership by verifying company_id
    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company || ad.company_id !== company.id) {
      return res.status(403).json({ error: "You are not authorized to update this advertisement." });
    }

    // 4. Update fields
    const { description, placement, startDate, endDate } = req.body;

    // Validate new date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInDays > 14) {
      return res.status(400).json({ error: "Offer period cannot exceed 2 weeks." });
    }

    // 5. Handle image update if new image is uploaded
    let bannerUrl = ad.bannerUrl;
    if (req.file) {
      bannerUrl = await uploadFile(req.file);
    }

    // 6. Update placement and price if changed
    let price = ad.price;
    if (placement && placement !== ad.placement) {
      const placementRecord = await Placement.findOne({ where: { name: placement } });
      if (!placementRecord) {
        return res.status(400).json({ error: "Invalid placement selected!" });
      }
      price = placementRecord.price;
    }

    // 7. Update advertisement
    await ad.update({
      description,
      placement,
      price,
      startDate,
      endDate,
      bannerUrl,
    });

    res.json({ message: "Advertisement updated successfully!", ad });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while updating the advertisement." });
  }
};

export const deleteAdvertisement = async (req, res) => {
  try {
    const { userId, adId } = req.params;

    if (!userId || !adId) {
      return res.status(400).json({ error: "User ID and Advertisement ID are required." });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors can delete advertisement offers." });
    }

    const ad = await Advertisement.findByPk(adId);
    if (!ad) {
      return res.status(404).json({ error: "Advertisement not found." });
    }

    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company || ad.company_id !== company.id) {
      return res.status(403).json({ error: "You are not authorized to delete this advertisement." });
    }

    await ad.destroy();

    res.json({ message: "Advertisement deleted successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while deleting the advertisement." });
  }
};

