import VendorProduct from "../models/vendorProducts.js";
import Product from "../models/products.js";
import User from "../models/user.js";
import Brand from "../models/brand.js";
import Fragrance from "../models/fragrance.js";
import { BusinessInfo } from "../models/BusinessInfo.js";

export const addVendorProduct = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors are allowed to add products." });
    }

    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company) {
      return res.status(404).json({ error: "Company (Business Info) not found for this vendor." });
    }

    // ✅ Check if company is verified
    if (company.verification !== 'verified') {
      return res.status(403).json({ error: "Company is not verified. Only verified vendors can add products." });
    }

    const { brandId, fragranceId, warranty, availability, purchaseLink, price } = req.body;

    if (!brandId || !fragranceId || !warranty || !availability || !purchaseLink || !price) {
      return res.status(400).json({ error: 'All fields are required: brandId, fragranceId, warranty, availability, purchaseLink, price.' });
    }

    const validWarranties = ['3months', '6months', '1year', '2years'];
    if (!validWarranties.includes(warranty)) {
      return res.status(400).json({ error: 'Invalid warranty value. Choose from 3months, 6months, 1year, 2years.' });
    }

    const validAvailabilities = ['In stock', 'Out of stock'];
    if (!validAvailabilities.includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability value. Choose from In stock or Out of stock.' });
    }

    // ✅ Find the product based on brandId and fragranceId
    const existingProduct = await Product.findOne({
      where: { brand_id: brandId, fragrance_id: fragranceId }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product with the given brand and fragrance not found. Please contact admin to create it.' });
    }

    // ✅ Create vendor product using the found product_id
    const vendorProduct = await VendorProduct.create({
      company_id: company.id,
      product_id: existingProduct.id,
      warranty,
      availability,
      purchaseLink,
      price,
    });

    res.json({
      message: 'Vendor product added successfully.',
      vendorProduct,
    });

  } catch (err) {
    console.error('Error adding vendor product:', err);
    res.status(500).json({ error: 'An error occurred while adding the vendor product.' });
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // 1. Check user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors can view their products." });
    }

    // 2. Find business info (company)
    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company) {
      return res.status(404).json({ error: "Company (Business Info) not found for this vendor." });
    }

    // 3. Get vendor's products
    const vendorProducts = await VendorProduct.findAll({
      where: { company_id: company.id },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            { model: Brand,as:'brand', attributes: ['id', 'name'] },
            { model: Fragrance,as:'fragrance', attributes: ['id', 'name', 'description', 'image'] },
          ]
        }
      ],
    });

    // 4. Format & send response
    const formatted = vendorProducts.map((vp) => ({
      id: vp.id,
      warranty: vp.warranty,
      availability: vp.availability,
      purchaseLink: vp.purchaseLink,
      price: vp.price,
      brand: vp.product?.brand,
      fragrance: vp.product?.fragrance,
      
    }));

    res.json(formatted);

  } catch (err) {
    console.error('Error fetching vendor products:', err);
    res.status(500).json({ error: 'An error occurred while fetching vendor products.' });
  }
};

export const updateVendorProduct = async (req, res) => {
  try {
    const userId = req.params.id;
    const vendorProductId = req.params.vendorProductId;

    if (!userId || !vendorProductId) {
      return res.status(400).json({ error: "User ID and Vendor Product ID are required." });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors are allowed to update products." });
    }

    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company || company.verification !== 'verified') {
      return res.status(403).json({ error: "Only verified vendors can update products." });
    }

    const vendorProduct = await VendorProduct.findOne({
      where: { id: vendorProductId, company_id: company.id }
    });

    if (!vendorProduct) {
      return res.status(404).json({ error: "Vendor product not found or does not belong to your company." });
    }

    const { warranty, availability, purchaseLink, price } = req.body;

    if (!warranty || !availability || !purchaseLink || !price) {
      return res.status(400).json({ error: 'All fields are required: warranty, availability, purchaseLink, price.' });
    }

    const validWarranties = ['3months', '6months', '1year', '2years'];
    const validAvailabilities = ['In stock', 'Out of stock'];

    if (!validWarranties.includes(warranty)) {
      return res.status(400).json({ error: 'Invalid warranty value. Choose from 3months, 6months, 1year, 2years.' });
    }

    if (!validAvailabilities.includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability value. Choose from In stock or Out of stock.' });
    }

    await vendorProduct.update({
      warranty,
      availability,
      purchaseLink,
      price,
    });

    res.json({
      message: "Vendor product updated successfully.",
      vendorProduct,
    });

  } catch (err) {
    console.error("Error updating vendor product:", err);
    res.status(500).json({ error: "An error occurred while updating the vendor product." });
  }
};

export const deleteVendorProduct = async (req, res) => {
  try {
    const userId = req.params.id;
    const vendorProductId = req.params.vendorProductId;

    if (!userId || !vendorProductId) {
      return res.status(400).json({ error: "User ID and Vendor Product ID are required." });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors are allowed to delete products." });
    }

    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company || company.verification !== 'verified') {
      return res.status(403).json({ error: "Only verified vendors can delete products." });
    }

    const vendorProduct = await VendorProduct.findOne({
      where: { id: vendorProductId, company_id: company.id }
    });

    if (!vendorProduct) {
      return res.status(404).json({ error: "Vendor product not found or does not belong to your company." });
    }

    await vendorProduct.destroy();

    res.json({ message: "Vendor product deleted successfully." });

  } catch (err) {
    console.error("Error deleting vendor product:", err);
    res.status(500).json({ error: "An error occurred while deleting the vendor product." });
  }
};

export const getVendorProductById = async (req, res) => {
  try {
    const userId = req.params.userId; // Vendor user ID
    const productId = req.params.productId; // VendorProduct ID

    if (!userId || !productId) {
      return res.status(400).json({ error: "User ID and Product ID are required." });
    }

    // 1. Check user exists and is vendor
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== 'vendor') {
      return res.status(403).json({ error: "Only vendors can view their products." });
    }

    // 2. Get company of vendor
    const company = await BusinessInfo.findOne({ where: { uid: userId } });
    if (!company) {
      return res.status(404).json({ error: "Company not found for this vendor." });
    }

    // 3. Find vendor product by company_id and product ID
    const vendorProduct = await VendorProduct.findOne({
      where: {
        id: productId,
        company_id: company.id,
      },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            { model: Brand, as: 'brand', attributes: ['id', 'name'] },
            { model: Fragrance, as: 'fragrance', attributes: ['id', 'name', 'description', 'image'] },
          ]
        }
      ],
    });

    if (!vendorProduct) {
      return res.status(404).json({ error: "Product not found for this vendor." });
    }

    // 4. Format and send response
    const formatted = {
      id: vendorProduct.id,
      warranty: vendorProduct.warranty,
      availability: vendorProduct.availability,
      purchaseLink: vendorProduct.purchaseLink,
      price: vendorProduct.price,
      brand: vendorProduct.product?.brand,
      fragrance: vendorProduct.product?.fragrance,
    };

    res.json({ vendorProduct: formatted });

  } catch (err) {
    console.error('Error fetching vendor product by ID:', err);
    res.status(500).json({ error: 'An error occurred while fetching vendor product details.' });
  }
};
