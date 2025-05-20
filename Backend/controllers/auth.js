
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

// export const register = async (req, res) => {
//   try {
//     const { username, email, password, role, phone } = req.body;
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file uploaded!' });
//     }

//     const uploadedImageUrl = await uploadFile(req.file);

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) return res.status(409).json("User already exists!");

//     const existingPhone = await User.findOne({ where: { phone } });
//     if (existingPhone) return res.status(409).json("Phone number is already registered!");

//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync(password, salt);

//     const onboardingstep = role && role.trim().toLowerCase() === 'vendor' ? 5 : 1;

//     console.log({ 
//       username, 
//       email, 
//       password: hash, 
//       role, 
//       phone, 
//       img: uploadedImageUrl, 
//       onboardingstep: onboardingstep
//     });
    

//     const newUser = await User.create({ 
//       username, 
//       email, 
//       password: hash, 
//       role, 
//       phone, 
//       img: uploadedImageUrl, 
//       onboardingstep: onboardingstep
//     });

//     const token = jwt.sign(
//       { id: newUser.id, email: newUser.email, role: newUser.role, onboardingStep: newUser.onboardingstep },
//       process.env.JWT_SECRET || "jwtkey",
//       { expiresIn: '1d' }
//     );

//     res.cookie("access_token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });

//     return res.status(201).json({ 
//       message: "User has been created.",
//       token: token,
//       user: {
//         id: newUser.id,
//         username: newUser.username,
//         email: newUser.email,
//         role: newUser.role,
//         phone: newUser.phone,
//         img: newUser.img,
//         onboardingstep: newUser.onboardingstep
//       }
//     });

//   } catch (err) {
//     return res.status(500).json(err.message);
//   }
// };

export const register = async (req, res) => {
  try {
    // Validate required fields
    const { username, email, password, role, phone } = req.body;
    if (!username || !email || !password || !role || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate Sri Lankan phone number (10 digits starting with 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Sri Lankan phone number starting with 0' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded!' });
    }

    // Upload file and handle potential errors
    let uploadedImageUrl;
    try {
      uploadedImageUrl = await uploadFile(req.file);
    } catch (uploadError) {
      return res.status(500).json({ error: 'Failed to upload image', details: uploadError.message });
    }

    // Check for existing user with email or phone
    const [existingUser, existingPhone] = await Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { phone } })
    ]);

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    if (existingPhone) {
      return res.status(409).json({ error: 'Phone number is already registered' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const onboardingstep = role.trim().toLowerCase() === 'vendor' ? 5 : 1;

    // Create user
    const newUser = await User.create({ 
      username, 
      email, 
      password: hash, 
      role, 
      phone, 
      img: uploadedImageUrl, 
      onboardingstep 
    });

    // Generate token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role, 
        onboardingStep: newUser.onboardingstep 
      },
      process.env.JWT_SECRET || "jwtkey",
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Return success response
    return res.status(201).json({ 
      message: "User has been created successfully",
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
    console.error('Registration error:', err);
    
    // Handle specific error types
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Duplicate entry', details: err.errors.map(e => e.message) });
    }
    
    // Generic error response
    return res.status(500).json({ 
      error: 'An unexpected error occurred during registration',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user with given email exists
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "User not found!" });

//     // Validate password
//     const isPasswordCorrect = bcrypt.compareSync(password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Prepare user data
//     const userData = user?.dataValues || user;

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: userData.id, role: userData.role },
//       process.env.JWT_SECRET || "jwtkey",
//       { expiresIn: "1h" }
//     );

//     // Exclude password from response
//     // const { password: _, ...other } = userData;

//     // Set cookie and return user info + token
//     res.cookie("access_token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });

//     console.log({user});
    

//     // return res.status(200).json({ ...other, access_token: token });

//     res.status(200).json({
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         onboardingstep: user.onboardingstep, // 🚨 ADD this!
//       },
//       token : token,
//     });

//   } catch (err) {
//     console.error("Error in login:", err);
//     return res.status(500).json({ message: "Internal server error", error: err.message });
//   }
// };
  export const login = async (req, res) => {
  try {
    // Input validation
    const { email, password } = req.body;
    
    // Check for missing required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    // Check if user with given email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid email or password'  // Security best practice: Don't reveal which field is incorrect
      });
    }

    // Validate password
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'  // Security best practice: Don't reveal which field is incorrect
      });
    }

    // Check if user account is active
    if (user.status === 'inactive') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Prepare user data
    const userData = user?.dataValues || user;

    // Generate JWT token with appropriate expiration
    const token = jwt.sign(
      { 
        id: userData.id, 
        role: userData.role,
        email: userData.email 
      },
      process.env.JWT_SECRET || "jwtkey",
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    // Update last login timestamp
    await User.update(
      { lastLogin: new Date() },
      { where: { id: userData.id } }
    ).catch(err => {
      // Non-critical error, just log it
      console.warn('Failed to update last login time:', err.message);
    });

    // Set HTTP-only cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000, // 1 hour in milliseconds
    });

    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        onboardingstep: userData.onboardingstep || 0,
        name: userData.name || null,
      },
      token: token,
    });

  } catch (err) {
    // Detailed error logging for debugging
    console.error("Login error:", {
      message: err.message,
      stack: err.stack,
      errorType: err.name,
    });

    // Error response with appropriate status code
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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