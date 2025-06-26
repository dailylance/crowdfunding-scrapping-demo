const express = require("express");
const SearchController = require("../controllers/searchController");

const router = express.Router();

// Get all available platforms and their categories
router.get("/platforms", SearchController.getPlatforms);

// Get categories for a specific platform
router.get("/platforms/:platform/categories", SearchController.getCategories);

// Main search endpoint
router.post("/search", SearchController.search);

// Test direct URL scraping
router.post("/test-direct", SearchController.testDirect);

module.exports = router;
