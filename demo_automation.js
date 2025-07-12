const axios = require("axios");
const fs = require("fs").promises;

class AutomationDemo {
	constructor() {
		this.baseUrl = "http://localhost:3001/api";
		this.platforms = [
			{ name: "indiegogo", categories: ["technology", "design"] },
			{ name: "kickstarter", categories: ["technology", "games"] },
			{ name: "makuake", categories: ["product"] },
		];
		this.keywords = ["smartwatch", "headphones", "gaming", "camera"];
	}

	async demonstrateAutomation() {
		console.log("🎯 Crowdfunding Automation Pipeline Demo");
		console.log("=========================================\n");

		try {
			// Check system status
			await this.checkSystemStatus();

			// Run demonstration searches
			await this.runDemoSearches();

			// Show enhancement comparison
			await this.demonstrateEnhancement();

			console.log("\n🎉 Demo completed successfully!");
		} catch (error) {
			console.error("❌ Demo failed:", error.message);
		}
	}

	async checkSystemStatus() {
		console.log("🔧 Checking System Status...\n");

		try {
			// Check scraper service
			const platformsResponse = await axios.get(`${this.baseUrl}/platforms`);
			console.log(
				`✅ Scraper Service: ${platformsResponse.data.platforms.length} platforms available`
			);

			// Check OCR service
			const ocrResponse = await axios.get(`${this.baseUrl}/ocr-status`);
			if (
				ocrResponse.data.success &&
				ocrResponse.data.ocr_service.status === "connected"
			) {
				console.log("✅ OCR Service: Connected and ready");
			} else {
				console.log(
					"⚠️ OCR Service: Not available (will run without enhancement)"
				);
			}
		} catch (error) {
			throw new Error(`System check failed: ${error.message}`);
		}

		console.log("");
	}

	async runDemoSearches() {
		console.log("🔍 Running Demo Searches...\n");

		const demoSearches = [
			{
				platform: "indiegogo",
				category: "technology",
				keyword: "smartwatch",
				description: "Technology products on Indiegogo",
			},
			{
				platform: "kickstarter",
				keyword: "gaming",
				description: "Gaming projects on Kickstarter",
			},
		];

		for (const search of demoSearches) {
			await this.runSingleSearch(search);
			await this.delay(5000); // 5 second delay between searches
		}
	}

	async runSingleSearch(searchConfig) {
		console.log(`📊 Searching: ${searchConfig.description}`);
		console.log(`   Platform: ${searchConfig.platform}`);
		console.log(`   Category: ${searchConfig.category || "All"}`);
		console.log(`   Keyword: ${searchConfig.keyword}`);

		try {
			const payload = {
				platform: searchConfig.platform,
				keyword: searchConfig.keyword,
				enableOCR: true, // Enable OCR for demonstration
			};

			if (searchConfig.category) {
				payload.category = searchConfig.category;
			}

			console.log("   Status: Searching...");
			const startTime = Date.now();

			const response = await axios.post(`${this.baseUrl}/search`, payload, {
				timeout: 120000, // 2 minutes timeout
			});

			const duration = ((Date.now() - startTime) / 1000).toFixed(1);

			if (response.data.success) {
				const data = response.data;
				console.log(
					`   ✅ Results: ${data.count} projects found in ${duration}s`
				);
				console.log(
					`   📈 Enhanced: ${data.enhanced_count || 0}/${
						data.count
					} projects (${data.enhancement_rate || "0%"})`
				);
				console.log(`   📁 File: ${data.file}`);

				// Show sample result
				if (data.results && data.results.length > 0) {
					const sample = data.results[0];
					console.log(`   🎯 Sample: "${sample.title}"`);
					if (sample.ocr_enhanced) {
						console.log(
							`      🤖 OCR Enhanced: ${
								Object.keys(sample.confidence_scores || {}).length
							} fields improved`
						);
					}
				}
			} else {
				console.log(`   ❌ Search failed: ${response.data.error}`);
			}
		} catch (error) {
			console.log(`   ❌ Error: ${error.message}`);
		}

		console.log("");
	}

	async demonstrateEnhancement() {
		console.log("🤖 OCR Enhancement Demonstration...\n");

		try {
			// Find the most recent result file
			const files = await fs.readdir("./results");
			const enhancedFiles = files.filter(
				(f) => f.includes("enhanced") && f.endsWith(".json")
			);

			if (enhancedFiles.length === 0) {
				console.log("⚠️ No enhanced results found to demonstrate");
				return;
			}

			// Read the most recent enhanced file
			const latestFile = enhancedFiles.sort().pop();
			const filePath = `./results/${latestFile}`;
			const data = JSON.parse(await fs.readFile(filePath, "utf8"));

			console.log(`📊 Analyzing: ${latestFile}`);
			console.log(`Total Projects: ${data.count}`);
			console.log(`OCR Enhanced: ${data.enhanced_count}`);
			console.log(`Enhancement Rate: ${data.enhancement_rate}\n`);

			// Show enhancement examples
			const enhancedProjects = data.results.filter((r) => r.ocr_enhanced);

			if (enhancedProjects.length > 0) {
				console.log("🎯 Enhancement Examples:\n");

				enhancedProjects.slice(0, 3).forEach((project, index) => {
					console.log(`${index + 1}. "${project.title}"`);

					if (project.confidence_scores) {
						Object.entries(project.confidence_scores).forEach(
							([field, confidence]) => {
								console.log(
									`   📈 ${field}: confidence ${(confidence * 100).toFixed(0)}%`
								);
							}
						);
					}

					if (project.images_processed) {
						console.log(`   🖼️ Processed ${project.images_processed} images`);
					}

					console.log("");
				});
			}
		} catch (error) {
			console.log(`❌ Enhancement demo failed: ${error.message}`);
		}
	}

	async delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Run demo if this file is executed directly
async function runDemo() {
	const demo = new AutomationDemo();
	await demo.demonstrateAutomation();
}

module.exports = { AutomationDemo, runDemo };

if (require.main === module) {
	runDemo().catch(console.error);
}
