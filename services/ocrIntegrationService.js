const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class OCRIntegrationService {
	constructor(ocrServiceUrl = "http://localhost:5000") {
		this.ocrServiceUrl = ocrServiceUrl;
		this.requiredFields = [
			"project_owner",
			"owner_website",
			"owner_sns",
			"contact_info",
			"achievement_rate",
			"supporters",
			"amount",
			"support_amount",
			"crowdfund_start_date",
			"crowdfund_end_date",
			"title",
		];
		this.testMode = true; // Force OCR for testing
	}

	// Check if OCR enhancement is needed
	needsOCREnhancement(projectData) {
		const missingFields = this.requiredFields.filter((field) => {
			const value = projectData[field];
			return (
				!value ||
				value === "" ||
				value === "Unknown" ||
				value === "-" ||
				value === "N/A" ||
				value === null ||
				value === undefined ||
				(typeof value === "string" && value.trim().length === 0)
			);
		});

		console.log(`\n🔍 === OCR ENHANCEMENT CHECK ===`);
		console.log(`📝 Project: "${projectData.title || "Unknown"}"`);
		console.log(`📊 Missing fields: [${missingFields.join(", ")}]`);
		console.log(
			`🔧 Test Mode: ${
				this.testMode ? "ENABLED - OCR will ALWAYS run" : "DISABLED"
			}`
		);

		// Show current field values for debugging
		console.log(`📋 Current field values:`);
		this.requiredFields.forEach((field) => {
			const value = projectData[field];
			const isEmpty =
				!value ||
				value === "" ||
				value === "Unknown" ||
				value === "-" ||
				value === "N/A" ||
				value === null ||
				value === undefined ||
				(typeof value === "string" && value.trim().length === 0);
			console.log(
				`   ${field}: "${value}" ${isEmpty ? "❌ MISSING" : "✅ HAS VALUE"}`
			);
		});

		// In test mode, ALWAYS run OCR to demonstrate functionality
		if (this.testMode) {
			console.log(
				`🚀 TEST MODE: Forcing OCR enhancement regardless of missing fields`
			);
			return true;
		}

		// Normal mode: only run OCR if we have missing fields
		const needsOCR = missingFields.length > 0;
		console.log(
			`🤖 OCR needed: ${needsOCR} (${missingFields.length} missing fields)`
		);
		console.log(`================================\n`);

		return needsOCR;
	}

	// Extract all images from project page with improved error handling
	async extractAllImages(page, projectUrl, projectData = {}) {
		let newPage = null;

		try {
			console.log(`\n🖼️ === IMAGE EXTRACTION STARTED ===`);
			console.log(`🌐 URL: ${projectUrl}`);

			// Start with the main project image if available
			const projectImages = [];
			if (projectData.image_url || projectData.image) {
				const mainImageUrl = projectData.image_url || projectData.image;
				if (mainImageUrl && mainImageUrl.startsWith("http")) {
					projectImages.push({
						url: mainImageUrl,
						alt: "Main project image",
						width: 800,
						height: 600,
						source: "project_data",
					});
					console.log(
						`✅ Main project image added: ${mainImageUrl.substring(0, 80)}...`
					);
				}
			} else {
				console.log(`⚠️ No main project image found in projectData`);
			}

			console.log(`🔄 Creating new page for image extraction...`);

			// Create a new page with better error handling
			try {
				newPage = await page.browser().newPage();

				// Set shorter timeouts and better configuration
				await newPage.setUserAgent(
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
				);
				await newPage.setViewport({ width: 1280, height: 720 });
				await newPage.setDefaultTimeout(15000);
				await newPage.setDefaultNavigationTimeout(15000);

				// Enable error handling for navigation
				newPage.on("error", (error) => {
					console.log(
						`⚠️ Page error during image extraction: ${error.message}`
					);
				});

				newPage.on("pageerror", (error) => {
					console.log(`⚠️ Page script error: ${error.message}`);
				});

				console.log(`⏳ Navigating to project page with timeout protection...`);

				// Try navigation with multiple fallback strategies
				let navigationSuccess = false;
				const navigationStrategies = [
					{ waitUntil: "domcontentloaded", timeout: 15000 },
					{ waitUntil: "networkidle2", timeout: 10000 },
					{ waitUntil: "load", timeout: 8000 },
				];

				for (const strategy of navigationStrategies) {
					try {
						await newPage.goto(projectUrl, strategy);
						navigationSuccess = true;
						console.log(
							`✅ Navigation successful with strategy: ${strategy.waitUntil}`
						);
						break;
					} catch (navError) {
						console.log(
							`⚠️ Navigation failed with ${strategy.waitUntil}: ${navError.message}`
						);
						continue;
					}
				}

				if (!navigationSuccess) {
					throw new Error("All navigation strategies failed");
				}

				// Wait for page to stabilize with timeout protection
				console.log(`⏳ Waiting for page to stabilize...`);
				await newPage.waitForTimeout(2000);

				// Scroll to load lazy images with error protection
				console.log(`📜 Scrolling to load lazy images...`);
				try {
					await Promise.race([
						newPage.evaluate(async () => {
							return new Promise((resolve) => {
								let totalHeight = 0;
								const distance = 150;
								const maxHeight = 8000; // Reduced limit
								const timer = setInterval(() => {
									try {
										const scrollHeight = document.body.scrollHeight;
										window.scrollBy(0, distance);
										totalHeight += distance;

										if (
											totalHeight >= scrollHeight ||
											totalHeight > maxHeight
										) {
											clearInterval(timer);
											resolve();
										}
									} catch (error) {
										clearInterval(timer);
										resolve();
									}
								}, 100);
							});
						}),
						new Promise((resolve) => setTimeout(resolve, 8000)), // 8 second timeout
					]);
				} catch (scrollError) {
					console.log(
						`⚠️ Scrolling error (non-critical): ${scrollError.message}`
					);
				}

				// Wait for any lazy loaded images
				await newPage.waitForTimeout(1000);

				console.log(`🔍 Extracting images from page content...`);

				const pageImages = await Promise.race([
					newPage.evaluate(() => {
						const imageElements = document.querySelectorAll(
							'img, [style*="background-image"], .image, .photo, .picture, figure img, .gallery img, .slider img'
						);
						const images = [];
						let processedCount = 0;

						imageElements.forEach((element) => {
							try {
								let src = null;

								if (element.tagName === "IMG") {
									src =
										element.src ||
										element.getAttribute("data-src") ||
										element.getAttribute("data-lazy-src") ||
										element.getAttribute("data-original") ||
										element.getAttribute("data-lazy") ||
										element.getAttribute("data-zoom-image") ||
										element
											.getAttribute("srcset")
											?.split(",")[0]
											?.split(" ")[0];
								} else {
									// Extract background image URLs
									const style =
										element.style.backgroundImage ||
										getComputedStyle(element).backgroundImage;
									const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
									if (urlMatch) src = urlMatch[1];
								}

								processedCount++;

								if (
									src &&
									src.startsWith("http") &&
									!src.includes("avatar") &&
									!src.includes("profile") &&
									!src.includes("icon") &&
									!src.includes("logo") &&
									!src.includes("button") &&
									!src.includes("placeholder") &&
									!src.includes("spinner") &&
									!src.includes("loading") &&
									src.length > 25 // Reduced minimum URL length
								) {
									const img = element.tagName === "IMG" ? element : null;
									const rect = element.getBoundingClientRect();

									// More lenient size requirements
									const width = img
										? img.naturalWidth || img.width || rect.width || 0
										: rect.width || 0;
									const height = img
										? img.naturalHeight || img.height || rect.height || 0
										: rect.height || 0;

									if (width > 50 && height > 50) {
										// Reduced minimum size
										images.push({
											url: src,
											alt: img ? img.alt || "" : "",
											width: width,
											height: height,
											source: "page_content",
										});
									}
								}
							} catch (elementError) {
								// Skip problematic elements
							}
						});

						return { images, processedCount };
					}),
					new Promise((_, reject) =>
						setTimeout(
							() => reject(new Error("Image extraction timeout")),
							10000
						)
					),
				]);

				console.log(`📊 Page analysis results:`);
				console.log(`   - Elements processed: ${pageImages.processedCount}`);
				console.log(`   - Valid images found: ${pageImages.images.length}`);

				// Combine all images and remove duplicates
				const allImages = [...projectImages, ...pageImages.images];
				const uniqueImages = allImages.filter(
					(img, index, self) =>
						self.findIndex((i) => i.url === img.url) === index
				);

				console.log(`🎯 Final images for OCR (${uniqueImages.length}):`);
				uniqueImages.forEach((img, index) => {
					console.log(
						`   ${index + 1}. ${img.source}: ${img.url.substring(0, 60)}... (${
							img.width
						}x${img.height})`
					);
				});

				return uniqueImages;
			} catch (pageError) {
				console.log(
					`❌ Failed to extract images from ${projectUrl}: ${pageError.message}`
				);
				console.log(`🔄 FALLBACK: Using main project image only`);

				return projectImages.length > 0 ? projectImages : [];
			}
		} catch (error) {
			console.log(`💥 Critical error in image extraction: ${error.message}`);
			console.log(`🔄 FALLBACK: Using main project image only`);

			// Return main project image if available
			const fallbackImages = [];
			if (projectData.image_url || projectData.image) {
				const mainImageUrl = projectData.image_url || projectData.image;
				if (mainImageUrl && mainImageUrl.startsWith("http")) {
					fallbackImages.push({
						url: mainImageUrl,
						alt: "Main project image (fallback)",
						width: 800,
						height: 600,
						source: "fallback",
					});
				}
			}

			return fallbackImages;
		} finally {
			// Always clean up the new page
			if (newPage) {
				try {
					await newPage.close();
					console.log(`🔄 Temporary page closed successfully`);
				} catch (closeError) {
					console.log(`⚠️ Error closing temporary page: ${closeError.message}`);
				}
			}
		}
	}

	// Send data to OCR service
	async enhanceWithOCR(projectData, images) {
		try {
			const missingFields = this.requiredFields.filter((field) => {
				const value = projectData[field];
				return (
					!value ||
					value === "" ||
					value === "Unknown" ||
					value === "-" ||
					value === "N/A" ||
					value === null ||
					value === undefined ||
					(typeof value === "string" && value.trim().length === 0)
				);
			});

			const payload = {
				project_data: projectData,
				images: images,
				missing_fields: missingFields,
			};

			console.log(`\n🤖 === OCR SERVICE COMMUNICATION ===`);
			console.log(
				`📡 Sending data to OCR service: ${this.ocrServiceUrl}/v1/enhance-crowdfunding`
			);
			console.log(`📊 Project: "${projectData.title}"`);
			console.log(`🖼️ Images count: ${images.length}`);
			console.log(
				`📋 Missing fields (${missingFields.length}): [${missingFields.join(
					", "
				)}]`
			);

			console.log(`📦 Payload details:`);
			console.log(
				`   - Project data keys: [${Object.keys(projectData).join(", ")}]`
			);
			console.log(`   - Images being sent:`);
			images.forEach((img, index) => {
				console.log(
					`     ${index + 1}. ${img.source}: ${img.url.substring(0, 60)}...`
				);
			});

			console.log(`🚀 Making API call to OCR service...`);
			const startTime = Date.now();

			const response = await axios.post(
				`${this.ocrServiceUrl}/v1/enhance-crowdfunding`,
				payload,
				{
					timeout: 180000, // 3 minutes timeout for multiple images
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const duration = Date.now() - startTime;
			console.log(`✅ OCR service response received in ${duration}ms`);
			console.log(
				`📊 Enhancement result: ${
					response.data.success ? "SUCCESS ✅" : "FAILED ❌"
				}`
			);

			if (response.data.success) {
				console.log(`🎯 Processing summary:`);
				console.log(
					`   - Images processed: ${
						response.data.images_processed || images.length
					}`
				);
				console.log(
					`   - Fields enhanced: [${(response.data.fields_enhanced || []).join(
						", "
					)}]`
				);
				console.log(
					`   - Overall confidence: ${
						response.data.overall_confidence || "N/A"
					}`
				);

				if (response.data.enhanced_data) {
					console.log(`📝 Enhanced field values:`);
					Object.keys(response.data.confidence_scores || {}).forEach(
						(field) => {
							const oldValue = projectData[field] || "EMPTY";
							const newValue = response.data.enhanced_data[field] || "EMPTY";
							console.log(`   ${field}: "${oldValue}" → "${newValue}"`);
						}
					);
				}

				// The OCR service now returns both enhanced_data_english and enhanced_data_original
				// Use these directly for proper language separation
				return {
					...response.data,
					enhanced_data_english:
						response.data.enhanced_data_english || response.data.enhanced_data, // Use specific English version
					enhanced_data_original: response.data.enhanced_data_original || {
						...projectData,
						...response.data.enhanced_data,
					}, // Use specific original version
				};
			} else {
				console.log(
					`❌ Enhancement failed: ${response.data.error || "Unknown error"}`
				);
			}
			console.log(`=====================================\n`);

			return response.data;
		} catch (error) {
			console.error("❌ OCR enhancement failed:", error.message);
			if (error.response) {
				console.error("📄 Response status:", error.response.status);
				console.error(
					"📝 Response data:",
					JSON.stringify(error.response.data, null, 2)
				);
			}
			if (error.code === "ECONNREFUSED") {
				console.error(
					"🔌 Connection refused - Is the OCR service running on port 5000?"
				);
			}
			return {
				enhanced_data: projectData,
				enhanced_data_english: projectData,
				enhanced_data_original: projectData,
				confidence_scores: {},
				success: false,
				error: error.message,
			};
		}
	}

	// Process single project
	async processProject(projectData, page) {
		console.log(`\n� ===============================================`);
		console.log(`🚀 STARTING OCR PROCESSING FOR PROJECT`);
		console.log(`🚀 ===============================================`);
		console.log(`📝 Project: "${projectData.title}"`);
		console.log(`🌐 URL: ${projectData.url}`);
		console.log(`🏷️ Platform: ${projectData.platform || "Unknown"}`);

		if (!this.needsOCREnhancement(projectData)) {
			console.log(`⭕ Skipping OCR - Project has complete data`);
			console.log(`===============================================\n`);
			return { ...projectData, ocr_enhanced: false };
		}

		console.log(`✅ OCR enhancement required - proceeding...`);

		// Extract all images from project page (including main project image)
		const images = await this.extractAllImages(
			page,
			projectData.url,
			projectData
		);

		if (images.length === 0) {
			console.log(
				`💥 FATAL: No suitable images found for "${projectData.title}"`
			);
			console.log(`   - Cannot proceed with OCR without images`);
			console.log(`   - Returning original data with error flag`);
			console.log(`===============================================\n`);
			return {
				...projectData,
				ocr_enhanced: false,
				ocr_error: "No images found",
			};
		}

		console.log(`✅ SUCCESS: Found ${images.length} images for OCR processing`);

		// Enhance with OCR
		const ocrResult = await this.enhanceWithOCR(projectData, images);

		if (!ocrResult.success) {
			console.log(`💥 OCR ENHANCEMENT FAILED for "${projectData.title}"`);
			console.log(`❌ Error: ${ocrResult.error}`);
			console.log(`🔄 Returning original data with error details`);
			console.log(`===============================================\n`);
			return {
				...projectData,
				ocr_enhanced: false,
				ocr_error: ocrResult.error,
			};
		}

		console.log(`🎉 OCR ENHANCEMENT COMPLETED SUCCESSFULLY!`);
		console.log(
			`📊 Enhanced fields: [${Object.keys(
				ocrResult.confidence_scores || {}
			).join(", ")}]`
		);
		console.log(`🔢 Images processed: ${images.length}`);
		console.log(
			`⭐ Overall confidence: ${ocrResult.overall_confidence || "N/A"}`
		);

		const finalResult = {
			...ocrResult.enhanced_data,
			ocr_enhanced: true,
			confidence_scores: ocrResult.confidence_scores,
			images_processed: images.length,
			enhancement_timestamp: new Date().toISOString(),
			// Include both English and original data for separate file generation
			enhanced_data_english: ocrResult.enhanced_data_english,
			enhanced_data_original: ocrResult.enhanced_data_original,
			// Store original data for reference
			original_title: projectData.title,
			original_description: projectData.description,
			original_project_owner: projectData.project_owner,
		};

		console.log(
			`✅ Final result prepared with both English and original language data`
		);
		console.log(`===============================================\n`);

		return finalResult;
	}

	// Check OCR service status
	async checkOCRServiceStatus() {
		try {
			const response = await axios.get(`${this.ocrServiceUrl}/v1/health`, {
				timeout: 5000,
			});
			return { status: "connected", data: response.data };
		} catch (error) {
			return { status: "disconnected", error: error.message };
		}
	}

	// Enable/disable test mode
	setTestMode(enabled) {
		this.testMode = enabled;
		console.log(
			`🔧 Test mode ${enabled ? "ENABLED" : "DISABLED"} - OCR will ${
				enabled ? "ALWAYS" : "conditionally"
			} run`
		);
	}

	// Get current test mode status
	isTestMode() {
		return this.testMode;
	}
}

module.exports = OCRIntegrationService;
