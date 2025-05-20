// import express from "express";
// import authRoutes from "./routes/auth.js";
// import postRoutes from "./routes/posts.js";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import adminRoutes from "./routes/admin.js";
// import noteRoutes from "./routes/notes.js"
// import fragranceRoutes from "./routes/fragrance.js"
// import brandRoutes from "./routes/brands.js"
// import vendorRoutes from "./routes/vendor.js"
// import userRoutes  from "./routes/user.js"
// import registerBusiness from "./routes/registerBusiness.js"
// import productRoutes from "./routes/product.js"
// import userFavouriteNotes from "./routes/userFavoriteNotes.js"
// import userPersonalTaste from "./routes/userPersonalTaste.js"
// import userRecommendation from "./routes/userRecommendation.js"
// import userWishlist from "./routes/wishlist.js"
// import fragranceLogic from "./routes/fragranceLogic.js"
// import compareFragrances from "./routes/compareFragrances.js"
// import filteredFragrances from "./routes/getFilteredFragrances.js"
// import advertisement from "./routes/Advertisement.js"
// import payment from "./routes/payment.js"
// import offers from "./routes/offer.js"
// import adminReports    from './routes/adminReport.js';


// // Load environment variables from .env file
// dotenv.config();

// const app = express();
// // app.use(cors());


// app.use(express.json());
// app.use(cookieParser());

// app.use("/api/posts", postRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/notes", noteRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/fragrance",fragranceRoutes)
// app.use("/api/products",productRoutes)
// app.use("/api/users", userRoutes);
// app.use("/api/brands",brandRoutes)
// app.use("/api/vendors",vendorRoutes)
// app.use("/api/business",registerBusiness)
// app.use("/api/favourite",userFavouriteNotes)
// app.use("/api/taste",userPersonalTaste)
// app.use("/api/recommend",userRecommendation)
// app.use("/api/wishlist",userWishlist)
// app.use("/api/associated-vendors",fragranceLogic)
// app.use("/api/fragrances",compareFragrances)
// app.use("/api/fragrances",filteredFragrances)
// app.use("/api/advertisement",advertisement)
// app.use("/api/payment",payment)
// app.use("/api/offers",offers)
// app.use("/api/reports",adminReports)

// // Use the port from the environment variable, default to 8803 if not set
// const PORT = process.env.PORT || 8803;

// app.listen(PORT, () => {
//     console.log(`Connected to Backend on port ${PORT}!`);
// });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Route imports
import authRoutes from "./routes/auth.js";
// import postRoutes from "./routes/posts.js";
import adminRoutes from "./routes/admin.js";
import noteRoutes from "./routes/notes.js";
import fragranceRoutes from "./routes/fragrance.js";
import brandRoutes from "./routes/brands.js";
import vendorRoutes from "./routes/vendor.js";
import userRoutes from "./routes/user.js";
import registerBusiness from "./routes/registerBusiness.js";
import productRoutes from "./routes/product.js";
import userFavouriteNotes from "./routes/userFavoriteNotes.js";
import userPersonalTaste from "./routes/userPersonalTaste.js";
import userRecommendation from "./routes/userRecommendation.js";
import userWishlist from "./routes/wishlist.js";
import fragranceLogic from "./routes/fragranceLogic.js";
import compareFragrances from "./routes/compareFragrances.js";
import filteredFragrances from "./routes/getFilteredFragrances.js";
import advertisement from "./routes/Advertisement.js";
import payment from "./routes/payment.js";
import offers from "./routes/offer.js";
import adminReports from "./routes/adminReport.js";
import fragranceClicks from "./routes/fragranceClicks.js"

// Load environment variables from .env file
dotenv.config();

const app = express();

// ✅ Enable CORS for development (frontend on localhost:3000 or Ngrok)
// app.use(cors());

// Or more secure setup (allow only your frontend)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
// app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fragrance", fragranceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/business", registerBusiness);
app.use("/api/favourite", userFavouriteNotes);
app.use("/api/taste", userPersonalTaste);
app.use("/api/recommend", userRecommendation);
app.use("/api/wishlist", userWishlist);
app.use("/api/associated-vendors", fragranceLogic);
app.use("/api/fragrances", compareFragrances);
app.use("/api/fragrances", filteredFragrances);
app.use("/api/advertisement", advertisement);
app.use("/api/payment", payment);
app.use("/api/offers", offers);
app.use("/api/reports", adminReports);
app.use("/api/hitcount", fragranceClicks);

// Start server
const PORT = process.env.PORT || 8803;
app.listen(PORT, () => {
  console.log(`Connected to Backend on port ${PORT}!`);
});
