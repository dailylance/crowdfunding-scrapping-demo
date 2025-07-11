const ScraperFactory = require("../services/scraperFactory");
const fs = require("fs");

class SearchController {
	// Get available platforms and their categories
	static async getPlatforms(req, res) {
		try {
			const platforms = ScraperFactory.getAvailablePlatforms();
			const platformsWithCategories = platforms.map((platform) => ({
				...platform,
				categories: ScraperFactory.getPlatformCategories(platform.name),
			}));

			res.json({
				success: true,
				platforms: platformsWithCategories,
			});
		} catch (error) {
			console.error("Error getting platforms:", error);
			res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	}

	// Main search endpoint
	static async search(req, res) {
		const { platform, category, keyword, language } = req.body;

		// Validation - platform is required, but keyword can be empty if category is provided
		if (!platform) {
			return res.status(400).json({
				success: false,
				error: "Platform is required",
			});
		}

		// If no keyword and no category, return error
		if (!keyword && !category) {
			return res.status(400).json({
				success: false,
				error: "Either keyword or category is required",
			});
		}

		try {
			console.log(
				`🔍 Search request: Platform="${platform}", Category="${
					category || "all"
				}", Keyword="${keyword}", Language="${language || "en"}"`
			);

			// Get appropriate scraper
			const normalizedPlatform = platform.toLowerCase();
			const scraper = ScraperFactory.getScraper(normalizedPlatform);

			// Perform scraping with language option
			const options = { language: language || "en" };
			const results = await scraper.scrape(
				category || "all",
				keyword || "",
				options
			);

			console.log(`🎉 Search completed: ${results.length} results found`);

			// Save results to file
			const sanitizedKeyword =
				(keyword || "").replace(/[^\w\s-]/gi, "").replace(/\s+/g, "_") ||
				"category";
			const fileName = `${platform}_${
				category || "all"
			}_${sanitizedKeyword}_results.json`;
			const filePath = `results/${fileName}`;

			// Ensure results directory exists
			fs.mkdirSync("results", { recursive: true });
			fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

			res.json({
				success: true,
				platform: platform,
				category: category || "all",
				keyword: keyword,
				count: results.length,
				file: filePath,
				results: results,
			});
		} catch (error) {
			console.error("Search error:", error);
			res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	}

	// Get specific platform categories
	static async getCategories(req, res) {
		const { platform } = req.params;

		try {
			const categories = ScraperFactory.getPlatformCategories(platform);
			res.json({
				success: true,
				platform: platform,
				categories: categories,
			});
		} catch (error) {
			console.error("Error getting categories:", error);
			res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	}

	// Test individual URL scraping
	static async testDirect(req, res) {
		const { platform, url } = req.body;

		if (!platform || !url) {
			return res.status(400).json({
				success: false,
				error: "Platform and URL are required",
			});
		}

		try {
			const scraper = ScraperFactory.getScraper(platform);

			// For now, this would need platform-specific implementation
			// This is a placeholder
			res.json({
				success: true,
				message: "Direct URL testing not yet implemented for this platform",
				platform: platform,
				url: url,
			});
		} catch (error) {
			console.error("Direct test error:", error);
			res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	}
}

module.exports = SearchController;
