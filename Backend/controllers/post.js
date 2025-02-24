import {db} from "../db.js"
import jwt from "jsonwebtoken"

// Get all posts or filter by category
export const getPosts = (req, res) => {
    const q = req.query.cat 
      ? "SELECT * FROM posts WHERE cat = ?" 
      : "SELECT * FROM posts";
  
    db.query(q, [req.query.cat], (err, data) => {
      if (err) return res.status(500).send(err); // Set status to 500 for server errors
      return res.status(200).json(data); // Send 200 status for successful request
    });
  };
  
  // Get a single post by ID
  export const getPost = (req, res) => {
    const q = "SELECT p.id,`username`, `title`, `desc`, p.img, u.img AS userImg, `cat`, `date` FROM user u JOIN posts p on u.id = p.uid WHERE p.id = ?";
  
    db.query(q, [req.params.id], (err, data) => {
      if (err) return res.status(500).send(err); // Set status to 500 for server errors
      return res.status(200).json(data[0]); // Send 200 status for successful request
    });
  };
  

  export const addPost = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated!");
  
    jwt.verify(token, "jwtkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const q =
        "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`,`uid`) VALUES (?)";
  
      const values = [
        req.body.title,
        req.body.desc,
        req.body.img,
        req.body.cat,
        req.body.date,
        userInfo.id,
      ];
  
      db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Post has been created.");
      });
    });
  };
  

export const deletePost = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not Authenticated!");
  
    jwt.verify(token, "jwtkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not Valid!");
  
      const postId = req.params.id; // Extract the post ID from the request parameters
  
      const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?"; // Ensure post ID matches user ID
  
      db.query(q, [postId, userInfo.id], (err, data) => {
        if (err) return res.status(500).json(err);
  
        if (data.affectedRows === 0) {
          return res.status(403).json("You can only delete your posts or the post doesn't exist.");
        }
  
        return res.json("Post has been deleted!");
      });
    });
  };
  

export const updatePost = (req,res)=>{
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const postId = req.params.id; // Extract the post ID from the request parameters
    const q =
      "UPDATE  posts  SET`title` =?,`desc` =?,`img` =?,`cat` =? WHERE `id`=? AND `uid`=? "

    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat
    ];

    db.query(q,[...values,postID,userInfo.id] , (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been updated.");
    });
  });

}

