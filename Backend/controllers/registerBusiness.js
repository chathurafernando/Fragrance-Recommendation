import { BusinessInfo } from "../models/BusinessInfo.js";
import { User } from "../models/user.js"; // Import the User model
import { uploadFile } from "../utils/firebase.js";


export const addBusiness = async (req, res) => {
  try {
    const {
      companyName,
      phoneOffice,
      description,
      address,
      websiteURL,
      vendorId, // optional - only admin should send this
    } = req.body;

    const { id: uidFromToken, role } = req.userInfo;

    console.log({ id: uidFromToken, role });

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded!' });
    }

    // Validate Sri Lankan phone number (10 digits starting with 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneOffice)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Sri Lankan phone number starting with 0' });
    }

    const uploadedImageUrl = await uploadFile(req.file);

    let uidToUse;

    if (role.toLowerCase() === 'vendor') {
      uidToUse = uidFromToken;
    } else if (role.toLowerCase() === 'admin') {
      if (!vendorId) {
        return res.status(400).json("Admin must provide a vendorId when registering a business.");
      }

      const vendor = await User.findOne({ where: { id: vendorId, role: 'vendor' } });
      if (!vendor) {
        return res.status(404).json("Vendor not found.");
      }

      uidToUse = vendorId;
    } else {
      return res.status(403).json("Only vendors or admins can register a business.");
    }

    // ✅ New Rule: One user (vendor) can only register one business
    const existingBusinessByUid = await BusinessInfo.findOne({ where: { uid: uidToUse } });
    if (existingBusinessByUid) {
      return res.status(409).json("You have already registered a business.");
    }

    // Check for duplicate company name
    const existingCompany = await BusinessInfo.findOne({ where: { companyName } });
    if (existingCompany) {
      return res.status(409).json("Company name is already registered!");
    }

    // Check for duplicate phone
    const existingPhone = await BusinessInfo.findOne({ where: { phoneOffice } });
    if (existingPhone) {
      return res.status(409).json("Phone number is already registered!");
    }

    const newBusiness = await BusinessInfo.create({
      companyName,
      phoneOffice,
      description,
      address,
      websiteURL,
      image: uploadedImageUrl,
      verification: 'pending',
      uid: uidToUse,
    });

    const [updated] = await User.update(
      { onboardingstep: 6 }, // Fields to update
      { where: { id: uidToUse } }    // Condition to find the user
    );

    console.log(updated);

    return res.status(201).json({
      message: "Business has been added successfully.",
      business: newBusiness,
      onboardingstep: 6,
    });

  } catch (err) {
    console.error("Error adding business:", err);
    res.status(500).json({ error: 'An error occurred while adding the business.' });
  }
}


export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params; // Business ID from URL params
    const {
      companyName,
      phoneOffice,
      description,
      address,
      websiteURL,
      verification
    } = req.body;

    // const { id: uid } = req.userInfo; // User ID from token

    // Check if user is a vendor
    // const user = await User.findOne({ where: { id: uid } });
    // if (!user || user.role.toLowerCase() !== 'vendor') {
    //   return res.status(403).json("Only vendors can update business details.");
    // }

    // Check if business exists
    const business = await BusinessInfo.findByPk(id);
    if (!business) {
      return res.status(404).json("Business not found.");
    }

    // Check ownership
    // if (business.uid !== uid) {
    //   return res.status(403).json("You are not authorized to update this business.");
    // }

    // Check for duplicate company name if changed
    if (companyName && companyName !== business.companyName) {
      const existingCompany = await BusinessInfo.findOne({ where: { companyName } });
      if (existingCompany) {
        return res.status(409).json("Company name is already registered!");
      }
    }

    // Check for duplicate phone if changed
    if (phoneOffice && phoneOffice !== business.phoneOffice) {
      const existingPhone = await BusinessInfo.findOne({ where: { phoneOffice } });
      if (existingPhone) {
        return res.status(409).json("Phone number is already registered!");
      }
    }
    let uploadedImageUrl = business.img;
    if (req.file) {
      uploadedImageUrl = await uploadFile(req.file);
    }
    // Validate verification status
    const validStatuses = ['pending', 'verified'];
    const verifiedStatus = validStatuses.includes(verification?.toLowerCase())
      ? verification.toLowerCase()
      : business.verification;

    // Update business info
    await business.update({
      companyName,
      phoneOffice,
      description,
      address,
      websiteURL,
      image: uploadedImageUrl,
      verification: verifiedStatus
    });

    return res.json({
      message: "Business information updated successfully.",
      business
    });

  } catch (err) {
    console.error("Error updating business:", err);
    res.status(500).json({ error: "An error occurred while updating the business." });
  }
}

export const getBusinesses = async (req, res) => {
  try {
    const businesses = await BusinessInfo.findAll();
    res.status(200).json({ businesses });
  } catch (error) {
    console.error("Error retrieving businesses:", error);
    res.status(500).json({ message: "Error retrieving businesses", error });
  }
};

// GET company details by User ID
export const getCompanyByUserId = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // 1. Check user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors can view their company details." });
    }

    // 2. Find business info (company)
    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company) {
      return res.status(404).json({ error: "Company (Business Info) not found for this vendor." });
    }

    // 3. Return company details
    return res.json(company);

  } catch (error) {
    console.error(`Error fetching company: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await BusinessInfo.findByPk(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    await business.destroy();

    res.status(200).json({ message: "Business deleted successfully." });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Error deleting business.", error });
  }
};

export const updateVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verification } = req.body; // Expecting "verified" or "pending"

    // Ensure verification value is valid
    const validStatuses = ["verified", "pending"];
    if (!validStatuses.includes(verification)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    // Find the vendor's business info entry
    const businessInfo = await BusinessInfo.findOne({ where: { id } });

    if (!businessInfo) {
      return res.status(404).json({ message: "Business info for vendor not found" });
    }

    // Update the verification status in the BusinessInfo table
    await businessInfo.update({ verification });

    res.status(200).json({
      message: "Vendor verification updated successfully in Business Info",
      businessInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating verification", error });
  }
};



