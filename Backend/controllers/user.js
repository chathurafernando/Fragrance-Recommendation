import bcrypt from "bcryptjs";
import { User } from "../models/user.js"; // Assuming Sequelize model is used
import { uploadFile } from '../utils/firebase.js'; // Import the Firebase uploader utility
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Op } from 'sequelize';

export const addUser = async (req, res) => {
  try {
    const { username, phone, email} = req.body; // Removed password

    console.log("Received File:", req.file);
    if (!req.file) return res.status(400).json({ error: "No image file uploaded!" });

    const uploadedImageUrl = await uploadFile(req.file);

    // Check for email and phone duplication
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json("Email is already registered!");

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) return res.status(409).json("Phone number is already registered!");

    // Always generate a random password
    const generatedPassword = crypto.randomBytes(8).toString('hex'); // 16-char password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(generatedPassword, salt);

    // Create the user
    const newUser = await User.create({
      username,
      phone,
      email,
      password: hashedPassword,
      img: uploadedImageUrl,
      role: 'User',
    });

    // Email credentials to user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'chathurathinkpad@gmail.com',
        pass: 'eepi qfsf yhof splb' // Use your Gmail App Password
      }
    });

    const mailOptions = {
      from: 'chathurathinkpad@gmail.com',
      to: email,
      subject: 'Your Account Credentials',
      text: `Hello,\n\nYour temporary password is: ${generatedPassword}. Please log in and change it as soon as possible.`,
      html: `<p>Hello,</p><p>Your temporary password is: <strong>${generatedPassword}</strong>. Please log in and change it as soon as possible.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({
      message: "User has been added successfully and credentials sent via email.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        img: newUser.img,
      },
    });

  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "An error occurred while adding the user." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone } = req.body;

    // Find user by ID
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json("User not found.");

    // Optional: restrict this update function to role "User"
    // if (user.role !== "User") {
    //   return res.status(403).json("You are not authorized to update this user.");
    // }
    if (!username || !email || !phone) {
      return res.status(400).json("Username, email, and phone are required.");
    }
    // Check for duplicate email (excluding current user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: id }
        }
      });
      if (existingUser) return res.status(409).json("Email is already registered!");
    }

    // Check for duplicate phone (excluding current user)
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        where: {
          phone,
          id: { [Op.ne]: id }
        }
      });
      if (existingPhone) return res.status(409).json("Phone number is already registered!");
    }

    // Handle image upload (if any)
    let uploadedImageUrl = user.img;
    if (req.file) {
      uploadedImageUrl = await uploadFile(req.file);
    }

    // Update user details
    await user.update({
      username,
      email,
      phone,
      img: uploadedImageUrl,
    });

    res.json({
      message: "User has been updated successfully.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        img: user.img,
        role: user.role,
      }
    });

  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json("An error occurred while updating the user.");
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "User" },
    });

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json("An error occurred while retrieving users.");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json("User not found.");

    if (user.role !== "user") {
      return res.status(403).json("Only users with the 'User' role can be deleted.");
    }

    await user.destroy();

    res.json({ message: "User has been deleted successfully." });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json("An error occurred while deleting the user.");
  }
};



