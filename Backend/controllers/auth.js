
import { User } from "../models/user.js"; // Assuming User model is properly defined
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadFile } from "../utils/firebase.js"; 

// Register function
// export const register = async (req, res) => {
//   try {
//     const { username, email, password, role, phone } = req.body;
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file uploaded!' });
//     }

//     // Upload the image to Firebase and get the public URL
//     const uploadedImageUrl = await uploadFile(req.file);
//     // Check if user exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) return res.status(409).json("User already exists!");

//     // Check if phone number exists (if needed)
//     const existingPhone = await User.findOne({ where: { phone } });
//     if (existingPhone) return res.status(409).json("Phone number is already registered!");

//     // Hash password
//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync(password, salt);

//     // Create a new user
//     await User.create({ username, email, password: hash, role, phone,img: uploadedImageUrl, });

//     const token = jwt.sign(
//       { id: newUser.id, email: newUser.email, role: newUser.role },
//       process.env.JWT_SECRET, // secret key from your environment variables
//       { expiresIn: '1d' } // expires in 1 day (adjust as needed)
//     );

//     return res.status(200).json({ 
//       message: "User has been created.",
//       token: token,
//       user: {
//         id: newUser.id,
//         username: newUser.username,
//         email: newUser.email,
//         role: newUser.role,
//         phone: newUser.phone,
//         img: newUser.img
//       }
//     });

//   } catch (err) {
//     return res.status(500).json(err.message);
//   }
// };

export const register = async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded!' });
    }

    const uploadedImageUrl = await uploadFile(req.file);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json("User already exists!");

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) return res.status(409).json("Phone number is already registered!");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const onboardingstep = role && role.trim().toLowerCase() === 'vendor' ? 5 : 1;

    console.log({ 
      username, 
      email, 
      password: hash, 
      role, 
      phone, 
      img: uploadedImageUrl, 
      onboardingstep: onboardingstep
    });
    

    const newUser = await User.create({ 
      username, 
      email, 
      password: hash, 
      role, 
      phone, 
      img: uploadedImageUrl, 
      onboardingstep: onboardingstep
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, onboardingStep: newUser.onboardingstep },
      process.env.JWT_SECRET || "jwtkey",
      { expiresIn: '1d' }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(201).json({ 
      message: "User has been created.",
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        img: newUser.img,
        onboardingstep: newUser.onboardingstep
      }
    });

  } catch (err) {
    return res.status(500).json(err.message);
  }
};



// Login function
// export const login = async (req, res) => {
//     try {
//       const { username, password } = req.body;
  
//       // Check if user exists
//       const user = await User.findOne({ where: { username } });
//       if (!user) return res.status(404).json({ message: "User not found!" });
  
//       console.log("User Data:", user); // Debugging
  
//       // Validate password
//       const isPasswordCorrect = bcrypt.compareSync(password, user.password);
//       if (!isPasswordCorrect) return res.status(401).json({ message: "Wrong username or password" });
  
//       // Ensure `user.dataValues` exists before destructuring
//       const userData = user?.dataValues || user;
  
//       console.log("User DataValues:", userData); // Debugging
  
//       // Generate JWT token
//       const token = jwt.sign({ id: userData.id, role: userData.role }, process.env.JWT_SECRET || "jwtkey", { expiresIn: "1h" });
  
//       console.log("Generated Token:", token); // Debugging
  
//       // Remove password before sending response
//       const { password: _, ...other } = userData;
  
//       res.cookie("access_token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//       });
  
//       return res.status(200).json({ ...other, access_token: token });
//     } catch (err) {
//       console.error("Error in login:", err);
//       return res.status(500).json({ message: "Internal server error", error: err.message });
//     }
//   };
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user with given email exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found!" });

    // Validate password
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Prepare user data
    const userData = user?.dataValues || user;

    // Generate JWT token
    const token = jwt.sign(
      { id: userData.id, role: userData.role },
      process.env.JWT_SECRET || "jwtkey",
      { expiresIn: "1h" }
    );

    // Exclude password from response
    // const { password: _, ...other } = userData;

    // Set cookie and return user info + token
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log({user});
    

    // return res.status(200).json({ ...other, access_token: token });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        onboardingstep: user.onboardingstep, // 🚨 ADD this!
      },
      token : token,
    });

  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
  
const createAdminUser = async () => {
    const adminExists = await User.findOne({ where: { email: "admin@example.com" } });
  
    if (!adminExists) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync("admin", salt);
  
      await User.create({
        username: "admin",
        email: "admin@example.com",
        password: hash,
        role: "admin",
      });
  
      console.log("Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }
  };
  
  // createAdminUser();
// Logout function
export const logout = (req, res) => {
  try {
    // Clear the access_token cookie
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Optionally, send a message indicating the user has been logged out
    res.status(200).json({ message: "Logout successful" });

  } catch (err) {
    console.error("Error in logout:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


export const verifyToken = (req, res, next) => {

  console.log({req});
  
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(403).json("Token is required 2.");
  }

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) {
      return res.status(403).json("Invalid or expired token.");
    }

    console.log(userInfo);
    

    req.userInfo = userInfo;  // Attach userInfo (including uid) to the request
    next();  // Proceed to the next middleware or route handler
  });
};
