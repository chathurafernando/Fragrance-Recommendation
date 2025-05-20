// // import express from "express";
// // import multer from "multer";
// // import { addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/post.js";

// // const router = express.Router();

// // const upload = multer({ storage: multer.memoryStorage() });

// // // Define routes
// // router.get("/", getPosts);
// // router.get("/:id", getPost);
// // router.post("/", upload.single("image"), addPost);
// // router.delete("/:id", deletePost);
// // router.put("/:id", updatePost);

// // export default router;

// import express from "express";
// import multer from "multer";
// import { addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/post.js";
// import authenticate from "../middlewares/authenticate.js";

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // Apply authentication and authorization middleware to routes
// // router.get("/", authenticate(["admin", "user"]), getPosts);
// // router.get("/:id", authenticate(["admin","user"]), getPost);
// router.post("/", upload.single("image"), addPost); // Only admin and vendor can add posts
// // router.delete("/:id", authenticate(["admin", "vendor"]), deletePost); // Only admin and vendor can delete posts
// // router.put("/:id", authenticate(["admin", "vendor"]), updatePost); // Only admin and vendor can update posts

// export default router;

// authenticate(["admin", "vendor", "user"])