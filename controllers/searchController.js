const ScraperFactory = require("../services/scraperFactory");
const OCRIntegrationService = require("../services/ocrIntegrationService");
const fs = require("fs").promises;
const path = require("path");

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

	// Enhanced search endpoint with OCR integration
	static async search(req, res) {
		const {
			platform,
			category,
			keyword,
			language,
			enableOCR = true,
		} = req.body;

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
				}", Keyword="${keyword}", Language="${
					language || "en"
				}", OCR="${enableOCR}"`
			);

			// Get appropriate scraper
			const normalizedPlatform = platform.toLowerCase();
			const scraper = ScraperFactory.getScraper(normalizedPlatform);

			// Perform scraping with OCR enhancement
			const options = {
				language: language || "en",
				enableOCR: enableOCR,
			};

			let results;
			if (enableOCR) {
				console.log("🤖 Using OCR-enhanced scraping");
				results = await scraper.scrapeWithOCR(
					category || "all",
					keyword || "",
					options
				);
			} else {
				console.log("📝 Using standard scraping (OCR disabled)");
				results = await scraper.scrape(
					category || "all",
					keyword || "",
					options
				);
			}

			console.log(`🎉 Search completed: ${results.length} results found`);

			if (!results || results.length === 0) {
				return res.json({
					success: true,
					platform,
					category: category || "all",
					keyword,
					count: 0,
					results: [],
					message: "No projects found",
				});
			}

			// Save enhanced results
			let output, filepath;
			if (enableOCR) {
				const saveResult = await scraper.saveEnhancedResults(
					results,
					platform,
					category || "all",
					keyword || "category"
				);
				output = saveResult.output;
				filepath = saveResult.filepath;
			} else {
				// Standard save for non-OCR results
				const sanitizedKeyword =
					(keyword || "").replace(/[^\w\s-]/gi, "").replace(/\s+/g, "_") ||
					"category";
				const fileName = `${platform}_${
					category || "all"
				}_${sanitizedKeyword}_results.json`;
				filepath = path.join(__dirname, "../results", fileName);

				// Ensure results directory exists
				await fs.mkdir(path.join(__dirname, "../results"), { recursive: true });

				output = {
					success: true,
					platform: platform,
					category: category || "all",
					keyword: keyword,
					count: results.length,
					file: fileName,
					generated_at: new Date().toISOString(),
					results: results,
				};

				await fs.writeFile(filepath, JSON.stringify(output, null, 2));
			}

			res.json(output);
		} catch (error) {
			console.error("Search error:", error);
			res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	}

	// New endpoint for OCR-only enhancement of existing results
	static async enhanceExisting(req, res) {
		try {
			const { filePath } = req.body;

			if (!filePath) {
				return res.status(400).json({
					success: false,
					error: "File path is required",
				});
			}

			console.log(`🔄 Enhancing existing results from: ${filePath}`);

			// Read existing results
			const fullPath = path.join(__dirname, "../", filePath);
			const existingData = JSON.parse(await fs.readFile(fullPath, "utf8"));

			if (!existingData.results || existingData.results.length === 0) {
				return res.status(400).json({
					success: false,
					error: "No results found in the specified file",
				});
			}

			const scraper = ScraperFactory.getScraper(
				existingData.platform.toLowerCase()
			);

			// Re-process with OCR
			const enhancedResults = [];
			console.log(
				`🤖 Processing ${existingData.results.length} projects with OCR`
			);

			for (let i = 0; i < existingData.results.length; i++) {
				const project = existingData.results[i];
				console.log(
					`Processing ${i + 1}/${existingData.results.length}: ${project.title}`
				);

				try {
					const enhanced = await scraper.ocrService.processProject(
						project,
						scraper.page
					);
					enhancedResults.push(enhanced);
				} catch (error) {
					console.error(
						`Error processing project ${project.title}:`,
						error.message
					);
					enhancedResults.push({
						...project,
						ocr_enhanced: false,
						ocr_error: error.message,
					});
				}

				// Small delay between projects
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Save enhanced results
			const { output } = await scraper.saveEnhancedResults(
				enhancedResults,
				existingData.platform,
				existingData.category,
				existingData.keyword || "enhanced"
			);

			res.json(output);
		} catch (error) {
			console.error("Enhancement error:", error);
			res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	}

	// Check OCR service status
	static async checkOCRStatus(req, res) {
		try {
			const ocrService = new OCRIntegrationService();
			const status = await ocrService.checkOCRServiceStatus();

			res.json({
				success: true,
				ocr_service: status,
			});
		} catch (error) {
			res.json({
				success: false,
				ocr_service: { status: "error", error: error.message },
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
