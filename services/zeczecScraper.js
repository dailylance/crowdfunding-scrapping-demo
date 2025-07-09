const BaseScraper = require("./baseScraper");

class ZecZecScraper extends BaseScraper {
	constructor() {
		super();
		this.baseUrl = "https://www.zeczec.com";
		this.categoryMap = {
			// English categories
			all: null,
			music: "music",
			photography: "photography",
			publishing: "publishing",
			fashion: "fashion",
			design: "design",
			performance: "performance",
			art: "art",
			"science and technology": "science-technology",
			educate: "educate",
			game: "game",
			diet: "diet",
			space: "space",
			society: "society",
			"illustration comics": "illustration-comics",
			"movie animation": "movie-animation",
			"local revitalization": "local-revitalization",
			"very good shop": "very-good-shop",
			"happy new year": "happy-new-year",
			"online courses": "online-courses",
			// Normalized versions
			科技: "science-technology",
			教育: "educate",
			遊戲: "game",
			飲食: "diet",
			空間: "space",
			社會: "society",
			插畫漫畫: "illustration-comics",
			影像動畫: "movie-animation",
			地方創生: "local-revitalization",
			好物販售: "very-good-shop",
			新年快樂: "happy-new-year",
			線上課程: "online-courses",
		};
	}

	getName() {
		return "ZecZec";
	}

	getCategories() {
		return {
			"Creative & Arts": {
				music: "Music",
				photography: "Photography",
				art: "Art",
				design: "Design",
				performance: "Performance",
				"illustration comics": "Illustration Comics",
				"movie animation": "Movie Animation",
			},
			"Knowledge & Education": {
				publishing: "Publishing",
				educate: "Education",
				"science and technology": "Science & Technology",
				"online courses": "Online Courses",
			},
			"Lifestyle & Commerce": {
				fashion: "Fashion",
				diet: "Diet",
				space: "Space",
				"very good shop": "Very Good Shop",
				"happy new year": "Happy New Year",
			},
			"Community & Others": {
				game: "Game",
				society: "Society",
				"local revitalization": "Local Revitalization",
			},
		};
	}

	async extractProjects() {
		// Wait for page to load
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Scroll to load more projects
		await this.page.evaluate(async () => {
			await new Promise((resolve) => {
				let totalHeight = 0;
				const distance = 200;
				let scrollCount = 0;
				const maxScrolls = 20;

				const timer = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					totalHeight += distance;
					scrollCount++;

					if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
						clearInterval(timer);
						resolve();
					}
				}, 200);
			});
		});

		// Wait for dynamic content to load
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// Extract project URLs
		const projectUrls = await this.page.evaluate(() => {
			const urlSet = new Set();

			// Look for project links with various patterns
			const selectors = [
				'a[href*="/projects/"]',
				'a[href*="/project/"]',
				'[class*="project"] a',
				'[class*="card"] a',
				'[class*="item"] a',
			];

			console.log("Searching for project links...");

			selectors.forEach((selector) => {
				const links = document.querySelectorAll(selector);
				console.log(`Selector "${selector}" found ${links.length} links`);

				links.forEach((link) => {
					if (
						link.href &&
						(link.href.includes("/projects/") ||
							link.href.includes("/project/"))
					) {
						// Filter out non-project URLs
						if (
							!link.href.includes("/updates/") &&
							!link.href.includes("/comments/") &&
							!link.href.includes("/supporters/") &&
							link.href.match(/\/projects?\/[\w-]+/)
						) {
							urlSet.add(link.href);
						}
					}
				});
			});

			// Additional method: Search all links for project patterns
			const allLinks = document.querySelectorAll("a[href]");
			console.log(
				`Checking ${allLinks.length} total links for project patterns`
			);

			allLinks.forEach((link) => {
				const href = link.href;
				if (
					href.match(/\/projects?\/[\w-]+(?:\/|\?|$)/) &&
					!href.includes("/updates/") &&
					!href.includes("/comments/") &&
					!href.includes("/supporters/")
				) {
					urlSet.add(href);
				}
			});

			const urls = Array.from(urlSet);
			console.log(`Found ${urls.length} unique project URLs`);

			// Log first few URLs for debugging
			urls.slice(0, 5).forEach((url, i) => {
				console.log(`${i + 1}: ${url}`);
			});

			return urls;
		});

		console.log(
			`✅ Extracted ${projectUrls.length} project URLs from search page`
		);
		return projectUrls;
	}

	async extractProjectDetails(projectUrl, targetLanguage = "en") {
		try {
			// Add retry logic for failed page loads
			let retries = 2;
			let loaded = false;

			while (retries > 0 && !loaded) {
				try {
					await this.page.goto(projectUrl, {
						waitUntil: "networkidle2",
						timeout: 15000,
					});
					loaded = true;
				} catch (error) {
					retries--;
					if (retries > 0) {
						console.log(`Retrying ${projectUrl} (${retries} attempts left)...`);
						await new Promise((resolve) => setTimeout(resolve, 3000));
					} else {
						throw error;
					}
				}
			}

			await new Promise((resolve) => setTimeout(resolve, 3000));
		} catch (error) {
			console.error(
				`Failed to load project page: ${projectUrl}`,
				error.message
			);
			return null;
		}

		const data = await this.page.evaluate(() => {
			const getText = (selector) => {
				const el = document.querySelector(selector);
				return el ? el.innerText.trim() : "";
			};

			const getAttr = (selector, attr) => {
				const el = document.querySelector(selector);
				return el ? el.getAttribute(attr) : "";
			};

			// Current URL
			const url = window.location.href;
			const allText = document.body.innerText;

			// Extract project title - based on analysis, it's the H1 with class "text-lg font-bold my-4"
			let title = "";
			let originalTitle = "";

			// Try the correct title selector based on analysis
			const titleElement = document.querySelector("h1.text-lg.font-bold.my-4");
			if (titleElement) {
				title = titleElement.textContent.trim();
			} else {
				// Fallback to other selectors
				const fallbackSelectors = [
					"h1:not(.hover-logo)",
					'[class*="title"]',
					'meta[property="og:title"]',
				];

				for (const selector of fallbackSelectors) {
					if (selector.includes("meta")) {
						title = getAttr(selector, "content");
					} else {
						title = getText(selector);
					}

					if (title && title.length > 5 && !title.includes("嘖嘖")) {
						break;
					}
				}
			}

			// Clean up title
			if (title && title.includes(" | ")) {
				title = title.split(" | ")[0].trim();
			}

			originalTitle = title;

			// Description
			let description =
				getAttr('meta[name="description"]', "content") ||
				getAttr('meta[property="og:description"]', "content") ||
				"";

			// Image
			const imageUrl = getAttr('meta[property="og:image"]', "content") || "";

			// Extract project owner/creator - look for "提案人" pattern
			let projectOwner = "";
			let ownerWebsite = "";
			let ownerSns = "";
			let contactInfo = "";

			// Look for "提案人" (proposer) in the text
			const proposerMatch = allText.match(/提案人\s*([^\n\r]+)/);
			if (proposerMatch) {
				projectOwner = proposerMatch[1].trim();
			}

			// If not found, look for other patterns
			if (!projectOwner) {
				const ownerSelectors = [
					'[class*="proposer"]',
					'[class*="creator"]',
					'[class*="owner"]',
					'[class*="author"]',
				];

				for (const selector of ownerSelectors) {
					const element = document.querySelector(selector);
					if (element) {
						const text = element.textContent.trim();
						if (text && text.length > 2 && text.length < 100) {
							projectOwner = text;
							break;
						}
					}
				}
			}

			// Extract real SNS links (not sharing links)
			const allLinks = document.querySelectorAll("a[href]");
			const realSnsLinks = [];
			const ownerWebsites = [];

			for (const link of allLinks) {
				const href = link.href;

				// Check for real SNS accounts
				if (
					(href.includes("twitter.com") ||
						href.includes("facebook.com") ||
						href.includes("instagram.com") ||
						href.includes("youtube.com") ||
						href.includes("linkedin.com")) &&
					!href.includes("/share") &&
					!href.includes("?url=") &&
					!href.includes("&text=") &&
					!href.includes("/share.php") &&
					!href.includes("zeczec.com") &&
					!href.includes("intent/tweet")
				) {
					realSnsLinks.push(href);
				}

				// Look for owner websites
				else if (
					href.startsWith("http") &&
					!href.includes("zeczec.com") &&
					!href.includes("twitter.com") &&
					!href.includes("facebook.com") &&
					!href.includes("instagram.com") &&
					!href.includes("youtube.com") &&
					!href.includes("share") &&
					!href.includes("?url=") &&
					!href.includes("forms.gle") &&
					!href.includes("mailto:")
				) {
					ownerWebsites.push(href);
				}
			}

			if (realSnsLinks.length > 0) {
				ownerSns = realSnsLinks.slice(0, 3).join(", ");
			}

			if (ownerWebsites.length > 0) {
				ownerWebsite = ownerWebsites[0];
			}

			// Extract funding information - based on analysis
			let currentAmount = "";
			let goalAmount = "";
			let achievementRate = "";
			let supporters = "";

			// Get current amount - look for "累計集資金額" section
			const currentAmountElement = document.querySelector("h3.js-sum-raised");
			if (currentAmountElement) {
				currentAmount = currentAmountElement.textContent.replace(/[^\d,]/g, "");
			}

			// Get goal amount - look for "目標"
			const goalMatch = allText.match(/目標\s*NT\$\s*([\d,]+)/);
			if (goalMatch) {
				goalAmount = goalMatch[1];
			}

			// Get achievement rate - look for percentage
			const percentMatch = allText.match(/(\d+(?:\.\d+)?)\s*%/);
			if (percentMatch) {
				achievementRate = percentMatch[1] + "%";
			}

			// Get supporters count - look for "人" after numbers
			const supportersElement = document.querySelector(
				"h3.font-bold.text-lg.text-black.flex.items-center.text-zec-green"
			);
			if (supportersElement) {
				const supportersMatch = supportersElement.textContent.match(/(\d+)/);
				if (supportersMatch) {
					supporters = supportersMatch[1] + " people";
				}
			}

			// Status determination
			let status = "Live";
			let projectStatus = "Current";

			// Check for "剩餘時間" (remaining time) to determine status
			const remainingTimeElement = document.querySelector("h3.js-time-left");
			if (remainingTimeElement) {
				const remainingText = remainingTimeElement.textContent.trim();
				if (
					remainingText.includes("已結束") ||
					remainingText.includes("0 天")
				) {
					status = "Ended";
					projectStatus = "Completed";
				} else if (achievementRate && parseInt(achievementRate) >= 100) {
					status = "Successful";
					projectStatus = "Completed";
				}
			}

			// Extract dates - look for "募資期間"
			let startDate = "";
			let endDate = "";

			const dateElement = document.querySelector(
				"h3.inline-block.text-gray-500.text-xs"
			);
			if (dateElement) {
				const dateText = dateElement.textContent.trim();
				const dateMatch = dateText.match(
					/(\d{4}\/\d{2}\/\d{2})\s*\d{2}:\d{2}\s*–\s*(\d{4}\/\d{2}\/\d{2})\s*\d{2}:\d{2}/
				);
				if (dateMatch) {
					startDate = dateMatch[1];
					endDate = dateMatch[2];
				}
			}

			// Extract category from breadcrumb or URL
			let category = "";

			// Look for breadcrumb or category info
			const breadcrumbMatch = allText.match(/群眾集資\s*\\\s*([^\n\r]+)/);
			if (breadcrumbMatch) {
				category = breadcrumbMatch[1].trim();
			}

			// Fallback to URL analysis
			if (!category) {
				const urlMatch = url.match(/category\/([^\/]+)/);
				if (urlMatch) {
					category = decodeURIComponent(urlMatch[1]);
				}
			}

			// Days left extraction
			let daysLeft = "";
			if (status === "Live") {
				const daysLeftElement = document.querySelector("h3.js-time-left");
				if (daysLeftElement) {
					const daysMatch = daysLeftElement.textContent.match(/(\d+)\s*天/);
					if (daysMatch) {
						daysLeft = daysMatch[1];
					}
				}
			}

			// Return normalized format
			return {
				target_site: "ZecZec",
				market: "ZecZec",
				status: status,
				url: url,
				image_url: imageUrl,
				title: title,
				original_title: originalTitle,
				project_owner: projectOwner,
				owner_website: ownerWebsite,
				owner_sns: ownerSns,
				owner_country: "Taiwan",
				contact_info: contactInfo,
				achievement_rate: achievementRate,
				supporters: supporters,
				amount: currentAmount,
				support_amount: goalAmount,
				crowdfund_start_date: startDate,
				crowdfund_end_date: endDate,
				start_date: startDate,
				end_date: endDate,
				current_or_completed_project: projectStatus,

				// Additional fields for backward compatibility
				description: description.substring(0, 500),
				category: category,
				creator: projectOwner,
				progress: achievementRate,
				daysLeft: daysLeft,
				platform: "ZecZec",
				platformUrl: "https://www.zeczec.com/",
				scrapedAt: new Date().toISOString(),
				fundingAmount: currentAmount,
				backers: supporters,
				image: imageUrl,
			};
		});

		return data;
	}

	buildSearchUrl(category, keyword) {
		// ZecZec doesn't seem to have direct category filtering, so we'll use the main page
		// and filter later, or use search functionality
		if (category === "all" || !category) {
			if (keyword && keyword.trim()) {
				return `${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`;
			}
			return `${this.baseUrl}/`; // Use homepage which has projects
		}

		// For specific categories, we'll use the main page and filter later
		// since ZecZec doesn't have clear category URLs
		if (keyword && keyword.trim()) {
			return `${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`;
		}

		return `${this.baseUrl}/`; // Use homepage for all categories
	}

	async scrape(category, keyword, options = {}) {
		const targetLanguage = options.language || "en";
		const maxResults = options.maxResults || 50;

		if (options.language) this.setLanguage(options.language);
		await this.initBrowser();
		const url = this.buildSearchUrl(category, keyword);

		console.log(
			`🔍 Searching ZecZec for category: "${category}", keyword: "${keyword}"`
		);
		console.log(`📍 URL: ${url}`);

		try {
			await this.page.goto(url, { waitUntil: "networkidle2" });
		} catch (error) {
			console.error("Failed to load search page:", error);
			throw error;
		}

		const projectUrls = await this.extractProjects();

		if (projectUrls.length === 0) {
			console.log("No projects found on search page");
			await this.closeBrowser();
			return [];
		}

		// Limit the number of projects to scrape
		const urlsToScrape = projectUrls.slice(0, maxResults);
		console.log(
			`Found ${projectUrls.length} project URLs, scraping ${urlsToScrape.length}`
		);

		const results = [];
		const batchSize = 3;

		for (let i = 0; i < urlsToScrape.length; i += batchSize) {
			const batch = urlsToScrape.slice(i, i + batchSize);
			const startTime = Date.now();

			console.log(
				`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
					urlsToScrape.length / batchSize
				)}: ${batch.length} projects`
			);

			const batchResults = await Promise.all(
				batch.map(async (url) => {
					try {
						return await this.extractProjectDetails(url, targetLanguage);
					} catch (error) {
						console.error(`Error scraping project ${url}:`, error);
						return null;
					}
				})
			);

			const endTime = Date.now();
			console.log(
				`Processed batch of ${batch.length} projects in ${
					endTime - startTime
				}ms`
			);

			// Filter results
			const filteredResults = batchResults.filter((result) => {
				if (!result) return false;

				// Set correct category based on search
				if (category && category !== "all") {
					const categoryNameMap = {
						music: "Music",
						photography: "Photography",
						publishing: "Publishing",
						fashion: "Fashion",
						design: "Design",
						performance: "Performance",
						art: "Art",
						"science and technology": "Science & Technology",
						educate: "Education",
						game: "Game",
						diet: "Diet",
						space: "Space",
						society: "Society",
						"illustration comics": "Illustration Comics",
						"movie animation": "Movie Animation",
						"local revitalization": "Local Revitalization",
						"very good shop": "Very Good Shop",
						"happy new year": "Happy New Year",
						"online courses": "Online Courses",
					};

					result.category = categoryNameMap[category.toLowerCase()] || category;
				}

				// Keyword filtering
				if (
					keyword &&
					keyword.trim() !== "" &&
					keyword.toLowerCase() !== category?.toLowerCase()
				) {
					const searchKeyword = keyword.toLowerCase();
					const title = (result.title || "").toLowerCase();
					const description = (result.description || "").toLowerCase();

					if (
						!title.includes(searchKeyword) &&
						!description.includes(searchKeyword)
					) {
						console.log(`⚠️ Filtered out: ${result.title} (keyword mismatch)`);
						return false;
					}
				}

				console.log(
					`✅ Included: ${result.title} by ${
						result.project_owner || "Unknown owner"
					} (Category: ${result.category})`
				);
				return true;
			});

			results.push(...filteredResults);

			// Add delay between batches
			if (i + batchSize < urlsToScrape.length) {
				await new Promise((resolve) => setTimeout(resolve, 1500));
			}
		}

		await this.closeBrowser();

		console.log(`📊 Final results: ${results.length} projects after filtering`);
		return results;
	}
}

module.exports = ZecZecScraper;
