// Base scraper service with common functionality
const puppeteer = require("puppeteer");

class BaseScraper {
	constructor() {
		this.browser = null;
		this.page = null;
	}

	async initBrowser() {
		this.browser = await puppeteer.launch({ headless: true });
		this.page = await this.browser.newPage();
		return this.page;
	}

	async closeBrowser() {
		if (this.browser) {
			await this.browser.close();
		}
	}

	// Helper to auto-scroll listing pages
	async autoScroll(page) {
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

	// Helper function to check if content is relevant to the search keyword
	isContentRelevant(campaignData, keyword) {
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
			// Exclude power stations/batteries from non-energy categories
			ebike: ["apex 300", "bluetti", "power station", "portable power"],
			bike: ["apex 300", "bluetti", "power station", "portable power"],
			bicycle: ["apex 300", "bluetti", "power station", "portable power"],
			transportation: [
				"apex 300",
				"bluetti",
				"power station",
				"portable power",
			],

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

	// Abstract methods to be implemented by child classes
	async scrape(category, keyword) {
		throw new Error("scrape method must be implemented by child class");
	}

	getCategories() {
		throw new Error("getCategories method must be implemented by child class");
	}

	getName() {
		throw new Error("getName method must be implemented by child class");
	}
}

module.exports = BaseScraper;
