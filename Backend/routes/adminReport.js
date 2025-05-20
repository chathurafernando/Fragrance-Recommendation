import express from "express";
import { adminOverviewReport, brandPerformanceReport, marketingPerformanceReport, priceAnalysisReport, productAvailabilityReport, productHitCountsReport, userDemographicsReport, vendorPerformanceReport, vendorVerificationReport, wishlistAnalyticsReport } from "../controllers/adminReports.js";

const router = express.Router();

router.get('/admin/overview', adminOverviewReport);
router.get('/admin/vendors', vendorPerformanceReport);
router.get('/admin/users', userDemographicsReport);
router.get('/admin/wishlist', wishlistAnalyticsReport);
router.get('/admin/availability', productAvailabilityReport);
router.get('/admin/marketing', marketingPerformanceReport);
router.get('/admin/brands/:id', brandPerformanceReport);
router.get('/admin/pricing', priceAnalysisReport);
router.get('/admin/verification', vendorVerificationReport);
router.get('/admin/product-hit-counts', productHitCountsReport);

export default router;
