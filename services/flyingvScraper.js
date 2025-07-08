const BaseScraper = require("./baseScraper");

class FlyingVScraper extends BaseScraper {
	constructor() {
		super();
		this.baseUrl = "https://www.flyingv.cc";
		this.categoryMap = {
			product: "product",
			tech: "product",
			technology: "product",
			"technology design": "product",
			科技設計: "product",
			music: "music",
			音樂: "music",
			art: "art",
			film: "art",
			movie: "art",
			"art films": "art",
			藝術影視: "art",
			life: "life",
			lifestyle: "life",
			生活: "life",
			community: "community",
			public: "community",
			local: "community",
			"public place": "community",
			公共在地: "community",
			game: "publishing",
			gaming: "publishing",
			book: "publishing",
			publishing: "publishing",
			"game publishing": "publishing",
			遊戲出版: "publishing",
			// Add "all" as a special case
			all: null,
		};
	}

	getName() {
		return "FlyingV";
	}

	getCategories() {
		return {
			"Main Categories": {
				"technology design": "Technology Design",
				music: "Music",
				"art films": "Art Films",
				life: "Life",
				"public place": "Public Place",
				"game publishing": "Game Publishing",
			},
		};
	}

	async extractProjects() {
		// Wait for page to load
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Scroll to load more projects
		await this.page.evaluate(async () => {
			await new Promise((resolve) => {
				let totalHeight = 0;
				const distance = 100;
				const timer = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					totalHeight += distance;

					if (totalHeight >= scrollHeight) {
						clearInterval(timer);
						resolve();
					}
				}, 100);
			});
		});

		// Extract project URLs
		const projectUrls = await this.page.evaluate(() => {
			const links = Array.from(
				document.querySelectorAll('a[href*="/projects/"]')
			);
			const urls = links
				.map((link) => link.href)
				.filter((url) => url.match(/\/projects\/\d+$/)) // Only direct project URLs
				.filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates

			return urls.slice(0, 12); // Limit to reasonable number
		});

		console.log(`Found ${projectUrls.length} project URLs`);
		return projectUrls;
	}

	async extractProjectDetails(projectUrl, targetLanguage = "en") {
		const page = await this.browser.newPage();
		try {
			await page.goto(projectUrl, {
				waitUntil: "domcontentloaded",
				timeout: 30000,
			});
			await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait longer for dynamic content

			const data = await page.evaluate(() => {
				const getText = (selector) => {
					const el = document.querySelector(selector);
					return el ? el.innerText.trim() : "";
				};

				const getAttr = (selector, attr) => {
					const el = document.querySelector(selector);
					return el ? el.getAttribute(attr) : "";
				};

				// Title
				const title = getText("h1") || getText(".project-title") || "";
				const originalTitle = title; // Keep original for bilingual support

				// Description
				let description =
					getAttr('meta[name="description"]', "content") ||
					getAttr('meta[property="og:description"]', "content") ||
					"";

				// Image
				const imageUrl = getAttr('meta[property="og:image"]', "content") || "";

				// Current URL
				const url = window.location.href;

				// Get all text for pattern matching
				const allText = document.body.innerText;

				// Extract funding amount and goal using specific FlyingV selectors
				let currentAmount = "";
				let goalAmount = "";
				let achievementRate = "";

				// Method 1: Extract current amount using FlyingV specific selectors
				const currentAmountSelectors = [
					"h2.number.moneyFormat",
					".number.moneyFormat",
					"h2.number",
					".totalFund h2",
					".numberRow.totalFund h2",
				];

				for (const selector of currentAmountSelectors) {
					const element = document.querySelector(selector);
					if (element) {
						const text = element.textContent.trim();
						if (text.match(/^[0-9,]+$/)) {
							currentAmount = "NT$" + text;
							break;
						}
					}
				}

				// Method 2: Extract goal amount using FlyingV specific selectors
				const goalAmountSelectors = [
					"p.metatext.moneyFormat",
					".metatext.moneyFormat",
					"p.metatext",
				];

				for (const selector of goalAmountSelectors) {
					const element = document.querySelector(selector);
					if (element) {
						const text = element.textContent.trim();
						const match = text.match(/目標\s*NTD?\$?([0-9,]+)/);
						if (match) {
							goalAmount = "NT$" + match[1];
							break;
						}
					}
				}

				// Method 3: Extract achievement rate using FlyingV specific selectors
				const achievementSelectors = [
					".mdl-tooltip",
					'[class*="tooltip"]',
					'[class*="percent"]',
					'[class*="progress"]',
				];

				for (const selector of achievementSelectors) {
					const element = document.querySelector(selector);
					if (element) {
						const text = element.textContent.trim();
						if (text.match(/^\d+(\.\d+)?%$/)) {
							achievementRate = text;
							break;
						}
					}
				}

				// Fallback Method 4: Look for current funding amount with multiple patterns
				if (!currentAmount) {
					const fundingElements = document.querySelectorAll("*");
					for (const element of fundingElements) {
						const text = element.textContent.trim();

						// Look for standalone numbers that could be current amount
						if (
							text.match(/^[0-9,]+$/) &&
							parseInt(text.replace(/,/g, "")) > 100
						) {
							const parent = element.parentElement;
							if (
								parent &&
								(parent.className.includes("number") ||
									parent.className.includes("fund"))
							) {
								currentAmount = "NT$" + text;
								break;
							}
						}
					}
				}

				// Fallback Method 5: Look for goal amount with comprehensive patterns
				if (!goalAmount) {
					const goalPatterns = [
						/目標\s*NTD?\$?([0-9,]+)/,
						/Target\s*NTD?\$?([0-9,]+)/i,
						/Goal\s*NTD?\$?([0-9,]+)/i,
						/需要\s*NTD?\$?([0-9,]+)/,
						/募集\s*NTD?\$?([0-9,]+)/,
						/集資目標\s*NTD?\$?([0-9,]+)/,
						/預算\s*NTD?\$?([0-9,]+)/,
						/總金額\s*NTD?\$?([0-9,]+)/,
					];

					for (const pattern of goalPatterns) {
						const match = allText.match(pattern);
						if (match) {
							goalAmount = "NT$" + match[1];
							break;
						}
					}
				}

				// Fallback Method 6: Look for progress bar elements
				if (!currentAmount || !goalAmount) {
					const progressElements = document.querySelectorAll(
						'.progressMoney, .progress-money, [class*="progress"][class*="money"]'
					);

					for (const element of progressElements) {
						const text = element.textContent.trim();
						const match = text.match(/\$([0-9,]+)/);
						if (match) {
							const amount = "NT$" + match[1];
							// Determine if this is current or goal based on context
							const context =
								element.parentElement?.textContent.toLowerCase() || "";
							if (
								context.includes("目標") ||
								context.includes("goal") ||
								context.includes("target")
							) {
								if (!goalAmount) goalAmount = amount;
							} else {
								if (!currentAmount) currentAmount = amount;
							}
						}
					}
				}

				// Calculate achievement rate if we have both amounts
				if (currentAmount && goalAmount && !achievementRate) {
					const current = parseInt(currentAmount.replace(/[^\d]/g, ""));
					const goal = parseInt(goalAmount.replace(/[^\d]/g, ""));
					if (goal > 0) {
						achievementRate = Math.round((current / goal) * 100) + "%";
					}
				}

				// Look for explicit achievement rate in text if still not found
				if (!achievementRate) {
					const percentageMatch = allText.match(/(\d+(?:\.\d+)?)%/);
					if (percentageMatch) {
						achievementRate = percentageMatch[1] + "%";
					}
				}

				// Ensure proper formatting
				if (currentAmount && !currentAmount.startsWith("NT$")) {
					currentAmount = currentAmount.replace(/^(\$|＄)/, "NT$");
				}
				if (goalAmount && !goalAmount.startsWith("NT$")) {
					goalAmount = goalAmount.replace(/^(\$|＄)/, "NT$");
				}

				// Supporters/Backers count
				let supporters = "";
				const supporterElements = document.querySelectorAll("*");
				for (const element of supporterElements) {
					const text = element.textContent.trim();
					if (
						text.match(/^\d+$/) &&
						parseInt(text) > 0 &&
						parseInt(text) < 100000
					) {
						const parentText =
							element.parentElement?.textContent.toLowerCase() || "";
						if (
							parentText.includes("sponsor") ||
							parentText.includes("贊助") ||
							parentText.includes("supporter") ||
							parentText.includes("backer") ||
							parentText.includes("人贊助")
						) {
							supporters = text;
							break;
						}
					}
				}

				// Dates extraction - more comprehensive
				let startDate = "";
				let endDate = "";
				let daysLeft = "";

				// Look for dates with multiple patterns
				const datePatterns = [
					{
						pattern: /開始時間[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
						type: "start",
					},
					{
						pattern: /Start[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
						type: "start",
					},
					{
						pattern: /結束時間[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
						type: "end",
					},
					{ pattern: /End[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/, type: "end" },
					{
						pattern: /募資期間[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
						type: "start",
					},
					{
						pattern: /活動期間[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
						type: "start",
					},
					{
						pattern:
							/(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s*[~－至到]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
						type: "range",
					},
				];

				for (const { pattern, type } of datePatterns) {
					const match = allText.match(pattern);
					if (match) {
						if (type === "start") {
							startDate = match[1];
						} else if (type === "end") {
							endDate = match[1];
						} else if (type === "range") {
							startDate = match[1];
							endDate = match[2];
						}
					}
				}

				// Look for days left with more patterns
				const daysPatterns = [
					/(\d+)\s*days?\s*left/,
					/還剩\s*(\d+)\s*天/,
					/剩餘\s*(\d+)\s*天/,
					/倒數\s*(\d+)\s*天/,
					/(\d+)\s*天後結束/,
				];

				for (const pattern of daysPatterns) {
					const match = allText.match(pattern);
					if (match) {
						daysLeft = match[1];
						break;
					}
				}

				// Format dates to standard format
				if (startDate && startDate.includes("/")) {
					startDate = startDate.replace(/\//g, "-");
				}
				if (endDate && endDate.includes("/")) {
					endDate = endDate.replace(/\//g, "-");
				}

				// Status determination
				let status = "Live";
				let projectStatus = "Current";

				if (
					allText.includes("successfully funded") ||
					allText.includes("SUCCESS!") ||
					allText.includes("成功達成") ||
					allText.includes("募資成功") ||
					allText.includes("達成目標")
				) {
					status = "Successful";
					projectStatus = "Completed";
				} else if (
					allText.includes("已結束") ||
					allText.includes("ended") ||
					allText.includes("募資結束")
				) {
					status = "Ended";
					projectStatus = "Completed";
				} else if (
					allText.includes("進行中") ||
					allText.includes("募資中") ||
					allText.includes("funding")
				) {
					status = "Live";
					projectStatus = "Current";
				}

				// Category extraction
				let category = "";
				const categoryElements = document.querySelectorAll("*");
				for (const element of categoryElements) {
					const text = element.textContent.trim();
					if (text === "Technology Design" || text === "科技設計") {
						category = "Technology Design";
						break;
					} else if (text === "Music" || text === "音樂") {
						category = "Music";
						break;
					} else if (text === "Art Films" || text === "藝術影視") {
						category = "Art Films";
						break;
					} else if (text === "Life" || text === "生活") {
						category = "Life";
						break;
					} else if (text === "Public Place" || text === "公共在地") {
						category = "Public Place";
						break;
					} else if (text === "Game Publishing" || text === "遊戲出版") {
						category = "Game Publishing";
						break;
					}
				}

				// Project owner/creator extraction
				let projectOwner = "";
				let ownerWebsite = "";
				let ownerSns = "";
				let ownerCountry = "Taiwan"; // Default for FlyingV

				// Look for proposer information more comprehensively
				const proposerSelectors = [
					'[data-testid="proposer-name"]',
					".proposer-name",
					".creator-name",
					'[class*="proposer"]',
					'[class*="creator"]',
					'a[href*="/users/"]',
				];

				for (const selector of proposerSelectors) {
					const element = document.querySelector(selector);
					if (element) {
						projectOwner = element.textContent.trim();
						if (element.href && element.href.includes("/users/")) {
							ownerWebsite = element.href;
						}
						break;
					}
				}

				// Alternative: look for text patterns
				if (!projectOwner) {
					const textElements = document.querySelectorAll("*");
					for (const element of textElements) {
						const text = element.textContent.trim();
						if (text.includes("提案者：") || text.includes("Proposer:")) {
							const match = text.match(/(?:提案者：|Proposer:)\s*([^,\n]+)/);
							if (match) {
								projectOwner = match[1].trim();
								break;
							}
						}
					}
				}

				// Look for creator profile in page text
				if (!projectOwner) {
					const bodyText = document.body.innerText;
					const creatorMatch = bodyText.match(
						/(?:由|by)\s+([^\s,\n]+(?:\s+[^\s,\n]+)*?)(?:\s+(?:提案|創作|發起))/
					);
					if (creatorMatch) {
						projectOwner = creatorMatch[1].trim();
					}
				}

				// Clean up owner name
				if (projectOwner) {
					projectOwner = projectOwner
						.replace(/^提案者\s*[：:]\s*/, "")
						.replace(/^Proposer\s*[：:]\s*/, "")
						.replace(/^提案者\s+/, "")
						.replace(/^Proposer\s+/, "")
						.replace(/^by\s*/, "")
						.replace(/^創作者\s*[：:]\s*/, "")
						.replace(/^發起人\s*[：:]\s*/, "")
						.split("\n")[0]
						.split("，")[0]
						.split(",")[0]
						.trim();

					if (projectOwner.length > 100) {
						projectOwner = projectOwner.substring(0, 100).trim();
					}
				}

				// Look for social media links
				const socialLinks = document.querySelectorAll(
					'a[href*="facebook"], a[href*="twitter"], a[href*="instagram"]'
				);
				if (socialLinks.length > 0) {
					ownerSns = socialLinks[0].href;
				}

				// Return normalized format
				return {
					target_site: "FlyingV",
					market: "FlyingV",
					status: status,
					url: url,
					image_url: imageUrl,
					title: title,
					original_title: originalTitle,
					project_owner: projectOwner,
					owner_website: ownerWebsite,
					owner_sns: ownerSns,
					owner_country: ownerCountry,
					contact_info: "",
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
					platform: "FlyingV",
					platformUrl: "https://www.flyingv.cc/",
					scrapedAt: new Date().toISOString(),
				};
			});

			// Apply translation if needed
			if (data && targetLanguage === "en") {
				data.title = this.translateText(data.title, targetLanguage);
				data.original_title = data.title; // Keep original for reference
				data.project_owner = this.translateText(
					data.project_owner,
					targetLanguage
				);

				// Translate category to match FlyingV official categories
				if (data.category) {
					data.category = this.translateCategory(data.category, targetLanguage);
				}

				// Format amounts with proper currency notation
				if (data.amount && data.amount.includes("NT")) {
					if (!data.amount.includes("TWD")) {
						data.amount = data.amount + " TWD";
					}
				}

				if (data.support_amount && data.support_amount.includes("NT")) {
					if (!data.support_amount.includes("TWD")) {
						data.support_amount = data.support_amount + " TWD";
					}
				}

				// Format supporters count
				if (data.supporters && !data.supporters.includes("people")) {
					data.supporters = data.supporters + " people";
				}

				// Update legacy fields for backward compatibility
				data.creator = data.project_owner;
				data.fundingAmount = data.amount;
				data.backers = data.supporters;
				data.image = data.image_url;
			}

			await page.close();
			return data;
		} catch (error) {
			console.error(
				`Error extracting details from ${projectUrl}:`,
				error.message
			);
			await page.close();
			return null;
		}
	}

	buildSearchUrl(category, keyword) {
		// Handle "all" category
		if (category === "all" || !category) {
			return `${this.baseUrl}/projects`;
		}

		// Normalize category - handle both key names from UI and full category names
		let normalizedCategory = category?.toLowerCase();

		// Map frontend category keys to internal category keys
		const categoryKeyMap = {
			"technology design": "product",
			music: "music",
			"art films": "art",
			life: "life",
			"public place": "community",
			"game publishing": "publishing",
		};

		// First try direct mapping from the categoryKeyMap
		let cat = categoryKeyMap[normalizedCategory];

		// If not found, try the original categoryMap
		if (!cat) {
			cat = this.categoryMap[normalizedCategory] || "";
		}

		if (cat) {
			return `${this.baseUrl}/projects?category=${cat}`;
		} else {
			// Default fallback
			return `${this.baseUrl}/projects`;
		}
	}

	async scrape(category, keyword, options = {}) {
		const targetLanguage = options.language || "en";

		if (options.language) this.setLanguage(options.language);
		await this.initBrowser();
		const url = this.buildSearchUrl(category, keyword);

		console.log(
			`🔍 Searching FlyingV for category: "${category}", keyword: "${keyword}"`
		);
		console.log(`📍 URL: ${url}`);

		await this.page.goto(url, {
			waitUntil: "domcontentloaded",
			timeout: 30000,
		});

		const projectUrls = await this.extractProjects();

		// Process projects with concurrency
		const concurrency = 3;
		const results = [];
		let idx = 0;

		while (idx < projectUrls.length) {
			const batch = projectUrls.slice(idx, idx + concurrency);
			const startTime = Date.now();
			const batchResults = await Promise.all(
				batch.map((url) => this.extractProjectDetails(url, targetLanguage))
			);
			const endTime = Date.now();

			console.log(
				`Processed batch of ${batch.length} projects in ${
					endTime - startTime
				}ms`
			);

			// Filter results based on category and keyword
			const filteredResults = batchResults.filter((result) => {
				if (!result) return false;

				// If we searched by a specific category URL, trust that the results are relevant
				// Only do content-based filtering for keyword searches or "all" category
				if (category && category !== "all") {
					const searchCategory = category.toLowerCase();

					// If we already searched by category URL, set the category if it's missing
					if (!result.category) {
						if (searchCategory === "music" || searchCategory === "音樂") {
							result.category = "Music";
						} else if (
							searchCategory === "product" ||
							searchCategory === "tech" ||
							searchCategory === "technology" ||
							searchCategory === "technology design"
						) {
							result.category = "Technology Design";
						} else if (
							searchCategory === "art" ||
							searchCategory === "film" ||
							searchCategory === "art films"
						) {
							result.category = "Art Films";
						} else if (
							searchCategory === "life" ||
							searchCategory === "lifestyle"
						) {
							result.category = "Life";
						} else if (
							searchCategory === "community" ||
							searchCategory === "public" ||
							searchCategory === "public place"
						) {
							result.category = "Public Place";
						} else if (
							searchCategory === "game" ||
							searchCategory === "publishing" ||
							searchCategory === "game publishing"
						) {
							result.category = "Game Publishing";
						}
					}

					// Only do strict filtering if this is a keyword-based search with a different keyword than the category
					// For category-based searches, trust the URL filtering
					// Skip filtering if keyword is same as category (like "art films" keyword with "art films" category)
					const normalizedKeyword = (keyword || "").toLowerCase().trim();
					const shouldSkipFiltering =
						!keyword ||
						!keyword.trim() ||
						normalizedKeyword === searchCategory ||
						normalizedKeyword === searchCategory.replace(/\s+/g, "") ||
						(searchCategory === "art films" &&
							normalizedKeyword === "art films") ||
						(searchCategory === "technology design" &&
							normalizedKeyword === "technology design") ||
						(searchCategory === "public place" &&
							normalizedKeyword === "public place") ||
						(searchCategory === "game publishing" &&
							normalizedKeyword === "game publishing");

					if (keyword && keyword.trim() && !shouldSkipFiltering) {
						const resultCategory = (result.category || "").toLowerCase();
						const title = (result.title || "").toLowerCase();
						const description = (result.description || "").toLowerCase();

						// Check if the result matches the requested category
						let categoryMatch = false;

						if (searchCategory === "music" || searchCategory === "音樂") {
							categoryMatch =
								resultCategory.includes("music") ||
								resultCategory.includes("音樂") ||
								title.includes("music") ||
								title.includes("音樂") ||
								title.includes("band") ||
								title.includes("album") ||
								title.includes("concert") ||
								title.includes("樂團") ||
								description.includes("music") ||
								description.includes("音樂");
						} else if (
							searchCategory === "product" ||
							searchCategory === "tech" ||
							searchCategory === "technology" ||
							searchCategory === "technology design"
						) {
							categoryMatch =
								resultCategory.includes("technology") ||
								resultCategory.includes("tech") ||
								resultCategory.includes("科技") ||
								title.includes("tech") ||
								title.includes("科技") ||
								title.includes("gadget") ||
								title.includes("device") ||
								title.includes("smart") ||
								title.includes("智能") ||
								description.includes("technology") ||
								description.includes("科技") ||
								// Accept all results when searching by technology category
								true;
						} else if (
							searchCategory === "art" ||
							searchCategory === "film" ||
							searchCategory === "art films"
						) {
							categoryMatch =
								resultCategory.includes("art") ||
								resultCategory.includes("film") ||
								resultCategory.includes("藝術") ||
								title.includes("art") ||
								title.includes("film") ||
								title.includes("藝術") ||
								title.includes("影視") ||
								title.includes("舞蹈") ||
								title.includes("劇場") ||
								title.includes("演出") ||
								title.includes("表演") ||
								title.includes("dance") ||
								title.includes("theater") ||
								title.includes("performance") ||
								title.includes("show") ||
								// Accept all results when searching by art films category URL
								true;
						} else if (
							searchCategory === "life" ||
							searchCategory === "lifestyle"
						) {
							categoryMatch =
								resultCategory.includes("life") ||
								resultCategory.includes("生活") ||
								title.includes("life") ||
								title.includes("生活");
						} else if (
							searchCategory === "community" ||
							searchCategory === "public" ||
							searchCategory === "public place"
						) {
							categoryMatch =
								resultCategory.includes("community") ||
								resultCategory.includes("public") ||
								resultCategory.includes("公共") ||
								title.includes("community") ||
								title.includes("公共");
						} else if (
							searchCategory === "game" ||
							searchCategory === "publishing" ||
							searchCategory === "game publishing"
						) {
							categoryMatch =
								resultCategory.includes("game") ||
								resultCategory.includes("publishing") ||
								resultCategory.includes("遊戲") ||
								title.includes("game") ||
								title.includes("遊戲");
						}

						if (!categoryMatch) {
							console.log(
								`⚠️ Filtered out: ${result.title} (category mismatch in keyword search)`
							);
							return false;
						}
					}
					// If no keyword, accept all results from the category URL
				}

				// Additional keyword filtering if provided
				if (keyword && keyword.trim() !== "") {
					const searchKeyword = keyword.toLowerCase();
					const searchCategory = (category || "").toLowerCase();
					const title = (result.title || "").toLowerCase();
					const description = (result.description || "").toLowerCase();

					// Skip keyword filtering if the keyword is the same as the category
					// This handles cases where frontend sends category name as keyword
					const cleanKeyword = searchKeyword.trim();
					const cleanCategory = searchCategory.trim();

					const isKategoriSameAsKeyword =
						cleanKeyword === cleanCategory ||
						cleanKeyword === cleanCategory.replace(/\s+/g, "") ||
						cleanCategory.includes(cleanKeyword) ||
						cleanKeyword.includes(cleanCategory) ||
						(cleanKeyword === "art films" && cleanCategory === "art films") ||
						(cleanKeyword === "technology" &&
							cleanCategory === "technology design") ||
						(cleanKeyword === "technology design" &&
							cleanCategory === "technology design") ||
						(cleanKeyword === "public place" &&
							cleanCategory === "public place") ||
						(cleanKeyword === "game publishing" &&
							cleanCategory === "game publishing") ||
						(cleanKeyword === "art" && cleanCategory === "art films") ||
						(cleanKeyword === "music" && cleanCategory === "music") ||
						(cleanKeyword === "life" && cleanCategory === "life");

					if (
						!isKategoriSameAsKeyword &&
						!title.includes(searchKeyword) &&
						!description.includes(searchKeyword)
					) {
						console.log(`⚠️ Filtered out: ${result.title} (keyword mismatch)`);
						return false;
					}
				}

				console.log(`✅ Included: ${result.title}`);
				return true;
			});

			results.push(...filteredResults);
			idx += concurrency;

			// Delay between batches
			if (idx < projectUrls.length) {
				await new Promise((res) => setTimeout(res, 1000));
			}
		}

		await this.closeBrowser();

		console.log(`🎉 Final results: ${results.length} projects after filtering`);
		return results;
	}

	translateText(text, targetLanguage = "en") {
		if (!text || typeof text !== "string") {
			return text;
		}

		// If target language is Traditional Chinese, return original text
		if (targetLanguage === "zh-TW" || targetLanguage === "zh") {
			return text;
		}

		// Translation mappings for Traditional Chinese to English
		const translations = {
			// Common words
			專案: "Project",
			計劃: "Project",
			項目: "Project",
			產品: "Product",
			開發: "Development",
			設計: "Design",
			創新: "Innovation",
			科技: "Technology",
			技術: "Technology",
			智能: "Smart",
			智慧: "Smart",
			無線: "Wireless",
			電子: "Electronic",
			數位: "Digital",
			應用: "Application",
			系統: "System",
			裝置: "Device",
			設備: "Equipment",
			工具: "Tool",
			機器: "Machine",

			// Categories
			科技設計: "Tech & Design",
			音樂: "Music",
			藝術影視: "Art & Film",
			生活: "Lifestyle",
			公共在地: "Community",
			遊戲出版: "Games & Publishing",

			// Status terms
			成功: "Success",
			達成: "Achieved",
			進行中: "In Progress",
			已結束: "Ended",

			// Common descriptive terms
			創意: "Creative",
			便攜: "Portable",
			高效: "Efficient",
			環保: "Eco-friendly",
			實用: "Practical",
			美觀: "Beautiful",
			輕量: "Lightweight",
			耐用: "Durable",
			安全: "Safe",
			舒適: "Comfortable",

			// Units
			人: " people",
			天: " days",
			小時: " hours",
			分鐘: " minutes",

			// Action terms
			支持: "Support",
			贊助: "Back",
			募資: "Funding",
			集資: "Crowdfunding",

			// Time expressions
			還剩: "Remaining",
			剩餘: "Remaining",
			已募集: "Raised",
		};

		let translatedText = text;

		// Replace Traditional Chinese words with English equivalents
		for (const [chinese, english] of Object.entries(translations)) {
			translatedText = translatedText.replace(
				new RegExp(chinese, "g"),
				english
			);
		}

		// If no significant translation was made, provide category-based description
		if (translatedText === text || translatedText.length > text.length * 2) {
			// Extract project type based on common patterns
			if (text.includes("科技") || text.includes("技術"))
				return `Tech Project: ${text}`;
			if (text.includes("音樂") || text.includes("樂器"))
				return `Music Project: ${text}`;
			if (text.includes("藝術") || text.includes("影視"))
				return `Art Project: ${text}`;
			if (text.includes("生活") || text.includes("家居"))
				return `Lifestyle Project: ${text}`;
			if (text.includes("遊戲") || text.includes("出版"))
				return `Game/Publishing Project: ${text}`;
			if (text.includes("社區") || text.includes("公益"))
				return `Community Project: ${text}`;

			// Return original text if no pattern matches
			return text;
		}

		return translatedText;
	}

	translateCategory(category, targetLanguage = "en") {
		if (targetLanguage === "zh-TW" || targetLanguage === "zh") {
			return category;
		}

		const categoryTranslations = {
			科技設計: "Technology Design",
			音樂: "Music",
			藝術影視: "Art Films",
			生活: "Life",
			公共在地: "Public Place",
			遊戲出版: "Game Publishing",
			// English to standardized English
			Technology: "Technology Design",
			Tech: "Technology Design",
			"Tech & Design": "Technology Design",
			Art: "Art Films",
			Film: "Art Films",
			"Art & Film": "Art Films",
			Lifestyle: "Life",
			Community: "Public Place",
			Public: "Public Place",
			Games: "Game Publishing",
			Publishing: "Game Publishing",
			"Games & Publishing": "Game Publishing",
		};

		return categoryTranslations[category] || category;
	}
}

module.exports = FlyingVScraper;
