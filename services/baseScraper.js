const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

class BaseScraper {
	constructor() {
		this.browser = null;
		this.page = null;
	}

	async initBrowser() {
		this.browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-background-timer-throttling",
				"--disable-backgrounding-occluded-windows",
				"--disable-renderer-backgrounding",
			],
		});
		this.page = await this.browser.newPage();

		// Set shorter timeouts for faster scraping
		await this.page.setDefaultTimeout(15000);
		await this.page.setDefaultNavigationTimeout(15000);

		await this.page.setUserAgent(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
		);
		return this.page;
	}

	async closeBrowser() {
		if (this.browser) {
			await this.browser.close();
		}
	}

	// Auto-scroll function to load dynamic content
	async autoScroll(page) {
		await page.evaluate(async () => {
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
				}, 300);
			});
		});
	}

	// Enhanced relevance check with strict accuracy
	isContentRelevant(campaignData, keyword, category = null) {
		if (!keyword || keyword.trim() === "") {
			return true; // No keyword means show all
		}

		const searchTerm = keyword.toLowerCase().trim();
		const title = (campaignData.title || "").toLowerCase();
		const description = (campaignData.description || "").toLowerCase();
		const owner = (campaignData.project_owner || "").toLowerCase();
		const url = (campaignData.url || "").toLowerCase();

		// Combine all text for searching
		const allText = `${title} ${description} ${owner}`.toLowerCase();

		// Define strict category-specific keywords
		const categoryKeywords = {
			education: [
				"education",
				"educational",
				"learning",
				"teach",
				"teaching",
				"teacher",
				"school",
				"student",
				"course",
				"curriculum",
				"lesson",
				"study",
				"studying",
				"academy",
				"university",
				"college",
				"classroom",
				"training",
				"tutorial",
				"stem",
				"science",
				"math",
				"mathematics",
				"physics",
				"chemistry",
				"biology",
				"literacy",
				"reading",
				"writing",
				"language learning",
				"skill development",
				"pedagogy",
				"instruction",
				"academic",
				"scholarly",
				"knowledge",
				// Korean keywords
				"교육",
				"학습",
				"배움",
				"가르치다",
				"선생님",
				"학교",
				"학생",
				"수업",
				"과정",
				"강의",
				"공부",
				"연구",
				"지식",
				"기술",
				"훈련",
			],
			technology: [
				"technology",
				"tech",
				"gadget",
				"device",
				"smart",
				"ai",
				"artificial intelligence",
				"iot",
				"internet of things",
				"app",
				"software",
				"hardware",
				"electronic",
				"digital",
				"innovation",
				"automation",
				"robotics",
				"computer",
				"computing",
				// Korean keywords
				"기술",
				"테크",
				"가젯",
				"장치",
				"스마트",
				"인공지능",
				"소프트웨어",
				"하드웨어",
				"전자",
				"디지털",
				"혁신",
				"자동화",
				"로봇",
				"컴퓨터",
			],
			games: [
				"game",
				"games",
				"gaming",
				"board game",
				"card game",
				"video game",
				"tabletop",
				"dice",
				"rpg",
				"role playing",
				"strategy game",
				"puzzle game",
				"party game",
				"family game",
				"board",
				"cards",
				"gaming",
				"play",
				"player",
				"gameplay",
				// Korean keywords
				"게임",
				"보드게임",
				"카드게임",
				"비디오게임",
				"놀이",
				"플레이어",
				"퍼즐",
				"전략",
				"게이밍",
			],
			art: [
				"art",
				"artist",
				"artistic",
				"painting",
				"sculpture",
				"drawing",
				"creative",
				"artwork",
				"gallery",
				"exhibition",
				"visual art",
				"fine art",
				"craft",
				"design",
				// Korean keywords
				"예술",
				"아티스트",
				"그림",
				"조각",
				"창작",
				"갤러리",
				"전시",
				"디자인",
				"공예",
			],
			music: [
				"music",
				"musical",
				"musician",
				"song",
				"album",
				"band",
				"instrument",
				"guitar",
				"piano",
				"drums",
				"violin",
				"audio",
				"sound",
				"recording",
				"concert",
				// Korean keywords
				"음악",
				"뮤지션",
				"노래",
				"앨범",
				"밴드",
				"악기",
				"기타",
				"피아노",
				"드럼",
				"바이올린",
				"사운드",
				"콘서트",
			],
			film: [
				"film",
				"movie",
				"cinema",
				"documentary",
				"short film",
				"video",
				"animation",
				"filmmaker",
				"director",
				"producer",
				"screenplay",
				"cinematography",
				// Korean keywords
				"영화",
				"시네마",
				"다큐멘터리",
				"비디오",
				"애니메이션",
				"감독",
				"제작자",
				"영상",
			],
			food: [
				"food",
				"cooking",
				"recipe",
				"kitchen",
				"chef",
				"restaurant",
				"cuisine",
				"culinary",
				"dining",
				"meal",
				"ingredient",
				"beverage",
				"drink",
				// Korean keywords
				"음식",
				"요리",
				"레시피",
				"주방",
				"셰프",
				"식당",
				"음료",
				"식사",
				"재료",
				"맛",
			],
			health: [
				"health",
				"healthcare",
				"medical",
				"fitness",
				"wellness",
				"therapy",
				"exercise",
				"nutrition",
				"medicine",
				"treatment",
				"healing",
				// Korean keywords
				"건강",
				"의료",
				"피트니스",
				"운동",
				"영양",
				"치료",
				"웰니스",
				"의학",
			],
			fashion: [
				"fashion",
				"clothing",
				"apparel",
				"style",
				"wear",
				"garment",
				"textile",
				"design",
				"fabric",
				"accessory",
				"jewelry",
				"shoes",
				"bag",
				// Korean keywords
				"패션",
				"의류",
				"스타일",
				"옷",
				"신발",
				"가방",
				"액세서리",
				"보석",
				"디자인",
			],
		};

		// Check for exact keyword match first (highest priority)
		if (allText.includes(searchTerm)) {
			return true;
		}

		// Check URL for keyword
		if (
			url.includes(searchTerm.replace(/\s+/g, "-")) ||
			url.includes(searchTerm.replace(/\s+/g, ""))
		) {
			return true;
		}

		// If we have a category, use category-specific keywords
		if (category && categoryKeywords[category]) {
			const relevantKeywords = categoryKeywords[category];

			// Check if the search term is related to the category
			const isSearchTermRelevant = relevantKeywords.some(
				(keyword) =>
					searchTerm.includes(keyword) || keyword.includes(searchTerm)
			);

			if (isSearchTermRelevant) {
				// Check if the content contains category-relevant keywords
				const hasRelevantContent = relevantKeywords.some((keyword) =>
					allText.includes(keyword)
				);

				return hasRelevantContent;
			}
		}

		// Fallback: Check if any word from the search term appears in the content
		const searchWords = searchTerm
			.split(/\s+/)
			.filter((word) => word.length > 2);
		const hasWordMatch = searchWords.some((word) => allText.includes(word));

		// Additional semantic matching for common terms
		const semanticMatches = {
			"smart device": ["smart", "device", "gadget", "tech", "iot"],
			"board game": ["board", "game", "tabletop", "card game", "dice"],
			"video game": ["video game", "gaming", "game", "indie game"],
			learning: ["education", "educational", "teach", "learning", "study"],
			photography: ["photo", "camera", "lens", "picture", "image"],
			audio: ["sound", "speaker", "headphone", "music", "audio"],
		};

		if (semanticMatches[searchTerm]) {
			const semanticKeywords = semanticMatches[searchTerm];
			const hasSemanticMatch = semanticKeywords.some((keyword) =>
				allText.includes(keyword)
			);
			if (hasSemanticMatch) return true;
		}

		return hasWordMatch;
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

	setLanguage(lang) {
		// No-op for scrapers that do not support language switching
	}
}

module.exports = BaseScraper;
