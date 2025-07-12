const express = require("express");
const SearchController = require("../controllers/searchController");

const router = express.Router();

// Get all available platforms and their categories
router.get("/platforms", SearchController.getPlatforms);

// Get categories for a specific platform
router.get("/platforms/:platform/categories", SearchController.getCategories);

// Main search endpoint (now with OCR support)
router.post("/search", SearchController.search);

// Enhance existing results with OCR
router.post("/enhance-existing", SearchController.enhanceExisting);

// Check OCR service status
router.get("/ocr-status", SearchController.checkOCRStatus);

// Test direct URL scraping
router.post("/test-direct", SearchController.testDirect);

module.exports = router;
