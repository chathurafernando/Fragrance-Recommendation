// import { Vendor } from '../models/vendor.js'; // Assuming Vendor model is imported from your model file
import { uploadFile } from '../utils/firebase.js'; // Import the Firebase uploader utility
import { User } from '../models/user.js';
import bcrypt from "bcryptjs";
// import mailgun from "mailgun-js";
import crypto from "crypto";
import nodemailer from "nodemailer"
import { Op } from 'sequelize';

// Configure Mailgun
// const mg = mailgun({
//   apiKey: "cf6f0ab657100bdc4d0b1cb437e8e2c4-17c877d7-bf3a2f00",
//   domain: "sandbox0c056c1638394013bfd243f40a2ba810.mailgun.org" ,
// });

export const addVendor = async (req, res) => {
  try {
    const { username, email, phone } = req.body;

    console.log("Received File:", req.file);
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded!' });

    const uploadedImageUrl = await uploadFile(req.file);

    // Check email/phone duplicates
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json("Email is already registered!");

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) return res.status(409).json("Phone number is already registered!");

    // Generate random password
    const generatedPassword = crypto.randomBytes(8).toString('hex'); // e.g., 16-char password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(generatedPassword, salt);

    // const validVerificationValues = ['verified', 'pending'];
    // const vendorVerification = validVerificationValues.includes(verification) ? verification : 'pending';

    // Create user
    const newVendor = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
      img: uploadedImageUrl,
      // verification: vendorVerification,
      role: 'Vendor',
    });

    // Send email with generated password
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'chathurathinkpad@gmail.com',
        pass: 'eepi qfsf yhof splb' // Use the generated App Password here
      }
    });

    // Set up email data
    let mailOptions = {
      from: 'chathurathinkpad@gmail.com',
      to: email,
      subject: 'Your Temporary Vendor Account Password',
      text: `Hello, \n\nYour temporary password is: ${generatedPassword}. Please use this to log in and change your password as soon as possible.`,
      html: `<p>Hello,</p><p>Your temporary password is: <strong>${generatedPassword}</strong>. Please use this to log in and change your password as soon as possible.</p>`
    };
    

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent: ' + info.response);
  }
})


    res.status(201).json({
      message: "Vendor has been added successfully and credentials sent via email.",
      vendor: {
        id: newVendor.id,
        username: newVendor.username,
        email: newVendor.email,
        phone: newVendor.phone,
        // verification: newVendor.verification,
        role: newVendor.role,
        img: newVendor.img,
      },
    });
  } catch (err) {
    console.error("Error adding vendor:", err);
    res.status(500).json({ error: 'An error occurred while adding the vendor.' });
  }
};

export const getVendors = async (req, res) => {
  try {
    // Fetch all users with role "Vendor"
    const vendors = await User.findAll({ where: { role: "Vendor" } });

    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while retrieving vendors." });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone } = req.body;

    // Find vendor by ID
    const vendor = await User.findByPk(id);
    if (!vendor) return res.status(404).json("Vendor not found.");

    // Check for duplicate email (exclude current vendor)
    if (email && email !== vendor.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: id } // Ensure it's not the current user
        }
      });
      if (existingUser) return res.status(409).json("Email is already registered!");
    }

    // Check for duplicate phone (exclude current vendor)
    if (phone && phone !== vendor.phone) {
      const existingPhone = await User.findOne({
        where: {
          phone,
          id: { [Op.ne]: id }
        }
      });
      if (existingPhone) return res.status(409).json("Phone number is already registered!");
    }

    // Handle image update
    let uploadedImageUrl = vendor.img;
    if (req.file) {
      uploadedImageUrl = await uploadFile(req.file);
    }

    // Update vendor details
    await vendor.update({
      username,
      email,
      phone,
      img: uploadedImageUrl,
    });

    res.json({
      message: "Vendor has been updated successfully.",
      vendor: {
        id: vendor.id,
        username: vendor.username,
        email: vendor.email,
        phone: vendor.phone,
        img: vendor.img,
        role: vendor.role,
      }
    });

  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json("An error occurred while updating the vendor.");
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the vendor in the User table with role "Vendor"
    const vendor = await User.findOne({ where: { id, role: "Vendor" } });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found." });
    }

    // Delete the vendor
    await vendor.destroy();

    res.json({ message: "Vendor has been deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while deleting the vendor." });
  }
};



