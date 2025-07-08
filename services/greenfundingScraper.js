const BaseScraper = require("./baseScraper");

class GreenFundingScraper extends BaseScraper {
	constructor() {
		super();
		this.baseUrl = "https://greenfunding.jp";
		this.categoryMap = {
			// Main categories based on the category IDs found
			gadgets: "27",
			ガジェット: "27",
			technology: "38",
			テクノロジー: "38",
			iot: "38",
			miscellaneous: "41",
			雑貨: "41",
			audio: "45",
			オーディオ: "45",
			outdoor: "49",
			アウトドア: "49",
			car: "44",
			motorcycle: "44",
			車: "44",
			バイク: "44",
			fashion: "16",
			ファッション: "16",
			sports: "30",
			スポーツ: "30",
			social: "6",
			社会貢献: "6",
			contribution: "6",
			art: "23",
			アート: "23",
			publication: "25",
			出版: "25",
			publishing: "25",
			regional: "39",
			地域活性化: "39",
			entertainment: "40",
			エンタメ: "40",
			music: "26",
			音楽: "26",
			food: "29",
			フード: "29",
			video: "24",
			film: "24",
			映像: "24",
			映画: "24",
			event: "32",
			イベント: "32",
			idol: "35",
			アイドル: "35",
			photo: "42",
			写真: "42",
			photography: "42",
			anime: "46",
			アニメ: "46",
			railway: "43",
			鉄道: "43",
			pets: "50",
			ペット: "50",
			taiwan: "51",
			台湾: "51",
			others: "33",
			その他: "33",
			// Add "all" as a special case
			all: null,
		};
	}

	getName() {
		return "GreenFunding";
	}

	getCategories() {
		return {
			"Technology & Innovation": {
				gadgets: "Gadgets",
				technology: "Technology/IoT",
				miscellaneous: "Miscellaneous Goods",
				audio: "Audio",
				outdoor: "Outdoor",
				car: "Car/Motorcycle",
			},
			"Creative & Lifestyle": {
				fashion: "Fashion",
				sports: "Sports",
				art: "Art",
				publication: "Publication",
				entertainment: "Entertainment",
				music: "Music",
				food: "Food",
				video: "Video/Film",
				event: "Event",
				idol: "Idol",
				photo: "Photography",
				anime: "Anime",
			},
			"Community & Others": {
				social: "Contribution to Society",
				regional: "Regional Revitalization",
				railway: "Railway",
				pets: "Pets",
				taiwan: "Taiwan",
				others: "Others",
			},
		};
	}

	async extractProjects() {
		// Wait for page to load
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Scroll to load more projects - improved scrolling
		await this.page.evaluate(async () => {
			await new Promise((resolve) => {
				let totalHeight = 0;
				const distance = 200;
				let scrollCount = 0;
				const maxScrolls = 20; // Prevent infinite scrolling

				const timer = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					totalHeight += distance;
					scrollCount++;

					// Stop if we've reached the bottom or max scrolls
					if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
						clearInterval(timer);
						resolve();
					}
				}, 200); // Slower scrolling for better loading
			});
		});

		// Wait longer for dynamic content to load
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// Extract project URLs with improved selectors
		const projectUrls = await this.page.evaluate(() => {
			const urlSet = new Set();

			// Enhanced method: Look for project links with better patterns
			const selectors = [
				'a[href*="/projects/"]',
				'a[href*="/lab/projects/"]',
				'a[href*="/kibidango/projects/"]',
				'[class*="project"] a[href*="/projects/"]',
				'[class*="card"] a[href*="/projects/"]',
				'[class*="item"] a[href*="/projects/"]',
				".project-card a",
				".project-item a",
				'.card a[href*="/projects/"]',
			];

			console.log("Searching for project links...");

			selectors.forEach((selector) => {
				const links = document.querySelectorAll(selector);
				console.log(`Selector "${selector}" found ${links.length} links`);

				links.forEach((link) => {
					if (link.href && link.href.includes("/projects/")) {
						// Filter out non-project URLs more thoroughly
						if (
							!link.href.includes("/activities/") &&
							!link.href.includes("/supports/") &&
							!link.href.includes("/comments/") &&
							!link.href.includes("/updates/") &&
							link.href.match(/\/projects\/\d+/)
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
				// More precise regex to match project URLs
				if (
					href.match(/\/(?:lab\/|kibidango\/)?projects\/\d+(?:\/|\?|$)/) &&
					!href.includes("/activities/") &&
					!href.includes("/supports/") &&
					!href.includes("/comments/") &&
					!href.includes("/updates/")
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
						timeout: 10000, // Reduced timeout to 10 seconds
					});
					loaded = true;
				} catch (error) {
					retries--;
					if (retries > 0) {
						console.log(`Retrying ${projectUrl} (${retries} attempts left)...`);
						await new Promise((resolve) => setTimeout(resolve, 2000));
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

			// Get all text for pattern matching
			const allText = document.body.innerText;

			// Extract project title - look for schema.org structured data first
			let title = "";
			let originalTitle = "";

			// Method 1: Try structured data
			const scriptTags = Array.from(
				document.querySelectorAll('script[type="application/ld+json"]')
			);
			for (const script of scriptTags) {
				try {
					const data = JSON.parse(script.textContent);
					if (Array.isArray(data)) {
						for (const item of data) {
							if (item["@type"] === "Product" && item.name) {
								title = item.name.replace(/\n/g, " ").trim();
								break;
							}
						}
					} else if (data["@type"] === "Product" && data.name) {
						title = data.name.replace(/\n/g, " ").trim();
					}
					if (title) break;
				} catch (e) {
					// Continue if JSON parsing fails
				}
			}

			// Method 2: Try meta property og:title
			if (!title) {
				title = getAttr('meta[property="og:title"]', "content") || "";
				if (title && title.includes(" | ")) {
					title = title.split(" | ")[0].trim();
				}
			}

			// Method 3: Try page title but exclude generic site title
			if (!title) {
				const pageTitle = document.title || "";
				if (
					pageTitle &&
					!pageTitle.includes("未来を企画する") &&
					pageTitle.includes(" | ")
				) {
					title = pageTitle.split(" | ")[0].trim();
				}
			}

			// Method 4: Look for specific title selectors
			if (!title) {
				const titleSelectors = [
					".project-title",
					'[class*="project"] h1',
					'h1[class*="title"]',
					".title h1",
				];

				for (const selector of titleSelectors) {
					const element = document.querySelector(selector);
					if (
						element &&
						element.textContent.trim() &&
						!element.textContent.includes("未来を企画する")
					) {
						title = element.textContent.trim();
						break;
					}
				}
			}

			originalTitle = title;

			// Description
			let description =
				getAttr('meta[name="description"]', "content") ||
				getAttr('meta[property="og:description"]', "content") ||
				"";

			// Image
			const imageUrl = getAttr('meta[property="og:image"]', "content") || "";

			// Extract project owner/creator - improved logic
			let projectOwner = "";
			let ownerWebsite = "";
			let ownerSns = "";
			let contactInfo = "";

			// Method 1: Look for structured data first
			for (const script of scriptTags) {
				try {
					const data = JSON.parse(script.textContent);
					if (Array.isArray(data)) {
						for (const item of data) {
							if (item["@type"] === "Product" && item.brand) {
								projectOwner = item.brand;
								break;
							}
						}
					} else if (data["@type"] === "Product" && data.brand) {
						projectOwner = data.brand;
					}
					if (projectOwner) break;
				} catch (e) {
					// Continue if JSON parsing fails
				}
			}

			// Method 2: Look for specific owner elements in sidebar (more precise)
			if (!projectOwner) {
				const sidebar =
					document.querySelector(".l-sidebar") ||
					document.querySelector(".project_sidebar");
				if (sidebar) {
					// Look for specific patterns and elements
					const ownerElements = sidebar.querySelectorAll("*");

					for (const element of ownerElements) {
						const text = element.textContent.trim();

						// Look for company names, secretariats, or project names (but keep them concise)
						if (text.length > 3 && text.length < 80) {
							// Match specific patterns for Japanese companies/organizations
							if (
								text.includes("株式会社") ||
								text.includes("有限会社") ||
								text.includes("合同会社") ||
								text.includes("事務局") ||
								text.includes("secretariat") ||
								text.includes("プロジェクト")
							) {
								// Make sure it's not part of a larger text block
								const parentText = element.parentElement
									? element.parentElement.textContent.trim()
									: "";
								if (parentText.length - text.length < 50) {
									// Parent is not much larger
									projectOwner = text;
									break;
								}
							}
						}
					}
				}
			}

			// Method 3: Pattern matching in sidebar text for specific owner patterns
			if (!projectOwner) {
				const sidebarText =
					getText(".l-sidebar") || getText(".project_sidebar");

				// Look for company name patterns
				const patterns = [
					/([^\n\r]*(?:株式会社|有限会社|合同会社)[^\n\r]*)/,
					/([^\n\r]*事務局[^\n\r]*)/,
					/([^\n\r]*secretariat[^\n\r]*)/i,
					/([^\n\r]*project[^\n\r]*(?:team|チーム)?)/i,
				];

				for (const pattern of patterns) {
					const match = sidebarText.match(pattern);
					if (match && match[1].trim() && match[1].trim().length < 80) {
						projectOwner = match[1].trim();
						break;
					}
				}
			}

			// Method 4: Look for contact/originator elements
			if (!projectOwner) {
				const contactElements = document.querySelectorAll(
					'[class*="contact"], [class*="originator"], [class*="proposer"], [class*="creator"]'
				);
				for (const element of contactElements) {
					const text = element.textContent.trim();
					if (
						text &&
						text.length > 3 &&
						text.length < 80 &&
						!text.toLowerCase().includes("button") &&
						!text.toLowerCase().includes("contact us")
					) {
						projectOwner = text;
						break;
					}
				}
			}

			// Extract real SNS links (not sharing links)
			const allLinks = document.querySelectorAll("a[href]");
			const realSnsLinks = [];
			const ownerWebsites = [];

			for (const link of allLinks) {
				const href = link.href;

				// Check for real SNS accounts (not sharing links)
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
					!href.includes("greenfunding") &&
					!href.includes("GREENFUNDING")
				) {
					realSnsLinks.push(href);
				}

				// Look for owner websites (exclude platform and sharing links)
				else if (
					href.startsWith("http") &&
					!href.includes("greenfunding.jp") &&
					!href.includes("twitter.com") &&
					!href.includes("facebook.com") &&
					!href.includes("instagram.com") &&
					!href.includes("youtube.com") &&
					!href.includes("share") &&
					!href.includes("?url=")
				) {
					ownerWebsites.push(href);
				}
			}

			// Set SNS and website
			if (realSnsLinks.length > 0) {
				ownerSns = realSnsLinks.slice(0, 3).join(", "); // Limit to 3 SNS links
			}

			if (ownerWebsites.length > 0) {
				ownerWebsite = ownerWebsites[0]; // Take the first relevant website
			}

			// Check for contact availability
			const contactButton = document.querySelector(
				'[class*="contact"], .contact-button, a[href*="contact"]'
			);
			if (contactButton) {
				contactInfo = "Contact available via platform";
			}

			// Extract funding information
			let currentAmount = "";
			let goalAmount = "";
			let achievementRate = "";

			// Look for specific funding numbers in sidebar
			const sidebarText = getText(".l-sidebar") || getText(".project_sidebar");

			// Extract support total amount
			const supportTotalMatch = sidebarText.match(/支援総額\s*([¥\d,]+)/);
			if (supportTotalMatch) {
				currentAmount = supportTotalMatch[1];
			}

			// Extract goal amount
			const goalMatch = sidebarText.match(/目標([¥\d,]+)/);
			if (goalMatch) {
				goalAmount = goalMatch[1];
			}

			// Calculate achievement rate if we have both amounts
			if (currentAmount && goalAmount) {
				const current = parseInt(currentAmount.replace(/[¥,]/g, ""));
				const goal = parseInt(goalAmount.replace(/[¥,]/g, ""));
				if (goal > 0) {
					const rate = Math.round((current / goal) * 100);
					achievementRate = rate + "%";
				}
			}

			// Look for percentage directly in the text
			if (!achievementRate) {
				const percentMatch = allText.match(/(\d+(?:\.\d+)?)\s*%/);
				if (percentMatch) {
					achievementRate = percentMatch[1] + "%";
				}
			}

			// Extract supporters count
			let supporters = "";
			const supportersMatch =
				sidebarText.match(/支援人数\s*(\d+)\s*人/) ||
				allText.match(/(\d+)\s*人.*支援/);
			if (supportersMatch) {
				supporters = supportersMatch[1] + " people";
			}

			// Status determination - look for specific status indicators
			let status = "Live";
			let projectStatus = "Current";

			// Check for ended project indicators
			if (
				allText.includes("このプロジェクトは終了しました") ||
				allText.includes("プロジェクトは終了") ||
				allText.includes("終了しました") ||
				getText(".project_sidebar_dashboard").includes("終了")
			) {
				status = "Ended";
				projectStatus = "Completed";
			}
			// Check for successful completion
			else if (
				allText.includes("SUCCESS") ||
				allText.includes("達成しました") ||
				(achievementRate && parseInt(achievementRate) >= 100)
			) {
				status = "Successful";
				projectStatus = "Completed";
			}
			// Check for active project
			else if (
				allText.includes("募集中") ||
				allText.includes("実施中") ||
				allText.includes("進行中")
			) {
				status = "Live";
				projectStatus = "Current";
			}

			// Extract dates
			let startDate = "";
			let endDate = "";

			// Look for date patterns in sidebar
			const dateMatch = sidebarText.match(
				/(\d{4})年(\d{1,2})月(\d{1,2})日まで/
			);
			if (dateMatch) {
				endDate = `${dateMatch[1]}-${dateMatch[2].padStart(
					2,
					"0"
				)}-${dateMatch[3].padStart(2, "0")}`;
			}

			// Days left extraction
			let daysLeft = "";
			if (status === "Live") {
				const daysMatch =
					allText.match(/残り(\d+)日/) || allText.match(/(\d+)日残り/);
				if (daysMatch) {
					daysLeft = daysMatch[1];
				} else if (allText.includes("終了")) {
					daysLeft = "0";
				}
			}

			// Extract category from breadcrumb or tags - improved detection
			let category = "";

			// First, try to get category from URL parameters (most reliable)
			const urlParams = new URLSearchParams(window.location.search);
			const categoryId = urlParams.get("category_id");
			if (categoryId) {
				const categoryIdMap = {
					27: "ガジェット",
					38: "テクノロジー",
					41: "雑貨",
					45: "オーディオ",
					49: "アウトドア",
					44: "車",
					16: "ファッション",
					30: "スポーツ",
					6: "社会貢献",
					23: "アート",
					25: "出版",
					39: "地域活性化",
					40: "エンタメ",
					26: "音楽",
					29: "フード",
					24: "映像",
					32: "イベント",
					35: "アイドル",
					42: "写真",
					46: "アニメ",
					43: "鉄道",
					50: "ペット",
					51: "台湾",
					33: "その他",
				};
				category = categoryIdMap[categoryId] || "";
			}

			// If not found, try breadcrumb/tags (fallback)
			if (!category) {
				const categoryElements = document.querySelectorAll(
					'nav a, .breadcrumb a, [class*="tag"], [class*="category"]'
				);
				for (const element of categoryElements) {
					const text = element.textContent.trim();
					// Look for Japanese category names
					if (
						text &&
						text.length < 20 &&
						!text.includes("ホーム") &&
						!text.includes("プロジェクト") &&
						!text.includes("GREENFUNDING") &&
						(text.includes("ガジェット") ||
							text.includes("テクノロジー") ||
							text.includes("ファッション") ||
							text.includes("アート") ||
							text.includes("IoT") ||
							text.includes("雑貨") ||
							text.includes("音楽") ||
							text.includes("フード") ||
							text.includes("アウトドア") ||
							text.includes("車") ||
							text.includes("スポーツ") ||
							text.includes("社会貢献") ||
							text.includes("出版") ||
							text.includes("地域活性化") ||
							text.includes("エンタメ") ||
							text.includes("映像") ||
							text.includes("イベント") ||
							text.includes("アイドル") ||
							text.includes("写真") ||
							text.includes("アニメ") ||
							text.includes("鉄道") ||
							text.includes("ペット") ||
							text.includes("台湾") ||
							text.includes("その他"))
					) {
						category = text;
						break;
					}
				}
			}

			// Return normalized format
			return {
				target_site: "GreenFunding",
				market: "GreenFunding",
				status: status,
				url: url,
				image_url: imageUrl,
				title: title,
				original_title: originalTitle,
				project_owner: projectOwner,
				owner_website: ownerWebsite,
				owner_sns: ownerSns,
				owner_country: "Japan",
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
				platform: "GreenFunding",
				platformUrl: "https://greenfunding.jp/",
				scrapedAt: new Date().toISOString(),
				fundingAmount: currentAmount,
				backers: supporters,
				image: imageUrl,
			};
		});

		return data;
	}

	buildSearchUrl(category, keyword) {
		// Handle "all" category
		if (category === "all" || !category) {
			if (keyword && keyword.trim()) {
				return `${this.baseUrl}/portals/search?q=${encodeURIComponent(
					keyword
				)}`;
			}
			return `${this.baseUrl}/portals/search`;
		}

		// Normalize category - handle both key names from UI and full category names
		let normalizedCategory = category?.toLowerCase();

		// Get category ID
		const categoryId = this.categoryMap[normalizedCategory];

		if (categoryId) {
			let url = `${this.baseUrl}/portals/search?category_id=${categoryId}`;
			if (keyword && keyword.trim()) {
				url += `&q=${encodeURIComponent(keyword)}`;
			}
			return url;
		} else {
			// Fallback to keyword search
			const searchTerm = keyword || category;
			return `${this.baseUrl}/portals/search?q=${encodeURIComponent(
				searchTerm
			)}`;
		}
	}

	async scrape(category, keyword, options = {}) {
		const targetLanguage = options.language || "en";
		const maxResults = options.maxResults || 50; // Increased default from 20 to 50

		if (options.language) this.setLanguage(options.language);
		await this.initBrowser();
		const url = this.buildSearchUrl(category, keyword);

		console.log(
			`🔍 Searching GreenFunding for category: "${category}", keyword: "${keyword}"`
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
		const batchSize = 3; // Slightly increased batch size for efficiency

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

			// Improved filtering logic
			const filteredResults = batchResults.filter((result) => {
				if (!result) return false;

				// Force correct category based on search URL
				if (category && category !== "all") {
					const searchCategory = category.toLowerCase();

					// Always set the correct category based on what we searched for
					const categoryNameMap = {
						gadgets: "ガジェット",
						ガジェット: "ガジェット",
						technology: "テクノロジー",
						テクノロジー: "テクノロジー",
						miscellaneous: "雑貨",
						雑貨: "雑貨",
						audio: "オーディオ",
						オーディオ: "オーディオ",
						outdoor: "アウトドア",
						アウトドア: "アウトドア",
						car: "車",
						車: "車",
						fashion: "ファッション",
						ファッション: "ファッション",
						sports: "スポーツ",
						スポーツ: "スポーツ",
						social: "社会貢献",
						社会貢献: "社会貢献",
						art: "アート",
						アート: "アート",
						publication: "出版",
						出版: "出版",
						regional: "地域活性化",
						地域活性化: "地域活性化",
						entertainment: "エンタメ",
						エンタメ: "エンタメ",
						music: "音楽",
						音楽: "音楽",
						food: "フード",
						フード: "フード",
						video: "映像",
						映像: "映像",
						event: "イベント",
						イベント: "イベント",
						idol: "アイドル",
						アイドル: "アイドル",
						photo: "写真",
						写真: "写真",
						anime: "アニメ",
						アニメ: "アニメ",
						railway: "鉄道",
						鉄道: "鉄道",
						pets: "ペット",
						ペット: "ペット",
						taiwan: "台湾",
						台湾: "台湾",
						others: "その他",
						その他: "その他",
					};

					// Override the category with the correct one from our search
					result.category = categoryNameMap[searchCategory] || searchCategory;
				}

				// More lenient filtering - if we got results from the category page, trust them
				// Only do strict keyword filtering if explicitly provided and different from category
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

			// Add a delay between batches to be respectful
			if (i + batchSize < urlsToScrape.length) {
				await new Promise((resolve) => setTimeout(resolve, 1500)); // Slightly reduced delay
			}
		}

		await this.closeBrowser();

		console.log(`📊 Final results: ${results.length} projects after filtering`);
		return results;
	}

	// Normalize category name for consistent output
	normalizeCategory(category) {
		if (!category) return category;

		const categoryTranslations = {
			ガジェット: "Gadgets",
			テクノロジー: "Technology/IoT",
			雑貨: "Miscellaneous Goods",
			オーディオ: "Audio",
			アウトドア: "Outdoor",
			車: "Car/Motorcycle",
			バイク: "Car/Motorcycle",
			ファッション: "Fashion",
			スポーツ: "Sports",
			社会貢献: "Contribution to Society",
			アート: "Art",
			出版: "Publication",
			地域活性化: "Regional Revitalization",
			エンタメ: "Entertainment",
			音楽: "Music",
			フード: "Food",
			映像: "Video/Film",
			映画: "Video/Film",
			イベント: "Event",
			アイドル: "Idol",
			写真: "Photography",
			アニメ: "Anime",
			鉄道: "Railway",
			ペット: "Pets",
			台湾: "Taiwan",
			その他: "Others",
		};

		return categoryTranslations[category] || category;
	}
}

module.exports = GreenFundingScraper;
