const BaseScraper = require("./baseScraper");

class CampfireScraper extends BaseScraper {
	constructor() {
		super();
		this.seenUrls = new Set();
		this.language = "en"; // Default to English - this ensures English by default
	}

	setLanguage(lang) {
		this.language = lang; // 'en' for English, 'ja' for Japanese
	}

	getName() {
		return "CAMPFIRE";
	}

	// Translation mappings
	getTranslations() {
		return {
			// Status translations
			active: { en: "Active", ja: "アクティブ" },
			ended: { en: "Ended", ja: "終了" },
			funded: { en: "Funded", ja: "達成" },
			draft: { en: "Draft", ja: "下書き" },

			// Category translations
			technology: { en: "Technology", ja: "テクノロジー" },
			art: { en: "Art & Photography", ja: "アート・写真" },
			music: { en: "Music", ja: "音楽" },
			movie: { en: "Film & Video", ja: "映画・映像" },
			game: { en: "Games", ja: "ゲーム" },
			fashion: { en: "Fashion", ja: "ファッション" },
			food: { en: "Food", ja: "フード" },
			product: { en: "Product", ja: "プロダクト" },
			social: { en: "Social Good", ja: "ソーシャルグッド" },
			business: { en: "Business", ja: "ビジネス" },

			// UI elements
			supporters: { en: "supporters", ja: "支援者" },
			days_left: { en: "days left", ja: "残り日数" },
			current_amount: { en: "Current Amount", ja: "現在の金額" },
			target_amount: { en: "Target Amount", ja: "目標金額" },
			achievement_rate: { en: "Achievement Rate", ja: "達成率" },
		};
	}

	translate(key, value) {
		if (this.language === "ja") {
			return value; // Return original Japanese
		}

		// Convert to English
		const translations = this.getTranslations();
		if (translations[key]) {
			return translations[key].en;
		}
		return value;
	}

	getCategories() {
		return {
			"食べ物・レストラン": {
				food: "food",
				restaurant: "food",
				cooking: "food",
				グルメ: "food",
				料理: "food",
				カフェ: "food",
				レストラン: "food",
				フード: "food",
			},
			"テクノロジー・ガジェット": {
				tech: "technology",
				technology: "technology",
				gadget: "technology",
				device: "technology",
				テクノロジー: "technology",
				ガジェット: "technology",
				デバイス: "technology",
				アプリ: "technology",
				AI: "technology",
				IoT: "technology",
			},
			プロダクト: {
				product: "product",
				design: "product",
				プロダクト: "product",
				デザイン: "product",
				製品: "product",
			},
			ファッション: {
				fashion: "fashion",
				clothing: "fashion",
				ファッション: "fashion",
				服: "fashion",
				アクセサリー: "fashion",
			},
			スポーツ: {
				sports: "sports",
				sport: "sports",
				スポーツ: "sports",
				フィットネス: "sports",
				トレーニング: "sports",
			},
			音楽: {
				music: "music",
				musician: "music",
				音楽: "music",
				ミュージシャン: "music",
				バンド: "music",
				アルバム: "music",
				コンサート: "music",
			},
			"ゲーム・サービス開発": {
				game: "game",
				games: "game",
				gaming: "game",
				service: "game",
				ゲーム: "game",
				サービス: "game",
				アプリ: "game",
				開発: "game",
			},
			"動画・映画": {
				video: "movie",
				film: "movie",
				movie: "movie",
				映画: "movie",
				映像: "movie",
				動画: "movie",
				ドキュメンタリー: "movie",
			},
			"地域活性化・まちづくり": {
				urban: "social",
				development: "social",
				community: "social",
				地域: "social",
				まちづくり: "social",
				町: "social",
				村: "social",
				地方: "social",
			},
			ソーシャルグッド: {
				social: "social",
				charity: "social",
				ソーシャルグッド: "social",
				チャリティー: "social",
				社会: "social",
				支援: "social",
				NPO: "social",
			},
			"アニメ・マンガ": {
				anime: "anime",
				manga: "anime",
				アニメ: "anime",
				マンガ: "anime",
				漫画: "anime",
				キャラクター: "anime",
			},
			"アート・写真": {
				art: "art",
				photo: "art",
				photography: "art",
				アート: "art",
				写真: "art",
				絵画: "art",
				彫刻: "art",
			},
			"本・雑誌出版": {
				book: "book",
				magazine: "book",
				publishing: "book",
				本: "book",
				書籍: "book",
				雑誌: "book",
				出版: "book",
			},
			"舞台・パフォーマンス": {
				stage: "stage",
				performance: "stage",
				theater: "stage",
				舞台: "stage",
				パフォーマンス: "stage",
				演劇: "stage",
				ダンス: "stage",
			},
			"美容・ヘルスケア": {
				beauty: "beauty",
				healthcare: "beauty",
				health: "beauty",
				美容: "beauty",
				ヘルスケア: "beauty",
				健康: "beauty",
				コスメ: "beauty",
			},
			チャレンジ: {
				challenge: "challenge",
				チャレンジ: "challenge",
				挑戦: "challenge",
				冒険: "challenge",
			},
			"ビジネス・起業": {
				business: "business",
				startup: "business",
				entrepreneur: "business",
				ビジネス: "business",
				起業: "business",
				スタートアップ: "business",
				会社: "business",
			},
		};
	}

	getCategoryMappings() {
		return {
			// Technology
			tech: "technology",
			technology: "technology",
			gadget: "technology",
			device: "technology",
			innovation: "technology",
			smart: "technology",
			app: "technology",
			software: "technology",
			hardware: "technology",

			// Art & Photography
			art: "art",
			photo: "art",
			photography: "art",
			artist: "art",
			painting: "art",
			sculpture: "art",

			// Music
			music: "music",
			musician: "music",
			band: "music",
			album: "music",
			concert: "music",

			// Film & Video
			film: "movie",
			movie: "movie",
			video: "movie",
			documentary: "movie",

			// Games
			game: "game",
			games: "game",
			gaming: "game",
			"board game": "game",
			"video game": "game",
			tabletop: "game",

			// Fashion
			fashion: "fashion",
			clothing: "fashion",
			accessory: "fashion",

			// Food
			food: "food",
			restaurant: "food",
			cooking: "food",
			recipe: "food",

			// Product
			product: "product",
			design: "product",
			furniture: "product",

			// Social Good
			social: "social",
			charity: "social",
			nonprofit: "social",
			community: "social",

			// Business
			business: "business",
			startup: "business",
			company: "business",
		};
	}

	async scrape(category, keyword, options = {}) {
		try {
			// Set language if provided
			if (options.language) {
				this.setLanguage(options.language);
			}

			console.log(
				`🚀 Starting CAMPFIRE scraper for category: ${category}, keyword: ${keyword}, language: ${this.language}`
			);

			await this.initBrowser();

			// Build search URL based on CAMPFIRE's search structure
			const searchUrl = this.buildSearchUrl(category, keyword);
			console.log(`📍 Navigating to: ${searchUrl}`);

			await this.page.goto(searchUrl, {
				waitUntil: "domcontentloaded",
				timeout: 8000, // Further reduced timeout
			});

			// Optimized wait for content to load
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Fast scroll to load content
			await this.page.evaluate(() => {
				window.scrollTo(0, document.body.scrollHeight / 4);
			});

			// Short wait for dynamic content
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Extract project data
			const projects = await this.extractProjects();

			// Filter projects by category if specified
			const filteredProjects = this.filterProjectsByCategory(
				projects,
				category
			);

			console.log(
				`✅ CAMPFIRE scraper completed in ~3 seconds. Found ${filteredProjects.length} projects (${projects.length} total before filtering).`
			);

			return filteredProjects;
		} catch (error) {
			console.error("❌ CAMPFIRE scraper error:", error);
			throw error;
		} finally {
			await this.closeBrowser();
		}
	}

	buildSearchUrl(category, keyword) {
		const baseUrl = "https://camp-fire.jp/projects";
		const encodedKeyword = encodeURIComponent(keyword);

		// CAMPFIRE category mapping to their actual category IDs
		const categoryMapping = {
			food: "food",
			グルメ: "food",
			料理: "food",
			レストラン: "food",
			technology: "tech",
			tech: "tech",
			テクノロジー: "tech",
			game: "game",
			games: "game",
			ゲーム: "game",
			art: "art",
			アート: "art",
			music: "music",
			音楽: "music",
			movie: "movie",
			film: "movie",
			映画: "movie",
			fashion: "fashion",
			ファッション: "fashion",
			product: "product",
			プロダクト: "product",
			social: "social",
			ソーシャル: "social",
			business: "business",
			ビジネス: "business",
		};

		// Try to map the category to CAMPFIRE's format
		const mappedCategory =
			categoryMapping[category?.toLowerCase()] ||
			categoryMapping[keyword?.toLowerCase()];

		// Build URL with both category and keyword for better targeting
		let searchUrl = baseUrl;
		const params = new URLSearchParams();

		if (keyword) {
			params.append("keyword", keyword);
		}

		// Add category-specific filtering
		if (mappedCategory) {
			params.append("category", mappedCategory);
		}

		// If we have a food-related search, add food-specific keywords
		if (
			category === "food" ||
			keyword === "グルメ" ||
			keyword === "料理" ||
			keyword === "食べ物"
		) {
			params.set("keyword", keyword + " 料理 グルメ フード レストラン");
		}

		if (params.toString()) {
			searchUrl += "?" + params.toString();
		}

		return searchUrl;
	}

	filterProjectsByCategory(projects, category) {
		if (category === "all") {
			return projects;
		}

		const categoryKeywords = {
			game: [
				"ゲーム",
				"game",
				"gaming",
				"ボードゲーム",
				"カードゲーム",
				"RPG",
				"アプリ",
				"app",
				"サービス",
				"開発",
				"プレイ",
				"遊び",
			],
			technology: [
				"テクノロジー",
				"tech",
				"gadget",
				"ガジェット",
				"デバイス",
				"AI",
				"IoT",
				"アプリ",
				"device",
				"技術",
				"システム",
				"ソフト",
			],
			art: [
				"アート",
				"art",
				"写真",
				"photo",
				"painting",
				"絵画",
				"sculpture",
				"彫刻",
				"美術",
				"展示",
				"作品",
				"創作",
			],
			music: [
				"音楽",
				"music",
				"musician",
				"ミュージシャン",
				"バンド",
				"album",
				"アルバム",
				"コンサート",
				"ライブ",
				"楽器",
				"歌",
			],
			movie: [
				"映画",
				"movie",
				"film",
				"映像",
				"ドキュメンタリー",
				"documentary",
				"video",
				"動画",
				"撮影",
				"監督",
				"作品",
			],
			fashion: [
				"ファッション",
				"fashion",
				"clothing",
				"服",
				"アクセサリー",
				"accessory",
				"ブランド",
				"デザイン",
				"衣装",
				"スタイル",
			],
			food: [
				"フード",
				"food",
				"料理",
				"cooking",
				"グルメ",
				"gourmet",
				"レストラン",
				"restaurant",
				"カフェ",
				"cafe",
				"食べ物",
				"食事",
				"meal",
				"飲食",
				"culinary",
				"chef",
				"シェフ",
				"キッチン",
				"kitchen",
				"食材",
				"ingredient",
				"recipe",
				"レシピ",
				"味",
				"taste",
				"美味",
				"delicious",
				"食品",
				"beverage",
				"飲み物",
				"drink",
				"酒",
				"sake",
				"ワイン",
				"wine",
				"ビール",
				"beer",
				"パン",
				"bread",
				"スイーツ",
				"sweets",
				"dessert",
				"デザート",
				"お菓子",
				"和食",
				"洋食",
				"中華",
				"イタリアン",
				"フレンチ",
				"バー",
				"bar",
				"居酒屋",
				"弁当",
				"lunchbox",
			],
			product: [
				"プロダクト",
				"product",
				"design",
				"デザイン",
				"家具",
				"furniture",
				"製品",
				"商品",
				"グッズ",
				"アイテム",
			],
			social: [
				"ソーシャルグッド",
				"social",
				"charity",
				"チャリティー",
				"nonprofit",
				"社会",
				"地域",
				"まちづくり",
				"支援",
				"活動",
			],
			business: [
				"ビジネス",
				"business",
				"startup",
				"スタートアップ",
				"企業",
				"company",
				"起業",
				"会社",
				"サービス",
				"事業",
			],
			anime: [
				"アニメ",
				"anime",
				"マンガ",
				"manga",
				"漫画",
				"キャラクター",
				"character",
				"フィギュア",
				"コミック",
				"同人",
			],
			book: [
				"本",
				"book",
				"書籍",
				"雑誌",
				"magazine",
				"出版",
				"publishing",
				"小説",
				"novel",
				"読書",
				"文学",
			],
			stage: [
				"舞台",
				"stage",
				"パフォーマンス",
				"performance",
				"演劇",
				"theater",
				"ダンス",
				"dance",
				"公演",
				"ライブ",
			],
			beauty: [
				"美容",
				"beauty",
				"ヘルスケア",
				"healthcare",
				"健康",
				"health",
				"コスメ",
				"cosmetics",
				"ケア",
				"美",
			],
			challenge: [
				"チャレンジ",
				"challenge",
				"挑戦",
				"冒険",
				"adventure",
				"体験",
				"experience",
				"達成",
				"目標",
			],
			sports: [
				"スポーツ",
				"sports",
				"sport",
				"フィットネス",
				"fitness",
				"トレーニング",
				"training",
				"運動",
				"健康",
			],
		};

		const keywords = categoryKeywords[category.toLowerCase()] || [];

		// If no specific keywords found, return all projects (less strict filtering)
		if (keywords.length === 0) {
			return projects;
		}

		const filtered = projects.filter((project) => {
			const searchText =
				`${project.title} ${project.description} ${project.category}`.toLowerCase();
			return keywords.some((keyword) =>
				searchText.includes(keyword.toLowerCase())
			);
		});

		// For food category, be extra strict - only return if we find food-related keywords
		if (category === "food") {
			const foodSpecificResults = filtered.filter((project) => {
				const searchText =
					`${project.title} ${project.description}`.toLowerCase();
				const foodKeywords = [
					"フード",
					"food",
					"料理",
					"cooking",
					"グルメ",
					"gourmet",
					"レストラン",
					"restaurant",
					"カフェ",
					"cafe",
					"食べ物",
					"食事",
					"飲食",
					"culinary",
					"chef",
					"シェフ",
					"キッチン",
					"kitchen",
					"食材",
					"recipe",
					"レシピ",
					"味",
					"美味",
					"食品",
					"beverage",
					"飲み物",
					"drink",
					"パン",
					"bread",
					"スイーツ",
					"sweets",
					"dessert",
					"デザート",
					"お菓子",
					"和食",
					"洋食",
					"中華",
					"イタリアン",
					"フレンチ",
					"バー",
					"bar",
					"居酒屋",
					"弁当",
				];
				return foodKeywords.some((keyword) => searchText.includes(keyword));
			});

			console.log(
				`🍽️ Food-specific filtering: ${foodSpecificResults.length} food projects found from ${filtered.length} total filtered projects`
			);
			if (foodSpecificResults.length > 0) {
				return foodSpecificResults;
			}
		}

		// If filtering returns no results, return all projects to avoid empty results
		return filtered.length > 0 ? filtered : projects;
	}

	processProjectData(rawData) {
		const processedData = { ...rawData };

		// Always process to English by default (unless language is explicitly set to 'ja')
		if (this.language !== "ja") {
			// Translate title to English
			if (processedData.title) {
				processedData.title = this.translateText(processedData.title);
			}

			// Process funding amounts - convert to English format
			if (processedData.fundingAmount) {
				processedData.fundingAmount = processedData.fundingAmount.replace(
					/円/g,
					" JPY"
				);
			}

			if (processedData.targetAmount) {
				processedData.targetAmount = processedData.targetAmount.replace(
					/円/g,
					" JPY"
				);
			}

			// Process backers count
			if (processedData.backers) {
				processedData.backers = processedData.backers.replace(/人/g, " people");
			}

			// Process days left
			if (processedData.daysLeft) {
				processedData.daysLeft = processedData.daysLeft.replace(/日/g, " days");
			}

			// Process category - extract relevant category in English
			if (processedData.category) {
				processedData.category = this.extractRelevantCategory(
					processedData.category
				);
			}

			// Translate status to English
			if (processedData.status) {
				const statusTranslations = {
					終了: "Ended",
					アクティブ: "Active",
					達成: "Funded",
					下書き: "Draft",
				};
				processedData.status =
					statusTranslations[processedData.status] || processedData.status;
			}
		}

		return processedData;
	}

	translateText(text) {
		if (!text || typeof text !== "string") {
			return text;
		}

		// Simple translation mapping for common project titles
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
			機能: "Function",
			サービス: "Service",
			アプリ: "App",
			ゲーム: "Game",
			映画: "Movie",
			音楽: "Music",
			アルバム: "Album",
			本: "Book",
			書籍: "Book",
			写真: "Photo",
			アート: "Art",
			デザイン: "Design",
			ファッション: "Fashion",
			料理: "Cooking",
			レストラン: "Restaurant",
			カフェ: "Cafe",
			店: "Store",
			商品: "Product",
			グッズ: "Goods",
			ぬいぐるみ: "Stuffed Animal",
			フィギュア: "Figure",
			キャラクター: "Character",
			アニメ: "Anime",
			マンガ: "Manga",
			漫画: "Manga",
			小説: "Novel",
			雑誌: "Magazine",
			イベント: "Event",
			コンサート: "Concert",
			ライブ: "Live",
			フェス: "Festival",
			展示: "Exhibition",
			個展: "Solo Exhibition",
			舞台: "Stage",
			演劇: "Theater",
			ダンス: "Dance",
			パフォーマンス: "Performance",
			ワークショップ: "Workshop",
			セミナー: "Seminar",
			講座: "Course",
			教育: "Education",
			学校: "School",
			大学: "University",
			研究: "Research",
			技術: "Technology",
			AI: "AI",
			IoT: "IoT",
			VR: "VR",
			AR: "AR",
			ロボット: "Robot",
			ドローン: "Drone",
			スマート: "Smart",
			デジタル: "Digital",
			オンライン: "Online",
			ウェブ: "Web",
			サイト: "Site",
			プラットフォーム: "Platform",
			システム: "System",
			ソフトウェア: "Software",
			ハードウェア: "Hardware",
			デバイス: "Device",
			ガジェット: "Gadget",
			ツール: "Tool",
			便利: "Convenient",
			簡単: "Easy",
			高品質: "High Quality",
			プレミアム: "Premium",
			エコ: "Eco",
			環境: "Environment",
			健康: "Health",
			美容: "Beauty",
			フィットネス: "Fitness",
			スポーツ: "Sports",
			トレーニング: "Training",
			ダイエット: "Diet",
			旅行: "Travel",
			観光: "Tourism",
			ホテル: "Hotel",
			宿泊: "Accommodation",
			体験: "Experience",
			ツアー: "Tour",
			冒険: "Adventure",
			文化: "Culture",
			伝統: "Traditional",
			日本: "Japan",
			東京: "Tokyo",
			大阪: "Osaka",
			京都: "Kyoto",
			地域: "Regional",
			町: "Town",
			市: "City",
			村: "Village",
			復興: "Reconstruction",
			支援: "Support",
			寄付: "Donation",
			チャリティー: "Charity",
			ボランティア: "Volunteer",
			社会: "Society",
			コミュニティ: "Community",
			グループ: "Group",
			チーム: "Team",
			クラブ: "Club",
			協会: "Association",
			財団: "Foundation",
			NPO: "NPO",
			NGO: "NGO",
		};

		let translatedText = text;

		// Replace Japanese words with English equivalents
		for (const [japanese, english] of Object.entries(translations)) {
			translatedText = translatedText.replace(
				new RegExp(japanese, "g"),
				english
			);
		}

		// If no translation was made, provide a generic description
		if (translatedText === text) {
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
			if (text.includes("料理") || text.includes("レストラン"))
				return `Food Project: ${text}`;
			if (text.includes("技術") || text.includes("アプリ"))
				return `Tech Project: ${text}`;
			if (text.includes("ぬいぐるみ") || text.includes("キャラクター"))
				return `Character/Merchandise Project: ${text}`;
			if (text.includes("イベント") || text.includes("フェス"))
				return `Event Project: ${text}`;
			if (text.includes("教育") || text.includes("学校"))
				return `Education Project: ${text}`;
			if (text.includes("健康") || text.includes("美容"))
				return `Health/Beauty Project: ${text}`;
			if (text.includes("環境") || text.includes("エコ"))
				return `Environmental Project: ${text}`;
			if (text.includes("地域") || text.includes("復興"))
				return `Community/Regional Project: ${text}`;
			if (text.includes("ビジネス") || text.includes("起業"))
				return `Business Project: ${text}`;

			return `CAMPFIRE Project: ${text}`;
		}

		return translatedText;
	}

	extractRelevantCategory(categoryText) {
		const categoryMappings = {
			ゲーム: this.language === "en" ? "Games" : "ゲーム",
			テクノロジー: this.language === "en" ? "Technology" : "テクノロジー",
			アート: this.language === "en" ? "Art & Photography" : "アート・写真",
			音楽: this.language === "en" ? "Music" : "音楽",
			映画: this.language === "en" ? "Film & Video" : "映画・映像",
			ファッション: this.language === "en" ? "Fashion" : "ファッション",
			フード: this.language === "en" ? "Food" : "フード",
			プロダクト: this.language === "en" ? "Product" : "プロダクト",
			ソーシャルグッド:
				this.language === "en" ? "Social Good" : "ソーシャルグッド",
			ビジネス: this.language === "en" ? "Business" : "ビジネス",
		};

		// Try to find the most relevant category
		for (const [japanese, english] of Object.entries(categoryMappings)) {
			if (categoryText.includes(japanese)) {
				return english;
			}
		}

		// Default fallback
		return this.language === "en" ? "Other" : "その他";
	}

	async extractProjects() {
		const projects = await this.page.evaluate(() => {
			// Try multiple selectors to catch all project elements
			const selectors = [
				".card-wrapper",
				".card",
				"li.card-wrapper",
				"a.card",
				'[class*="card"]',
				'[class*="project"]',
			];

			let projectElements = [];

			// Try each selector until we find elements
			for (const selector of selectors) {
				const elements = document.querySelectorAll(selector);
				if (elements.length > 0) {
					projectElements = Array.from(elements);
					break;
				}
			}

			console.log(`Found ${projectElements.length} project elements`);

			const projectsData = [];

			projectElements.forEach((element) => {
				try {
					// For CAMPFIRE, get the link element
					const linkElement =
						element.tagName === "A" ? element : element.querySelector("a");

					if (!linkElement) return;

					// Extract project data
					const titleElement =
						linkElement.querySelector(".title, h3, h2") || linkElement;
					const title =
						titleElement.textContent?.trim() ||
						linkElement.textContent?.split("\n")[0]?.trim() ||
						"";

					// Clean up title
					const cleanTitle = title.replace(/\s+/g, " ").trim();

					// Get URL
					let url = linkElement.href || "";
					if (url && !url.startsWith("http")) {
						url = "https://camp-fire.jp" + url;
					}

					// Get image
					const imgElement = linkElement.querySelector("img");
					const image =
						imgElement?.src || imgElement?.getAttribute("data-src") || "";

					// Extract all text content for data mining
					const fullText = linkElement.textContent || "";
					const textLines = fullText
						.split("\n")
						.map((line) => line.trim())
						.filter((line) => line);

					// Extract funding information from text - fixed regex patterns
					const currentAmountMatch = fullText.match(/現在\s*([\d,]+)円/);
					const fundingAmount = currentAmountMatch
						? currentAmountMatch[1] + "円"
						: "";

					const targetAmountMatch = fullText.match(/目標\s*([\d,]+)円/);
					const targetAmount = targetAmountMatch
						? targetAmountMatch[1] + "円"
						: "";

					const backersMatch = fullText.match(/支援者\s*(\d+)\s*人/);
					const backers = backersMatch ? backersMatch[1] + "人" : "";

					const daysMatch = fullText.match(/残り\s*(\d+)日/);
					const daysLeft = daysMatch ? daysMatch[1] + "日" : "";

					const percentMatch = fullText.match(/(\d+)%/);
					const progress = percentMatch ? percentMatch[1] + "%" : "";

					// Extract description
					const description = textLines.length > 1 ? textLines[1] : "";

					// Determine category based on content
					let category = "Other";
					if (fullText.includes("ゲーム") || fullText.includes("game"))
						category = "ゲーム";
					else if (
						fullText.includes("テクノロジー") ||
						fullText.includes("tech")
					)
						category = "テクノロジー";
					else if (fullText.includes("アート") || fullText.includes("art"))
						category = "アート・写真";
					else if (fullText.includes("音楽") || fullText.includes("music"))
						category = "音楽";
					else if (fullText.includes("映画") || fullText.includes("movie"))
						category = "映画・映像";

					// Determine status
					let status = "active";
					if (fullText.includes("終了")) status = "ended";
					else if (fullText.includes("達成")) status = "funded";

					// Creator (usually not visible in card view)
					const creator = "";

					if (cleanTitle && url) {
						projectsData.push({
							title: cleanTitle,
							description,
							url,
							image,
							fundingAmount,
							targetAmount,
							backers,
							category,
							creator,
							progress,
							daysLeft,
							status,
							platform: "CAMPFIRE",
							platformUrl: "https://camp-fire.jp/",
							scrapedAt: new Date().toISOString(),
						});
					}
				} catch (error) {
					console.error("Error extracting project data:", error);
				}
			});

			return projectsData;
		});

		// Remove duplicates based on URL
		const uniqueProjects = projects.filter(
			(project, index, self) =>
				index === self.findIndex((p) => p.url === project.url)
		);

		// Process each project for language and data formatting
		const processedProjects = uniqueProjects.map((project) =>
			this.processProjectData(project)
		);

		// Enhance projects with detailed owner information (limit to first 10 projects for performance)
		const enhancedProjects = await this.enhanceProjectsWithOwnerInfo(
			processedProjects.slice(0, 10)
		);

		// Add basic owner info for remaining projects
		const remainingProjects = processedProjects.slice(10).map((project) => ({
			...project,
			creator: "Unknown",
			ownerProfile: "",
			ownerImage: "",
			contactInfo: {
				email: "",
				twitter: "",
				facebook: "",
				instagram: "",
				website: "",
				phone: "",
			},
		}));

		// Return enhanced projects plus remaining projects
		return [...enhancedProjects, ...remainingProjects];
	}

	async enhanceProjectsWithOwnerInfo(projects) {
		const enhancedProjects = [];

		for (const project of projects) {
			try {
				console.log(
					`📋 Fetching owner info for: ${project.title.substring(0, 50)}...`
				);

				// Navigate to project page
				await this.page.goto(project.url, {
					waitUntil: "domcontentloaded",
					timeout: 5000,
				});

				// Wait for page to load
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Extract owner information
				const ownerInfo = await this.page.evaluate(() => {
					let ownerName = "";
					let ownerProfile = "";
					let ownerImage = "";
					let contactInfo = {
						email: "",
						twitter: "",
						facebook: "",
						instagram: "",
						website: "",
						phone: "",
					};

					// Try to find owner name with more specific selectors
					const ownerSelectors = [
						".profile-name",
						".creator-name",
						".owner-name",
						".user-name",
						'[data-target="profile.name"]',
						".project-owner",
						".author-name",
						".supporter-name",
						"h3.name",
						"h2.name",
						".profile h3",
						".profile h2",
						'[class*="name"]',
					];

					for (const selector of ownerSelectors) {
						const element = document.querySelector(selector);
						if (element) {
							const text = element.textContent?.trim();
							if (
								text &&
								text.length > 0 &&
								text.length < 100 &&
								!text.includes("CAMPFIRE")
							) {
								ownerName = text;
								break;
							}
						}
					}

					// If no specific name found, try to extract from page title or meta
					if (!ownerName) {
						const pageTitle = document.title;
						const titleMatch = pageTitle.match(/by\s+([^|]+)/i);
						if (titleMatch) {
							ownerName = titleMatch[1].trim();
						}
					}

					// Try to find owner profile URL
					const profileLinks = document.querySelectorAll(
						'a[href*="/profile/"], a[href*="/users/"], a[href*="profile"]'
					);
					for (const link of profileLinks) {
						if (link.href && link.href.includes("camp-fire.jp")) {
							ownerProfile = link.href;
							break;
						}
					}

					// Try to find owner image with more specific selectors
					const imageSelectors = [
						".profile-image img",
						".creator-image img",
						".owner-image img",
						".user-avatar img",
						".profile img",
						'[class*="avatar"] img',
						'[class*="profile"] img',
					];

					for (const selector of imageSelectors) {
						const element = document.querySelector(selector);
						if (element && element.src) {
							ownerImage = element.src;
							break;
						}
					}

					// Look for contact information in the entire page
					const allText = document.body.textContent || "";
					const allLinks = Array.from(document.querySelectorAll("a")).map(
						(a) => a.href
					);

					// Extract email (better pattern)
					const emailMatch = allText.match(
						/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
					);
					if (emailMatch) {
						contactInfo.email = emailMatch[0];
					}

					// Extract social media links (more specific)
					allLinks.forEach((link) => {
						if (link.includes("twitter.com/") && !link.includes("campfirejp")) {
							contactInfo.twitter = link;
						} else if (
							link.includes("x.com/") &&
							!link.includes("campfirejp")
						) {
							contactInfo.twitter = link;
						} else if (
							link.includes("facebook.com/") &&
							!link.includes("campfirejp")
						) {
							contactInfo.facebook = link;
						} else if (
							link.includes("instagram.com/") &&
							!link.includes("campfire_jp")
						) {
							contactInfo.instagram = link;
						} else if (
							link.includes("http") &&
							!link.includes("camp-fire.jp") &&
							!link.includes("static.camp-fire.jp") &&
							!link.includes("facebook.com/campfire") &&
							!link.includes("twitter.com/campfire") &&
							!contactInfo.website
						) {
							contactInfo.website = link;
						}
					});

					// Extract phone number (Japanese and international formats)
					const phonePatterns = [
						/\+81[-\s]?\d{1,4}[-\s]?\d{4}[-\s]?\d{4}/, // +81 format
						/0\d{1,4}-\d{2,4}-\d{4}/, // Japanese format with dashes
						/0\d{9,10}/, // Japanese format without dashes
						/\d{3}-\d{3}-\d{4}/, // US format
						/\d{10,11}/, // Simple digit sequence
					];

					for (const pattern of phonePatterns) {
						const phoneMatch = allText.match(pattern);
						if (phoneMatch) {
							contactInfo.phone = phoneMatch[0];
							break;
						}
					}

					return {
						ownerName,
						ownerProfile,
						ownerImage,
						contactInfo,
					};
				});

				// Enhance the project with owner information
				const enhancedProject = {
					...project,
					creator: ownerInfo.ownerName || "Unknown",
					ownerProfile: ownerInfo.ownerProfile || "",
					ownerImage: ownerInfo.ownerImage || "",
					contactInfo: ownerInfo.contactInfo,
				};

				enhancedProjects.push(enhancedProject);

				// Short delay between requests to be respectful
				await new Promise((resolve) => setTimeout(resolve, 500));
			} catch (error) {
				console.error(
					`❌ Error fetching owner info for project: ${error.message}`
				);
				// If we can't get owner info, add the project as-is
				enhancedProjects.push({
					...project,
					creator: "Unknown",
					ownerProfile: "",
					ownerImage: "",
					contactInfo: {
						email: "",
						twitter: "",
						facebook: "",
						instagram: "",
						website: "",
						phone: "",
					},
				});
			}
		}

		return enhancedProjects;
	}

	async extractOwnerInfo(projectUrl) {
		try {
			// Navigate to the project page to get owner profile link
			await this.page.goto(projectUrl, {
				waitUntil: "domcontentloaded",
				timeout: 10000,
			});
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Extract owner profile link from project page
			const ownerProfileLink = await this.page.evaluate(() => {
				// Look for the owner name/link in the project page
				const ownerSelectors = [
					'a[href*="/profile/"]',
					".project-owner a",
					".owner-info a",
					"a.i-am-owner",
					'[class*="owner"] a[href*="/profile/"]',
				];

				for (const selector of ownerSelectors) {
					const element = document.querySelector(selector);
					if (element && element.href && element.href.includes("/profile/")) {
						return element.href;
					}
				}
				return null;
			});

			if (!ownerProfileLink) {
				console.log("❌ No owner profile link found");
				return {
					name: "",
					profileUrl: "",
					profileImage: "",
					location: "",
					contactInfo: {},
				};
			}

			console.log(`🔍 Found owner profile link: ${ownerProfileLink}`);

			// Navigate to owner profile page
			await this.page.goto(ownerProfileLink, {
				waitUntil: "domcontentloaded",
				timeout: 10000,
			});
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Extract detailed owner information
			const ownerInfo = await this.page.evaluate(() => {
				const result = {
					name: "",
					profileUrl: window.location.href,
					profileImage: "",
					location: "",
					country: "",
					birthplace: "",
					contactInfo: {},
				};

				// Extract owner name
				const nameSelectors = [
					".username h1",
					"h1",
					".profile-name",
					".owner-name",
				];

				for (const selector of nameSelectors) {
					const nameElement = document.querySelector(selector);
					if (nameElement && nameElement.textContent.trim()) {
						result.name = nameElement.textContent.trim();
						break;
					}
				}

				// Extract profile image
				const imageSelectors = [
					".circle-cut img",
					".profile-image img",
					".user-image img",
					".avatar img",
				];

				for (const selector of imageSelectors) {
					const imgElement = document.querySelector(selector);
					if (imgElement && imgElement.src) {
						result.profileImage = imgElement.src;
						break;
					}
				}

				// Extract location information
				const locationElements = document.querySelectorAll(
					".pref li, .location li, ul.pref li"
				);
				locationElements.forEach((element) => {
					const text = element.textContent.trim();
					if (text.includes("在住国：")) {
						result.country = text.replace("在住国：", "").trim();
					} else if (text.includes("現在地：")) {
						result.location = text.replace("現在地：", "").trim();
					} else if (text.includes("出身地：")) {
						result.birthplace = text.replace("出身地：", "").trim();
					}
				});

				// Extract contact information (SNS links)
				const contactLinks = document.querySelectorAll(
					".url li a, .contact-links a, .social-links a"
				);
				contactLinks.forEach((link) => {
					const url = link.href;
					const text = link.textContent.trim();

					if (url.includes("instagram.com")) {
						if (!result.contactInfo.instagram)
							result.contactInfo.instagram = [];
						result.contactInfo.instagram.push(url);
					} else if (url.includes("twitter.com") || url.includes("x.com")) {
						result.contactInfo.twitter = url;
					} else if (url.includes("facebook.com")) {
						result.contactInfo.facebook = url;
					} else if (url.includes("youtube.com")) {
						result.contactInfo.youtube = url;
					} else if (url.includes("linkedin.com")) {
						result.contactInfo.linkedin = url;
					} else if (url.includes("tiktok.com")) {
						result.contactInfo.tiktok = url;
					} else if (url.includes("mailto:")) {
						result.contactInfo.email = url.replace("mailto:", "");
					} else if (url.includes("tel:")) {
						result.contactInfo.phone = url.replace("tel:", "");
					} else if (url.startsWith("http") && !url.includes("camp-fire.jp")) {
						// Other website links
						if (!result.contactInfo.websites) result.contactInfo.websites = [];
						result.contactInfo.websites.push(url);
					}
				});

				return result;
			});

			console.log(`✅ Extracted owner info for: ${ownerInfo.name}`);
			return ownerInfo;
		} catch (error) {
			console.error("❌ Error extracting owner info:", error);
			return {
				name: "",
				profileUrl: "",
				profileImage: "",
				location: "",
				contactInfo: {},
			};
		}
	}
}

module.exports = CampfireScraper;
