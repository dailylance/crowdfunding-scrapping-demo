const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class AutomationTestSuite {
	constructor() {
		this.scraperUrl = "http://localhost:3001";
		this.ocrUrl = "http://localhost:5000";
		this.testResults = [];
	}

	async runAllTests() {
		console.log("🧪 Starting Automation Pipeline Tests...\n");

		try {
			await this.testOCRService();
			await this.testScraperService();
			await this.testOCRIntegration();
			await this.testEnhancedSearch();

			this.printTestSummary();
		} catch (error) {
			console.error("❌ Test suite failed:", error.message);
		}
	}

	async testOCRService() {
		console.log("📊 Testing OCR Service...");

		try {
			const response = await axios.get(`${this.ocrUrl}/v1/health`, {
				timeout: 10000,
			});
			this.logTest("OCR Health Check", true, "Service is running");
			console.log("✅ OCR Service: Connected");
		} catch (error) {
			this.logTest("OCR Health Check", false, error.message);
			console.log("❌ OCR Service: Not accessible");
		}
	}

	async testScraperService() {
		console.log("🔍 Testing Scraper Service...");

		try {
			const response = await axios.get(`${this.scraperUrl}/api/platforms`, {
				timeout: 10000,
			});
			const platforms = response.data.platforms;

			if (platforms && platforms.length > 0) {
				this.logTest(
					"Scraper Platforms",
					true,
					`Found ${platforms.length} platforms`
				);
				console.log(`✅ Scraper Service: Found ${platforms.length} platforms`);
			} else {
				this.logTest("Scraper Platforms", false, "No platforms found");
				console.log("❌ Scraper Service: No platforms available");
			}
		} catch (error) {
			this.logTest("Scraper Platforms", false, error.message);
			console.log("❌ Scraper Service: Not accessible");
		}
	}

	async testOCRIntegration() {
		console.log("🤖 Testing OCR Integration...");

		try {
			const response = await axios.get(`${this.scraperUrl}/api/ocr-status`, {
				timeout: 10000,
			});

			if (
				response.data.success &&
				response.data.ocr_service.status === "connected"
			) {
				this.logTest(
					"OCR Integration",
					true,
					"OCR service integrated successfully"
				);
				console.log("✅ OCR Integration: Connected and ready");
			} else {
				this.logTest("OCR Integration", false, "OCR service not connected");
				console.log("❌ OCR Integration: Service not connected");
			}
		} catch (error) {
			this.logTest("OCR Integration", false, error.message);
			console.log("❌ OCR Integration: Test failed");
		}
	}

	async testEnhancedSearch() {
		console.log("🔎 Testing Enhanced Search (Quick Test)...");

		try {
			// Test search with a platform that should have quick results
			const searchPayload = {
				platform: "indiegogo",
				category: "technology",
				keyword: "smartwatch",
				enableOCR: false, // Disable OCR for quick test
			};

			console.log("⏱️ Running quick search (OCR disabled for speed)...");
			const response = await axios.post(
				`${this.scraperUrl}/api/search`,
				searchPayload,
				{ timeout: 60000 } // 1 minute timeout for search
			);

			if (response.data.success && response.data.count > 0) {
				this.logTest(
					"Enhanced Search",
					true,
					`Found ${response.data.count} results`
				);
				console.log(`✅ Enhanced Search: Found ${response.data.count} results`);
				console.log(`📁 Results saved to: ${response.data.file}`);
			} else {
				this.logTest("Enhanced Search", false, "No results found");
				console.log(
					"⚠️ Enhanced Search: No results found (this may be normal)"
				);
			}
		} catch (error) {
			this.logTest("Enhanced Search", false, error.message);
			console.log("❌ Enhanced Search: Test failed -", error.message);
		}
	}

	logTest(testName, passed, details) {
		this.testResults.push({
			test: testName,
			passed: passed,
			details: details,
			timestamp: new Date().toISOString(),
		});
	}

	printTestSummary() {
		console.log("\n📋 Test Summary:");
		console.log("================");

		const passedTests = this.testResults.filter((t) => t.passed).length;
		const totalTests = this.testResults.length;

		this.testResults.forEach((result) => {
			const status = result.passed ? "✅" : "❌";
			console.log(`${status} ${result.test}: ${result.details}`);
		});

		console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

		if (passedTests === totalTests) {
			console.log(
				"🎉 All tests passed! The automation pipeline is ready to use."
			);
		} else {
			console.log(
				"⚠️ Some tests failed. Please check the services and try again."
			);
		}
	}
}

// Usage example
async function runAutomationTest() {
	const testSuite = new AutomationTestSuite();
	await testSuite.runAllTests();
}

// Export for use in other files
module.exports = { AutomationTestSuite, runAutomationTest };

// Run tests if this file is executed directly
if (require.main === module) {
	runAutomationTest().catch(console.error);
}
