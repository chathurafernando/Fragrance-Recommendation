import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const register = (req, res) => {
    //CHECK EXISTING USER
    const q = "SELECT * FROM user WHERE email = ? OR username = ?";
  
    db.query(q, [req.body.email, req.body.username], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(409).json("User already exists!");
  
      //Hash the password and create a user
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
  
      const q = "INSERT INTO user(`username`,`email`,`password`) VALUES (?)";
      const values = [req.body.username, req.body.email, hash];
  
      db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("User has been created.");
      });
    });
  };

  export const login = (req, res) => {
    // Check if user exists

    const q = "SELECT * FROM user WHERE username = ?"

    db.query(q, [req.body.username], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(409).json("User not Found!");
      const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password); // true

      if(!isPasswordCorrect) return res.status(400).json("Wrong username or Password")

        const token = jwt.sign({id:data[0].id},"jwtkey")
        const {password, ...other} = data[0] 
 
        res.cookie("access_token",token,{
          httpOnly:true
        }).status(200).json(other)
    })
};

// Logout function
export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only secure in production
    sameSite: "lax", // Change to "strict" if needed
  });
  return res.status(200).json("User has been logged out");
};
