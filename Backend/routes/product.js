import express from "express";
import multer from "multer";
// import { addBrandFragranceProduct } from "../controllers/products.js";
import {  addVendorProduct, deleteVendorProduct, getVendorProductById, getVendorProducts, updateVendorProduct } from "../controllers/vendorProducts.js";


// Create the multer storage setup for image uploads


const router = express.Router();

// POST route to add a new fragrance (with image upload)
// router.post("/", upload.single("image"), addFragrance);

// // GET route to retrieve all fragrances
router.post("/:id", addVendorProduct);

router.get("/:id",getVendorProducts)

// // // PUT route to update an existing fragrance (with image upload)
router.put('/:id/manipulate/:vendorProductId', updateVendorProduct);

// // // DELETE route to delete a fragrance by ID
router.delete('/:id/manipulate/:vendorProductId', deleteVendorProduct);

router.get('/:userId/:productId', getVendorProductById);




export default router;
