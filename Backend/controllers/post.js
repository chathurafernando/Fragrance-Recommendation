// // import {db} from "../db.js"
// // import jwt from "jsonwebtoken"

// // // Get all posts or filter by category
// // export const getPosts = (req, res) => {
// //     const q = req.query.cat 
// //       ? "SELECT * FROM posts WHERE cat = ?" 
// //       : "SELECT * FROM posts";
  
// //     db.query(q, [req.query.cat], (err, data) => {
// //       if (err) return res.status(500).send(err); // Set status to 500 for server errors
// //       return res.status(200).json(data); // Send 200 status for successful request
// //     });
// //   };
  
// //   // Get a single post by ID
// //   export const getPost = (req, res) => {
// //     const q =
// //       "SELECT p.id, `username`, `title`, `desc`, p.img, u.img AS userImg, `cat`,`date` FROM user u JOIN posts p ON u.id = p.uid WHERE p.id = ? ";
  
// //     db.query(q, [req.params.id], (err, data) => {
// //       if (err) return res.status(500).json(err);
  
// //       return res.status(200).json(data[0]);
// //     });
// //   };
  
  
  
  

// //   export const addPost = (req, res) => {
// //     const token = req.cookies.access_token;
// //     if (!token) return res.status(401).json("Not authenticated!");
  
// //     jwt.verify(token, "jwtkey", (err, userInfo) => {
// //       if (err) return res.status(403).json("Token is not valid!");
  
// //       const q =
// //         "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`,`uid`) VALUES (?)";
  
// //       const values = [
// //         req.body.title,
// //         req.body.desc,
// //         req.body.img,
// //         req.body.cat,
// //         req.body.date,
// //         userInfo.id,
// //       ];
  
// //       db.query(q, [values], (err, data) => {
// //         if (err) return res.status(500).json(err);
// //         return res.json("Post has been created.");
// //       });
// //     });
// //   };
  

// // export const deletePost = (req, res) => {
// //     const token = req.cookies.access_token;
// //     if (!token) return res.status(401).json("Not Authenticated!");
  
// //     jwt.verify(token, "jwtkey", (err, userInfo) => {
// //       if (err) return res.status(403).json("Token is not Valid!");
  
// //       const postId = req.params.id; // Extract the post ID from the request parameters
  
// //       const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?"; // Ensure post ID matches user ID
  
// //       db.query(q, [postId, userInfo.id], (err, data) => {
// //         if (err) return res.status(500).json(err);
  
// //         if (data.affectedRows === 0) {
// //           return res.status(403).json("You can only delete your posts or the post doesn't exist.");
// //         }
  
// //         return res.json("Post has been deleted!");
// //       });
// //     });
// //   };
  

// // export const updatePost = (req,res)=>{
// //   const token = req.cookies.access_token;
// //   if (!token) return res.status(401).json("Not authenticated!");

// //   jwt.verify(token, "jwtkey", (err, userInfo) => {
// //     if (err) return res.status(403).json("Token is not valid!");
// //     const postId = req.params.id;
// //     const q =
// //       "UPDATE  posts  SET `title` =?,`desc` =?,`img` =?,`cat` =? WHERE `id`=? AND `uid`=? "

// //     const values = [
// //       req.body.title,
// //       req.body.desc,
// //       req.body.img,
// //       req.body.cat
// //     ];

// //     db.query(q,[...values,postId,userInfo.id] , (err, data) => {
// //       if (err) return res.status(500).json(err);
// //       return res.json("Post has been updated.");
// //     });
// //   });

// // }

// // // export const getPost = (req, res) => {
// //   //   const q = "SELECT id, `title`, `desc`, img, `cat`, `date` FROM posts WHERE id = ?";
  
// //   //   db.query(q, [req.params.id], (err, data) => {
// //   //     if (err) return res.status(500).send(err); // Server error
// //   //     return res.status(200).json(data); // Successful response
// //   //   });
// //   // };

// import jwt from "jsonwebtoken";
// import { Post } from "../models/post.js";
// import { User } from "../models/user.js";
// import { verifyToken } from "../controllers/auth.js";

// export const addPost = [verifyToken, async (req, res) => {
//   try {
//     const { title, desc, category, date } = req.body;
//     const { id } = req.userInfo;  // Get the uid from the decoded token

//     if (!req.file) {
//       return res.status(400).json("No image file uploaded!");
//     }
//     console.log("Received File:", req.file);

//     const uploadedFileUrl = await uploadFile(req.file);

//     console.log("Url",uploadedFileUrl)

//     console.log({uploadedFileUrl : req.file, title, desc, category, date, id}  );

//     // Create a new post
//     const post = await Post.create({
//       title: title,
//       desc: desc,
//       img: uploadedFileUrl,  // Set the image URL after upload
//       cat: category,
//       date: date,
//       uid: id,  // Use the uid from the token
//     });

//     // Respond with the newly created post
//     res.json({ message: "Post has been created.", post });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json("An error occurred while creating the post.");
//   }
// }];

// // Get all posts or filter by category
// export const getPosts = async (req, res) => {
//   try {
//     const posts = req.query.cat
//       ? await Post.findAll({ where: { cat: req.query.cat } })
//       : await Post.findAll();
      
//     res.status(200).json(posts);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };

// // Get a single post by ID
// export const getPost = async (req, res) => {
//   try {
//     const post = await Post.findOne({
//       where: { id: req.params.id },
//       include: [
//         {
//           model: User,
//           attributes: ['username', 'img'],
//         },
//       ],
//     });
//     if (!post) return res.status(404).json("Post not found");
//     res.status(200).json(post);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };

// import { uploadFile } from "../utils/firebase.js"; 



// // Delete a post
// export const deletePost = async (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not Authenticated!");

//   jwt.verify(token, "jwtkey", async (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not Valid!");

//     try {
//       const post = await Post.findOne({ where: { id: req.params.id, uid: userInfo.id } });
//       if (!post) return res.status(403).json("You can only delete your posts or the post doesn't exist.");
      
//       await post.destroy();
//       res.json("Post has been deleted!");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });
// };

// // Update a post
// export const updatePost = async (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not authenticated!");

//   jwt.verify(token, "jwtkey", async (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     try {
//       const post = await Post.findOne({ where: { id: req.params.id, uid: userInfo.id } });
//       if (!post) return res.status(403).json("You can only update your posts or the post doesn't exist.");
      
//       await post.update({
//         title: req.body.title,
//         desc: req.body.desc,
//         img: req.body.img,
//         cat: req.body.cat,
//       });
//       res.json("Post has been updated.");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });
// };
