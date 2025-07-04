const BaseScraper = require("./baseScraper");

class IndiegogoScraper extends BaseScraper {
	constructor() {
		super();
	}

	getName() {
		return "Indiegogo";
	}

	getCategories() {
		return {
			// Tech & Innovation categories
			"Tech & Innovation": {
				audio: "Audio",
				"camera-gear": "Camera & Photography",
				education: "Education",
				"energy-green-tech": "Energy & Green Tech",
				"fashion-wearables": "Fashion & Wearables",
				"food-beverages": "Food & Beverages",
				"health-fitness": "Health & Fitness",
				home: "Home",
				"phones-accessories": "Phones & Accessories",
				productivity: "Productivity",
				transportation: "Transportation",
				"travel-outdoors": "Travel & Outdoors",
			},
			// Creative Works categories
			"Creative Works": {
				art: "Art",
				comics: "Comics",
				"dance-theater": "Dance & Theater",
				film: "Film",
				music: "Music",
				photography: "Photography",
				"podcasts-blogs-vlogs": "Podcasts, Blogs & Vlogs",
				"tabletop-games": "Tabletop Games",
				"video-games": "Video Games",
				"web-series-tv-shows": "Web Series & TV Shows",
				"writing-publishing": "Writing & Publishing",
			},
			// Community Projects categories
			"Community Projects": {
				culture: "Culture",
				environment: "Environment",
				"human-rights": "Human Rights",
				"local-businesses": "Local Businesses",
				wellness: "Wellness",
			},
		};
	}

	getCategoryMappings() {
		return {
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
	}

	// Scrape a single Indiegogo campaign page
	async scrapeCampaign(page, url) {
		await page.goto(url, { waitUntil: "networkidle2" });

		// Wait for the Vue app to load and render content
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Try to wait for key elements, but don't fail if they don't appear
		await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {});

		return await page.evaluate(() => {
			const txt = (sel) => document.querySelector(sel)?.innerText?.trim() || "";
			const attr = (sel, a) =>
				document.querySelector(sel)?.getAttribute(a) || "";

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
					getGonData("campaign.contributions_count") ||
					getGonData("num_backers");
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

			const dates = getDates();

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

	async scrape(category, keyword) {
		const results = [];
		const page = await this.initBrowser();

		try {
			console.log(
				`🔍 Searching Indiegogo for: "${keyword}" in category: "${category}"`
			);

			const categoryMappings = this.getCategoryMappings();
			const categoryKey = Object.keys(categoryMappings).find((key) =>
				keyword.toLowerCase().includes(key)
			);

			let actualCategory = category;
			if (categoryKey && !category) {
				actualCategory = categoryMappings[categoryKey];
				console.log(`🎯 Using keyword-based category: ${actualCategory}`);
			}

			if (actualCategory && actualCategory !== "all") {
				console.log(`🎯 Using category search: ${actualCategory}`);

				const categoryUrl = `https://www.indiegogo.com/explore/${actualCategory}`;
				await page.goto(categoryUrl, { waitUntil: "networkidle2" });
				await new Promise((resolve) => setTimeout(resolve, 3000));
				await this.autoScroll(page);

				const projectLinks = await page.$$eval(
					'a[href*="/projects/"]',
					(els) => [...new Set(els.map((el) => el.href))]
				);

				console.log(
					`📂 Found ${projectLinks.length} projects in ${actualCategory} category`
				);

				// Scrape ALL projects and filter for relevance (more lenient for category searches)
				for (const url of projectLinks) {
					try {
						const data = await this.scrapeCampaign(page, url);
						if (data.title) {
							// Use the enhanced base relevance check with category context
							const isRelevant = this.isContentRelevant(
								data,
								keyword,
								actualCategory
							);
							if (isRelevant) {
								results.push(data);
								console.log(`✅ Found relevant: ${data.title}`);
							} else {
								console.log(
									`⚠️ Filtered out: ${data.title} (not relevant to "${keyword}" in ${actualCategory})`
								);
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
				await this.autoScroll(page);

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
						const data = await this.scrapeCampaign(page, url);
						if (data.title && this.isContentRelevant(data, keyword)) {
							results.push(data);
							console.log(`✅ Found relevant: ${data.title}`);
						}
					} catch (err) {
						console.error("Campaign scraping error:", err.message);
					}
				}
			}
		} catch (err) {
			console.error("Indiegogo scraping error:", err);
			throw err;
		} finally {
			await this.closeBrowser();
		}

		return results;
	}
}

module.exports = IndiegogoScraper;
