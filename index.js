// server.js
const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to auto-scroll listing pages
async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve) => {
			let total = 0;
			const distance = 500;
			const timer = setInterval(() => {
				window.scrollBy(0, distance);
				total += distance;
				if (total >= document.body.scrollHeight) {
					clearInterval(timer);
					resolve();
				}
			}, 300);
		});
	});
}

// Scrape a single Indiegogo campaign page
async function scrapeIndiegogoCampaign(page, url) {
	await page.goto(url, { waitUntil: "networkidle2" });

	// Wait for the Vue app to load and render content
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Try to wait for key elements, but don't fail if they don't appear
	await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {});

	return await page.evaluate(() => {
		const txt = (sel) => document.querySelector(sel)?.innerText?.trim() || "";
		const attr = (sel, a) => document.querySelector(sel)?.getAttribute(a) || "";

		// Helper function to extract data from gon object (server-side data)
		const getGonData = (path) => {
			try {
				return (
					path.split(".").reduce((obj, key) => obj?.[key], window.gon) || ""
				);
			} catch {
				return "";
			}
		};

		// Extract funding information from various possible selectors
		const getFundingAmount = () => {
			// Try multiple selectors for amount raised
			const selectors = [
				".basicsGoalProgress-amount-raised",
				"[data-test='amount-raised']",
				".campaignGoalProgress-amount-raised",
				".amount-raised",
				".fundingGoalProgress-amountRaised",
			];

			for (const sel of selectors) {
				const val = txt(sel);
				if (val) return val;
			}

			// Try to get from gon data
			const gonAmount =
				getGonData("campaign.balance") ||
				getGonData("campaign.total_amount_sold");
			return gonAmount ? `$${gonAmount.toLocaleString()}` : "";
		};

		const getAchievementRate = () => {
			// Try multiple selectors for achievement rate
			const selectors = [
				".campaignGoalProgress-percent",
				"[data-test='goal-percentage']",
				".goal-percentage",
				".fundingGoalProgress-percent",
			];

			for (const sel of selectors) {
				const val = txt(sel);
				if (val) return val;
			}

			// Calculate from gon data if available
			const balance = getGonData("campaign.balance");
			const goal = getGonData("campaign.goal");
			if (balance && goal) {
				return `${Math.round((balance / goal) * 100)}%`;
			}
			return "";
		};

		const getSupporters = () => {
			// Try multiple selectors for backers count
			const selectors = [
				".backers-count",
				"[data-test='backers-count']",
				".basicsGoalProgress-numberOfBackers",
				".contributors-count",
				".fundingGoalProgress-numberOfBackers",
			];

			for (const sel of selectors) {
				const val = txt(sel);
				if (val) return val;
			}

			// Try to get from gon data
			const gonBackers =
				getGonData("campaign.contributions_count") || getGonData("num_backers");
			return gonBackers ? gonBackers.toString() : "";
		};

		const getProjectOwner = () => {
			// Try multiple selectors for project owner
			const selectors = [
				".basicsSection-profile-name",
				"[data-test='campaigner-name']",
				".campaigner-name",
				".profile-name",
				".owner-name",
			];

			for (const sel of selectors) {
				const val = txt(sel);
				if (val) return val;
			}

			// Try to get from gon data
			return (
				getGonData("campaign.owner_name") ||
				getGonData("trust_passport.owner.name") ||
				""
			);
		};

		const getLocation = () => {
			// Try multiple selectors for location
			const selectors = [
				'[data-testid="location"]',
				'[data-test="location"]',
				".location",
				".campaign-location",
				".basicsSection-location",
			];

			for (const sel of selectors) {
				const val = txt(sel);
				if (val) return val;
			}

			// Try to get from gon data
			return (
				getGonData("campaign.location") ||
				getGonData("trust_passport.project.location") ||
				""
			);
		};

		const getCampaignStatus = () => {
			// Try multiple selectors for campaign status
			const selectors = [
				".campaignStatus",
				"[data-test='campaign-status']",
				".campaign-status",
				".funding-status",
			];

			for (const sel of selectors) {
				const val = txt(sel);
				if (val) return val;
			}

			// Try to get from gon data
			const status = getGonData("campaign.status");
			if (status === "published") return "Live";
			return status || "";
		};

		const getDates = () => {
			const startDate = getGonData("campaign.funding_started_at") || "";
			const endDate = getGonData("campaign.funding_ends_at") || "";

			return {
				start_date: startDate ? new Date(startDate).toLocaleDateString() : "",
				end_date: endDate ? new Date(endDate).toLocaleDateString() : "",
			};
		};

		const dates = getDates();

		const getSupportAmount = () => {
			// Try to get goal amount from various sources
			const selectors = [
				".goal-amount",
				"[data-test='goal-amount']",
				".campaignGoalProgress-goal",
				".fundingGoalProgress-goal",
			];

			for (const sel of selectors) {
				const val = txt(sel);
				if (val) return val;
			}

			// Try to get from gon data
			const gonGoal = getGonData("campaign.goal");
			return gonGoal ? `$${gonGoal.toLocaleString()}` : "";
		};

		const getProjectStatus = () => {
			const status = getCampaignStatus().toLowerCase();
			const endDate = getGonData("campaign.funding_ends_at");

			if (status === "live" || status === "published") {
				return "Current";
			} else if (
				status === "ended" ||
				status === "successful" ||
				status === "completed"
			) {
				return "Completed";
			} else if (endDate && new Date(endDate) < new Date()) {
				return "Completed";
			}
			return "Current";
		};

		return {
			target_site: "Indiegogo",
			market: "Indiegogo",
			status: getCampaignStatus(),
			url: location.href,
			image_url: attr('meta[property="og:image"]', "content"),
			title: txt("h1") || getGonData("campaign.title") || "",
			original_title: txt("h1") || getGonData("campaign.title") || "",
			project_owner: getProjectOwner(),
			owner_website: getGonData("trust_passport.owner.website_url") || "",
			owner_sns:
				getGonData("trust_passport.owner.twitter_profile_url") ||
				getGonData("trust_passport.owner.facebook_profile_url") ||
				"",
			owner_country: getLocation(),
			contact_info: "",
			achievement_rate: getAchievementRate(),
			supporters: getSupporters(),
			amount: getFundingAmount(),
			support_amount: getSupportAmount(),
			crowdfund_start_date: dates.start_date,
			crowdfund_end_date: dates.end_date,
			start_date: dates.start_date,
			end_date: dates.end_date,
			current_or_completed_project: getProjectStatus(),
		};
	});
}

// Helper function to check if content is relevant to the search keyword
function isContentRelevant(campaignData, keyword) {
	const searchTerm = keyword.toLowerCase();
	const searchWords = searchTerm.split(/\s+/);
	const title = campaignData.title.toLowerCase();
	const url = campaignData.url.toLowerCase();

	// Check various fields for relevance
	const fieldsToCheck = [
		campaignData.title,
		campaignData.original_title,
		campaignData.project_owner,
		campaignData.url,
	]
		.join(" ")
		.toLowerCase();

	// Specific exclusions for mismatched products
	const exclusions = {
		// Exclude non-audio products from audio categories
		audio: ["apex 300", "bluetti", "power station"],
		sound: ["apex 300", "bluetti", "power station"],
		speaker: ["apex 300", "bluetti", "power station"],
		headphone: ["apex 300", "bluetti", "power station"],

		// Exclude non-camera products from camera categories
		camera: ["apex 300", "bluetti", "power station"],
		photography: ["apex 300", "bluetti", "power station"],

		// Exclude non-game products from game categories
		game: ["apex 300", "bluetti", "power station"],
		games: ["apex 300", "bluetti", "power station"],
		gaming: ["apex 300", "bluetti", "power station"],
		tabletop: ["apex 300", "bluetti", "power station"],
	};

	// Check for exclusions
	const searchCategory = searchWords.find((word) => exclusions[word]);
	if (searchCategory) {
		const excludeTerms = exclusions[searchCategory];
		const shouldExclude = excludeTerms.some(
			(term) => title.includes(term) || fieldsToCheck.includes(term)
		);
		if (shouldExclude) {
			console.log(
				`❌ Excluded "${campaignData.title}" from "${searchTerm}" (mismatch)`
			);
			return false;
		}
	}

	// Check for exact phrase match (highest priority)
	if (fieldsToCheck.includes(searchTerm)) {
		return true;
	}

	// Check if URL contains keyword (high priority)
	const urlKeywords = campaignData.url.toLowerCase();
	if (
		urlKeywords.includes(searchTerm.replace(/\s+/g, "-")) ||
		urlKeywords.includes(searchTerm.replace(/\s+/g, ""))
	) {
		return true;
	}

	// Check if any search word appears in the content (medium priority)
	const hasDirectMatch = searchWords.some(
		(word) => word.length > 2 && fieldsToCheck.includes(word)
	);

	// Special keyword matching for common terms
	const keywordMappings = {
		// Audio related
		audio: [
			"audio",
			"sound",
			"speaker",
			"headphone",
			"music",
			"microphone",
			"earphone",
		],
		sound: ["audio", "sound", "speaker", "headphone", "music", "microphone"],

		// Camera related
		camera: ["camera", "photo", "photography", "lens", "video", "film"],
		photography: ["photo", "camera", "lens", "picture", "image"],

		// Games related
		game: ["game", "gaming", "play", "player", "video game"],
		games: ["game", "gaming", "play", "player", "video game"],
		gaming: ["game", "gaming", "play", "player", "video game"],
		tabletop: ["board", "card", "dice", "tabletop", "game"],
		board: ["board game", "tabletop", "card", "dice"],

		// Transportation related
		ebike: ["bike", "bicycle", "electric", "cycling", "e-bike", "ebike"],
		bike: ["bike", "bicycle", "cycling", "ebike", "e-bike"],
		transportation: ["bike", "car", "vehicle", "transport", "scooter"],

		// Tech related
		tech: ["technology", "gadget", "device", "innovation", "smart"],
		technology: ["tech", "gadget", "device", "innovation", "smart"],

		// Creative related
		film: ["movie", "cinema", "film", "documentary", "short"],
		movie: ["film", "cinema", "movie", "documentary"],
		music: ["song", "album", "band", "artist", "musical", "musician"],
		art: ["artist", "painting", "sculpture", "creative", "artwork"],

		// Health & Fitness
		health: ["fitness", "wellness", "medical", "healthcare", "exercise"],
		fitness: ["health", "workout", "exercise", "gym", "training"],

		// Food related
		food: ["cooking", "recipe", "kitchen", "chef", "restaurant"],
		cooking: ["food", "recipe", "kitchen", "chef"],

		// Fashion related
		fashion: ["clothing", "style", "wear", "apparel", "design"],
		clothing: ["fashion", "wear", "apparel", "style"],

		// Home related
		home: ["house", "furniture", "decor", "living", "household"],

		// Education related
		education: ["learning", "teach", "school", "course", "training"],
		learning: ["education", "teach", "school", "course"],
	};

	const relatedKeywords = keywordMappings[searchTerm] || [];
	const hasRelatedMatch = relatedKeywords.some((relatedWord) =>
		fieldsToCheck.includes(relatedWord)
	);

	return hasDirectMatch || hasRelatedMatch;
}

app.post("/search", async (req, res) => {
	const { keyword, platform } = req.body;
	if (!keyword || !platform)
		return res.status(400).send("Keyword & platform required.");

	const results = [];
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	try {
		if (platform === "indiegogo") {
			console.log(`🔍 Searching for: "${keyword}"`);

			// Try category-first approach if keyword matches
			const categoryMappings = {
				// Tech & Innovation categories
				audio: "audio",
				sound: "audio",
				speaker: "audio",
				headphone: "audio",
				headphones: "audio",
				earphone: "audio",
				earphones: "audio",
				microphone: "audio",
				"audio device": "audio",
				"audio equipment": "audio",
				camera: "camera-gear",
				photography: "camera-gear",
				photo: "camera-gear",
				lens: "camera-gear",
				"camera gear": "camera-gear",
				video: "camera-gear",
				education: "education",
				learning: "education",
				teach: "education",
				teaching: "education",
				school: "education",
				course: "education",
				energy: "energy-green-tech",
				solar: "energy-green-tech",
				battery: "energy-green-tech",
				green: "energy-green-tech",
				"green tech": "energy-green-tech",
				"renewable energy": "energy-green-tech",
				"clean energy": "energy-green-tech",
				power: "energy-green-tech",
				"power station": "energy-green-tech",
				fashion: "fashion-wearables",
				clothing: "fashion-wearables",
				wearable: "fashion-wearables",
				wearables: "fashion-wearables",
				watch: "fashion-wearables",
				smartwatch: "fashion-wearables",
				apparel: "fashion-wearables",
				food: "food-beverages",
				drink: "food-beverages",
				beverage: "food-beverages",
				beverages: "food-beverages",
				cooking: "food-beverages",
				kitchen: "food-beverages",
				recipe: "food-beverages",
				health: "health-fitness",
				fitness: "health-fitness",
				workout: "health-fitness",
				exercise: "health-fitness",
				wellness: "health-fitness",
				medical: "health-fitness",
				healthcare: "health-fitness",
				home: "home",
				house: "home",
				furniture: "home",
				"home improvement": "home",
				decor: "home",
				household: "home",
				phone: "phones-accessories",
				mobile: "phones-accessories",
				smartphone: "phones-accessories",
				accessory: "phones-accessories",
				"phone case": "phones-accessories",
				"mobile accessory": "phones-accessories",
				productivity: "productivity",
				work: "productivity",
				office: "productivity",
				tool: "productivity",
				tools: "productivity",
				app: "productivity",
				software: "productivity",
				transportation: "transportation",
				bike: "transportation",
				bicycle: "transportation",
				ebike: "transportation",
				"e-bike": "transportation",
				"electric bike": "transportation",
				car: "transportation",
				scooter: "transportation",
				"electric scooter": "transportation",
				vehicle: "transportation",
				travel: "travel-outdoors",
				outdoor: "travel-outdoors",
				outdoors: "travel-outdoors",
				camping: "travel-outdoors",
				hiking: "travel-outdoors",
				adventure: "travel-outdoors",
				backpack: "travel-outdoors",
				luggage: "travel-outdoors",

				// Creative Works categories
				art: "art",
				artist: "art",
				painting: "art",
				sculpture: "art",
				artwork: "art",
				creative: "art",
				comic: "comics",
				comics: "comics",
				graphic: "comics",
				manga: "comics",
				"graphic novel": "comics",
				dance: "dance-theater",
				theater: "dance-theater",
				theatre: "dance-theater",
				performance: "dance-theater",
				stage: "dance-theater",
				film: "film",
				movie: "film",
				cinema: "film",
				documentary: "film",
				short: "film",
				"short film": "film",
				filmmaker: "film",
				music: "music",
				musician: "music",
				song: "music",
				album: "music",
				band: "music",
				musical: "music",
				instrument: "music",
				guitar: "music",
				piano: "music",
				photograph: "photography",
				photographer: "photography",
				"photo book": "photography",
				podcast: "podcasts-blogs-vlogs",
				podcasting: "podcasts-blogs-vlogs",
				blog: "podcasts-blogs-vlogs",
				blogging: "podcasts-blogs-vlogs",
				vlog: "podcasts-blogs-vlogs",
				vlogging: "podcasts-blogs-vlogs",
				youtube: "podcasts-blogs-vlogs",
				"web content": "podcasts-blogs-vlogs",
				tabletop: "tabletop-games",
				board: "tabletop-games",
				card: "tabletop-games",
				"board game": "tabletop-games",
				"card game": "tabletop-games",
				"tabletop game": "tabletop-games",
				dice: "tabletop-games",
				rpg: "tabletop-games",
				"role playing": "tabletop-games",
				game: "video-games",
				games: "video-games",
				gaming: "video-games",
				"video game": "video-games",
				"video games": "video-games",
				"mobile game": "video-games",
				"indie game": "video-games",
				"web series": "web-series-tv-shows",
				"tv show": "web-series-tv-shows",
				series: "web-series-tv-shows",
				"web show": "web-series-tv-shows",
				streaming: "web-series-tv-shows",
				writing: "writing-publishing",
				book: "writing-publishing",
				novel: "writing-publishing",
				publish: "writing-publishing",
				publishing: "writing-publishing",
				author: "writing-publishing",
				magazine: "writing-publishing",
				journal: "writing-publishing",

				// Community Projects categories
				culture: "culture",
				cultural: "culture",
				community: "culture",
				heritage: "culture",
				tradition: "culture",
				environment: "environment",
				environmental: "environment",
				climate: "environment",
				"climate change": "environment",
				conservation: "environment",
				sustainability: "environment",
				"human rights": "human-rights",
				rights: "human-rights",
				justice: "human-rights",
				equality: "human-rights",
				advocacy: "human-rights",
				business: "local-businesses",
				local: "local-businesses",
				shop: "local-businesses",
				store: "local-businesses",
				"small business": "local-businesses",
				restaurant: "local-businesses",
				cafe: "local-businesses",
				mindfulness: "wellness",
				meditation: "wellness",
				therapy: "wellness",
				"mental health": "wellness",
				spirituality: "wellness",
			};

			const categoryKey = Object.keys(categoryMappings).find((key) =>
				keyword.toLowerCase().includes(key)
			);

			if (categoryKey) {
				const category = categoryMappings[categoryKey];
				console.log(`🎯 Using category search: ${category}`);

				const categoryUrl = `https://www.indiegogo.com/explore/${category}`;
				await page.goto(categoryUrl, { waitUntil: "networkidle2" });
				await new Promise((resolve) => setTimeout(resolve, 3000));
				await autoScroll(page);

				const projectLinks = await page.$$eval(
					'a[href*="/projects/"]',
					(els) => [...new Set(els.map((el) => el.href))]
				);

				console.log(
					`📂 Found ${projectLinks.length} projects in ${category} category`
				);

				// Scrape ALL projects and filter for relevance (no limit)
				for (const url of projectLinks) {
					try {
						const data = await scrapeIndiegogoCampaign(page, url);
						if (data.title) {
							const isRelevant = isContentRelevant(data, keyword);
							if (isRelevant) {
								results.push(data);
								console.log(`✅ Found relevant: ${data.title}`);
							}
						}
					} catch (err) {
						console.error("Campaign scraping error:", err.message);
					}
				}
			} else {
				console.log(`🌐 No specific category found, using general search`);

				// Fall back to general search
				const searchUrl = `https://www.indiegogo.com/explore/all`;
				await page.goto(searchUrl, { waitUntil: "networkidle2" });
				await new Promise((resolve) => setTimeout(resolve, 3000));
				await autoScroll(page);

				const projectLinks = await page.$$eval(
					'a[href*="/projects/"]',
					(els) => [...new Set(els.map((el) => el.href))]
				);

				console.log(
					`🌐 Found ${projectLinks.length} projects in general exploration`
				);

				// Filter projects by relevance (no limit)
				for (const url of projectLinks) {
					try {
						const data = await scrapeIndiegogoCampaign(page, url);
						if (data.title && isContentRelevant(data, keyword)) {
							results.push(data);
							console.log(`✅ Found relevant: ${data.title}`);
						}
					} catch (err) {
						console.error("Campaign scraping error:", err.message);
					}
				}
			}
		} else {
			return res
				.status(400)
				.json({ success: false, error: "Unsupported platform." });
		}

		await browser.close();

		console.log(
			`🎉 Final results: ${results.length} campaigns found for "${keyword}"`
		);

		const filePath = `results/${platform}_${keyword.replace(
			/\s+/g,
			"_"
		)}_results.json`;
		fs.mkdirSync("results", { recursive: true });
		fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

		console.log(
			`✅ Scraped ${results.length} campaign(s) from ${platform} for "${keyword}"`
		);
		res.json({ success: true, file: filePath, count: results.length });
	} catch (err) {
		console.error("Scraping error:", err);
		await browser.close();
		res.status(500).json({ success: false, error: err.message });
	}
});

// Helper function to search by category (simplified)
async function searchByCategory(browser, category, keyword) {
	const page = await browser.newPage();
	const results = [];

	try {
		const categoryUrl = `https://www.indiegogo.com/explore/${category}`;
		console.log(`📂 Searching category: ${categoryUrl}`);

		await page.goto(categoryUrl, { waitUntil: "networkidle2" });
		await new Promise((resolve) => setTimeout(resolve, 3000));
		await autoScroll(page);

		const projectLinks = await page.$$eval('a[href*="/projects/"]', (els) => [
			...new Set(els.map((el) => el.href)),
		]);

		// Get ALL projects from category (remove limit)
		for (const url of projectLinks) {
			try {
				const data = await scrapeIndiegogoCampaign(page, url);
				if (data.title && isContentRelevant(data, keyword)) {
					results.push(data);
				}
			} catch (err) {
				console.error("Category search failed for:", url, err.message);
			}
		}
	} catch (err) {
		console.error("Category search error:", err.message);
	} finally {
		await page.close();
	}

	return results;
}

app.post("/test-direct", async (req, res) => {
	const { url } = req.body;
	if (!url) return res.status(400).send("URL required.");

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	try {
		const data = await scrapeIndiegogoCampaign(page, url);
		await browser.close();

		console.log("✅ Test scrape completed");
		res.json({ success: true, data: data });
	} catch (err) {
		console.error("Test scraping error:", err);
		await browser.close();
		res.status(500).json({ success: false, error: err.message });
	}
});

app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
