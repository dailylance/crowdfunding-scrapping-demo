const BaseScraper = require("./baseScraper");

class MakuakeScraper extends BaseScraper {
	constructor() {
		super();
		this.baseUrl = "https://www.makuake.com";
		this.categoryMap = {
			product: "product",
			fashion: "fashion",
			food: "food",
			"restaurants and bars": "restaurant-bar",
			technology: "technology",
			"cosmetics and beauty": "beauty",
			"art and photography": "art-photo",
			"movies and videos": "movie-video",
			"anime and manga": "anime-manga",
			music: "music",
			game: "game",
			"theatre and performance": "theatre-performance",
			"comedy/entertainment": "entertainment",
			"publishing and journalism": "publishing-journalism",
			education: "education",
			sports: "sports",
			startups: "startup",
			"regional revitalization": "regional",
			"contribution to society": "contribution",
			"around the world": "world",
			// Add "all" as a special case
			all: null,
		};
	}

	getCategories() {
		return Object.keys(this.categoryMap);
	}

	async extractProjectsFromXHR(category) {
		// Intercept XHR/fetch requests to get project data as JSON
		const apiResults = [];
		await this.page.setRequestInterception(true);
		this.page.on("request", (req) => {
			req.continue();
		});
		this.page.on("response", async (response) => {
			const url = response.url();
			// Look for XHR/fetch to project list API (adjust pattern as needed)
			if (url.includes("/v2/projects?") || url.includes("/api/projects?")) {
				try {
					const json = await response.json();
					if (json && Array.isArray(json.projects)) {
						apiResults.push(...json.projects);
					}
				} catch {}
			}
		});
		// Go to the category page and wait for XHR
		const url = this.buildSearchUrl(category);
		await this.page.goto(url, { waitUntil: "networkidle2", timeout: 40000 });
		await new Promise((res) => setTimeout(res, 5000));
		await this.page.setRequestInterception(false);
		// Map API results to expected format
		return apiResults.slice(0, 20).map((p) => ({
			title: p.title || "",
			url: p.project_url || "",
			image: p.main_image_url || "",
			fundingAmount: p.raised || "",
			backers: p.supporter_count || "",
			category: p.category_name || "",
			ownerName: p.owner_name || "",
			ownerProfile: p.owner_profile_url || "",
			ownerImage: p.owner_image_url || "",
			contactInfo: {}, // Not in API, can be filled by visiting project page if needed
		}));
	}

	async extractProjects() {
		// Wait only 1 second for page to load
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Quick scroll without auto-scroll function
		await this.page.evaluate(async () => {
			window.scrollTo(0, document.body.scrollHeight);
			await new Promise((resolve) => setTimeout(resolve, 500));
		});

		// Extract project URLs immediately
		const projectUrls = await this.page.evaluate(() => {
			const anchors = Array.from(
				document.querySelectorAll('a[href*="/project/"]')
			);
			const urls = anchors
				.map((a) =>
					a.href.startsWith("http")
						? a.href
						: `https://www.makuake.com${a.getAttribute("href")}`
				)
				.filter((url) => url.includes("/project/") && !url.includes("#"))
				.filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates

			return urls.slice(0, 10); // Reduce to 10 for faster testing
		});

		console.log(`Found ${projectUrls.length} project URLs`);
		return projectUrls;
	}

	async extractProjectDetails(projectUrl, targetLanguage = "en") {
		const page = await this.browser.newPage();
		try {
			// Faster page load settings
			await page.goto(projectUrl, {
				waitUntil: "domcontentloaded",
				timeout: 12000,
			});
			await new Promise((resolve) => setTimeout(resolve, 800));

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

				// Description - from meta tag or first paragraph
				let description =
					getAttr('meta[name="description"]', "content") ||
					getAttr('meta[property="og:description"]', "content") ||
					"";
				if (!description) {
					description =
						getText(".project-description p") ||
						getText(".story p") ||
						getText("p");
				}

				// Main image
				let image = getAttr('meta[property="og:image"]', "content") || "";
				if (!image) {
					image = getAttr('img[src*="/upload/project/"]', "src") || "";
				}

				// Get all text for pattern matching
				const allText = document.body.innerText;

				// Extract funding amount from the summary panel
				let fundingAmount = "";
				// Look for the main funding display in the right panel
				const fundingText = allText.match(
					/応援購入総額\s*([0-9,]+)\s*円|Total support purchase amount\s*([0-9,]+)\s*yen/i
				);
				if (fundingText) {
					fundingAmount = "￥" + (fundingText[1] || fundingText[2]);
				} else {
					// Fallback: look for any large number followed by yen
					const yenMatch = allText.match(/([0-9,]{4,})\s*円|￥([0-9,]{4,})/);
					if (yenMatch) {
						fundingAmount = "￥" + (yenMatch[1] || yenMatch[2]);
					}
				}

				// Target amount
				let targetAmount = "";
				const targetMatch = allText.match(
					/目標金額\s*([0-9,]+)\s*円|Target amount\s*([0-9,]+)\s*yen/i
				);
				if (targetMatch) {
					targetAmount = "￥" + (targetMatch[1] || targetMatch[2]);
				}

				// Backers/Supporters
				let backers = "";
				const supporterMatch = allText.match(
					/サポーター\s*([0-9,]+)\s*人|Supporter\s*([0-9,]+)\s*people/i
				);
				if (supporterMatch) {
					backers = supporterMatch[1] || supporterMatch[2];
				}

				// Progress percentage
				let progress = "";
				const progressMatch = allText.match(/([0-9,]+)%/);
				if (progressMatch) {
					progress = progressMatch[1] + "%";
				}

				// Days left
				let daysLeft = "";
				const daysMatch = allText.match(
					/残り\s*([0-9]+)\s*日|([0-9]+)\s*days?\s*left/i
				);
				if (daysMatch) {
					daysLeft = (daysMatch[1] || daysMatch[2]) + " days";
				}

				// Status - more accurate detection
				let status = "active";
				if (
					allText.includes("このプロジェクトは終了しました") ||
					allText.includes("project ended") ||
					allText.includes("Available") ||
					allText.includes("on sale at the Makuake STORE")
				) {
					status = "ended";
				}
				if (allText.includes("Success!") || allText.includes("達成")) {
					status = "successful";
				}

				// Category
				let category = "";
				const catEl = document.querySelector(
					'a[href*="/discover/categories/"]'
				);
				if (catEl) category = catEl.innerText.trim();

				// Owner/Creator information - much more precise extraction
				let ownerName = "";
				let ownerProfile = "";
				let ownerImage = "";

				// Method 1: Extract from member profile link's image alt text
				const ownerEl = document.querySelector('a[href*="/member/index/"]');
				if (ownerEl) {
					ownerProfile = ownerEl.href;

					// Try to get name from image alt text
					const imgEl = ownerEl.querySelector("img");
					if (imgEl && imgEl.alt && imgEl.alt.trim()) {
						ownerName = imgEl.alt.trim();
						ownerImage = imgEl.src; // Also set the image
					}
				}

				// Method 2: Look for specific company representative text patterns
				if (!ownerName) {
					const allElements = document.querySelectorAll("*");
					for (const el of allElements) {
						const text = el.textContent;
						if (text && text.length < 100) {
							// Look for "会社名 代表 名前" pattern
							const repMatch = text.match(
								/([^\s]+株式会社|[^\s]+会社)\s*代表\s*([^\s\n]+)/
							);
							if (repMatch && repMatch[2]) {
								ownerName = repMatch[2].trim();
								break;
							}

							// Look for just "代表 名前" pattern
							const repMatch2 = text.match(/代表\s*([^\s\n]{2,})/);
							if (repMatch2 && repMatch2[1]) {
								ownerName = repMatch2[1].trim();
								break;
							}
						}
					}
				}

				// Method 3: Look for specific selectors that might contain creator info
				if (!ownerName) {
					const creatorSelectors = [
						".owner-info_name",
						".project-executor .name",
						".project-owner .name",
						".executor-info .name",
						".member-info .name",
						'[data-testid="project-executor"]',
						".project-detail-owner",
						".creator-name",
					];

					for (const selector of creatorSelectors) {
						const element = document.querySelector(selector);
						if (element && element.textContent && element.textContent.trim()) {
							ownerName = element.textContent.trim();
							break;
						}
					}
				}

				// Method 4: Look for company names in smaller text chunks
				if (!ownerName) {
					const allElements = document.querySelectorAll("*");
					for (const el of allElements) {
						const text = el.textContent;
						if (text && text.length < 150 && text.includes("株式会社")) {
							const companyMatch = text.match(
								/([^\s]+)\s*株式会社|株式会社\s*([^\s]+)/
							);
							if (companyMatch) {
								ownerName = (companyMatch[1] || companyMatch[2]).trim();
								break;
							}
						}
					}
				}

				// Clean up the extracted name
				if (ownerName) {
					// Remove common unwanted content and limit length
					ownerName = ownerName
						.split("\n")[0] // Take only first line
						.replace(
							/\s*(実行者にメッセージ|メッセージ|最新の活動レポート|ストーリー|https?:\/\/|に質問|活動レポート).*$/i,
							""
						)
						.replace(
							/\s*(の現場メンバー|チーム|ファーム|プロジェクト|について|マーク).*$/i,
							""
						)
						.trim();

					// Limit to reasonable length (person/company names shouldn't be super long)
					if (ownerName.length > 50) {
						ownerName = ownerName.substring(0, 50).trim();
					}

					// Final validation - clear if it contains product-specific terms
					const unwantedPatterns = [
						/プライムフェクトマスク/,
						/純度99\.99%/,
						/銀イオン/,
						/の最小サイズ/,
						/長財布/,
						/フィルター/,
						/ウイルス/,
						/マスク/,
						/実行者/,
					];

					for (const pattern of unwantedPatterns) {
						if (pattern.test(ownerName)) {
							ownerName = "";
							break;
						}
					}
				}

				// Owner image (should already be set in Method 1, but fallback)
				if (!ownerImage) {
					const ownerImgEl = document.querySelector(
						'a[href*="/member/index/"] img, .project-owner img, .executor img'
					);
					if (ownerImgEl) ownerImage = ownerImgEl.src;
				}

				// Contact information - improved extraction
				const contactInfo = {
					email: "",
					twitter: "",
					facebook: "",
					instagram: "",
					website: "",
					phone: "",
				};

				// Email
				const emailEl = document.querySelector('a[href^="mailto:"]');
				if (emailEl) contactInfo.email = emailEl.href.replace("mailto:", "");

				// Social links - look for actual profiles, not share buttons
				const allLinks = Array.from(document.querySelectorAll("a[href]"));
				allLinks.forEach((link) => {
					const href = link.href;
					// Skip Makuake share buttons
					if (
						href.includes("makuake.com") ||
						href.includes("/share") ||
						href.includes("/sharer")
					) {
						return;
					}

					if (href.includes("twitter.com") && !contactInfo.twitter) {
						contactInfo.twitter = href;
					}
					if (href.includes("facebook.com") && !contactInfo.facebook) {
						contactInfo.facebook = href;
					}
					if (href.includes("instagram.com") && !contactInfo.instagram) {
						contactInfo.instagram = href;
					}
					if (
						href.startsWith("http") &&
						!href.includes("twitter.com") &&
						!href.includes("facebook.com") &&
						!href.includes("instagram.com") &&
						!contactInfo.website
					) {
						contactInfo.website = href;
					}
				});

				return {
					title,
					description: description.substring(0, 500), // Limit description length
					url: window.location.href,
					image,
					fundingAmount,
					targetAmount,
					backers,
					category,
					creator: ownerName,
					progress,
					daysLeft,
					status,
					platform: "Makuake",
					platformUrl: "https://www.makuake.com/",
					scrapedAt: new Date().toISOString(),
					ownerName,
					ownerProfile,
					ownerImage,
					contactInfo,
				};
			});

			// Apply translation and formatting
			if (data && targetLanguage === "en") {
				data.title = this.translateText(data.title, targetLanguage);
				data.description = this.translateText(data.description, targetLanguage);
				data.category = this.translateCategory(data.category, targetLanguage);
				data.creator = this.translateText(data.creator, targetLanguage);

				// Format amounts
				if (data.fundingAmount && data.fundingAmount.includes("￥")) {
					data.fundingAmount = data.fundingAmount + " JPY";
				}
				if (data.targetAmount && data.targetAmount.includes("￥")) {
					data.targetAmount = data.targetAmount + " JPY";
				}

				// Format backers
				if (data.backers && !data.backers.includes("people")) {
					data.backers = data.backers + " people";
				}
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
		// Handle "all" category by using a broad category or default to food category
		if (category === "all" || !category) {
			if (keyword) {
				// For "all" category with keyword, use the food category as it's most common
				// Or try to match keyword to a category
				const keywordLower = keyword.toLowerCase();
				if (keywordLower.includes("food") || keywordLower.includes("料理")) {
					return `${this.baseUrl}/discover/categories/food?sort=popular`;
				}
				if (
					keywordLower.includes("fashion") ||
					keywordLower.includes("ファッション")
				) {
					return `${this.baseUrl}/discover/categories/fashion?sort=popular`;
				}
				if (
					keywordLower.includes("tech") ||
					keywordLower.includes("technology")
				) {
					return `${this.baseUrl}/discover/categories/technology?sort=popular`;
				}
				// Default to food category for generic searches
				return `${this.baseUrl}/discover/categories/food?sort=popular`;
			} else {
				// Default to popular projects from all categories (use fashion as it has many projects)
				return `${this.baseUrl}/discover/categories/fashion?sort=popular`;
			}
		}

		const cat = this.categoryMap[category?.toLowerCase()] || "";
		if (cat) {
			// Category URL (keywords don't work well in category URLs on Makuake)
			return `${this.baseUrl}/discover/categories/${cat}?sort=popular`;
		} else if (keyword) {
			// If category doesn't exist, default to food category
			return `${this.baseUrl}/discover/categories/food?sort=popular`;
		} else {
			// Fallback: fashion category (has many active projects)
			return `${this.baseUrl}/discover/categories/fashion?sort=popular`;
		}
	}

	async scrape(category, keyword, options = {}) {
		// Set default language to English, allow override to Japanese
		const targetLanguage = options.language || "en";

		if (options.language) this.setLanguage(options.language);
		await this.initBrowser();
		const url = this.buildSearchUrl(category, keyword);
		await this.page.goto(url, {
			waitUntil: "domcontentloaded",
			timeout: 15000,
		});
		await new Promise((res) => setTimeout(res, 500)); // Reduced wait time
		const projectUrls = await this.extractProjects();

		// Optimized concurrency for stable extraction
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
			results.push(...batchResults.filter(Boolean));
			idx += concurrency;

			// Small delay between batches to avoid overwhelming the server
			if (idx < projectUrls.length) {
				await new Promise((res) => setTimeout(res, 1000));
			}
		}
		await this.closeBrowser();
		return results;
	}

	translateText(text, targetLanguage = "en") {
		if (!text || typeof text !== "string") {
			return text;
		}

		// If target language is Japanese, return original text
		if (targetLanguage === "ja") {
			return text;
		}

		// Translation mappings for Japanese to English
		const translations = {
			// Common words
			プロジェクト: "Project",
			開発: "Development",
			制作: "Production",
			支援: "Support",
			応援: "Support",
			新: "New",
			限定: "Limited",
			先行: "Advance",
			予約: "Reservation",
			販売: "Sale",
			公開: "Release",
			初: "First",
			最新: "Latest",
			完全: "Complete",
			無料: "Free",
			有料: "Paid",
			オリジナル: "Original",
			スペシャル: "Special",

			// Wallet/Fashion specific terms
			長財布: "Long Wallet",
			財布: "Wallet",
			サイズ: "Size",
			最小: "Smallest",
			大容量: "Large Capacity",
			使いやすさ: "Usability",
			追求: "Pursuit",
			日本製: "Made in Japan",
			革: "Leather",
			本革: "Genuine Leather",
			品質: "Quality",
			職人: "Craftsman",
			手作り: "Handmade",
			エプロン: "Apron",
			ワンピース: "Dress",

			// Common descriptive words
			美しく: "Beautifully",
			心地よく: "Comfortably",
			上質: "High Quality",
			快適: "Comfortable",
			便利: "Convenient",
			暮らし: "Lifestyle",
			生活: "Living",
			日常: "Daily Life",
			家事: "Housework",
			外出: "Going Out",

			// Categories
			ファッション: "Fashion",
			テクノロジー: "Technology",
			フード: "Food",
			料理: "Food",
			レストラン: "Restaurant",
			ゲーム: "Game",
			音楽: "Music",
			映画: "Movie",
			映像: "Video",
			アニメ: "Anime",
			漫画: "Manga",
			本: "Book",
			書籍: "Book",
			アート: "Art",
			写真: "Photography",
			教育: "Education",
			スポーツ: "Sports",
			美容: "Beauty",
			コスメ: "Cosmetics",
			健康: "Health",
			環境: "Environment",
			地域: "Regional",
			復興: "Revitalization",
			社会: "Society",
			貢献: "Contribution",

			// Common phrases
			家事: "Housework",
			外出: "Going out",
			暮らし: "Lifestyle",
			生活: "Living",
			日常: "Daily life",
			便利: "Convenient",
			快適: "Comfortable",
			美しく: "Beautiful",
			上質: "High quality",
			デザイン: "Design",

			// Units and measurements
			人: " people",
			円: " yen",
			日: " days",
			時間: " hours",
			分: " minutes",

			// Action words
			応援購入: "Support Purchase",
			サポーター: "Supporters",
			目標金額: "Goal Amount",
			残り: "Remaining",
		};

		let translatedText = text;

		// Replace Japanese words with English equivalents
		for (const [japanese, english] of Object.entries(translations)) {
			translatedText = translatedText.replace(
				new RegExp(japanese, "g"),
				english
			);
		}

		// If no significant translation was made, provide category-based description
		if (translatedText === text || translatedText.length > text.length * 2) {
			// Extract project type based on common patterns
			if (text.includes("ゲーム")) return `Game Project: ${text}`;
			if (text.includes("映画") || text.includes("映像"))
				return `Film Project: ${text}`;
			if (text.includes("音楽") || text.includes("アルバム"))
				return `Music Project: ${text}`;
			if (text.includes("本") || text.includes("書籍"))
				return `Book Project: ${text}`;
			if (text.includes("アート") || text.includes("写真"))
				return `Art Project: ${text}`;
			if (text.includes("ファッション")) return `Fashion Project: ${text}`;
			if (
				text.includes("料理") ||
				text.includes("レストラン") ||
				text.includes("フード")
			)
				return `Food Project: ${text}`;
			if (
				text.includes("テクノロジー") ||
				text.includes("アプリ") ||
				text.includes("技術")
			)
				return `Tech Project: ${text}`;
			if (
				text.includes("美容") ||
				text.includes("コスメ") ||
				text.includes("健康")
			)
				return `Beauty/Health Project: ${text}`;
			if (text.includes("エプロン") || text.includes("ワンピース"))
				return `Fashion/Apparel Project: ${text}`;
			if (text.includes("地域") || text.includes("復興"))
				return `Community Project: ${text}`;

			// Return original text if no pattern matches
			return text;
		}

		return translatedText;
	}

	translateCategory(category, targetLanguage = "en") {
		if (targetLanguage === "ja") {
			return category;
		}

		const categoryTranslations = {
			ファッション: "Fashion",
			テクノロジー: "Technology",
			フード: "Food",
			プロダクト: "Product",
			美容: "Beauty",
			アート: "Art",
			音楽: "Music",
			ゲーム: "Game",
			映画: "Movie",
			教育: "Education",
			スポーツ: "Sports",
			地域活性化: "Regional Revitalization",
			社会貢献: "Social Contribution",
		};

		return categoryTranslations[category] || category;
	}
}

module.exports = MakuakeScraper;
