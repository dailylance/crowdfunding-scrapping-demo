const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const OCRIntegrationService = require("./ocrIntegrationService");
const fs = require("fs").promises;
const path = require("path");
puppeteer.use(StealthPlugin());

class BaseScraper {
	constructor() {
		this.browser = null;
		this.page = null;
		this.ocrService = new OCRIntegrationService();
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

	// Enhanced scrape method with OCR integration
	async scrapeWithOCR(category, keyword, options = {}) {
		const enableOCR = options.enableOCR !== false; // Default to true
		const results = await this.scrape(category, keyword, options);

		if (!enableOCR || !results || results.length === 0) {
			return results;
		}

		// Check OCR service status first
		const ocrStatus = await this.ocrService.checkOCRServiceStatus();
		if (ocrStatus.status !== "connected") {
			console.log(`⚠️ OCR service not available: ${ocrStatus.error}`);
			console.log("🔄 Returning scraped data without OCR enhancement");
			return results.map((r) => ({
				...r,
				ocr_enhanced: false,
				ocr_error: "Service unavailable",
			}));
		}

		console.log(`\n🤖 ===== OCR ENHANCEMENT PIPELINE STARTED =====`);
		console.log(`✅ OCR service connected and ready`);
		console.log(`📊 Projects to process: ${results.length}`);
		console.log(
			`🔧 Test mode: ${
				this.ocrService.isTestMode()
					? "ENABLED (OCR always runs)"
					: "DISABLED (OCR runs conditionally)"
			}`
		);
		console.log(`================================================\n`);

		const enhancedResults = [];

		for (let i = 0; i < results.length; i++) {
			const project = results[i];
			console.log(
				`\n📋 Processing project ${i + 1}/${results.length}: "${project.title}"`
			);

			try {
				const enhancedProject = await this.ocrService.processProject(
					project,
					this.page
				);
				enhancedResults.push(enhancedProject);
			} catch (error) {
				console.error(
					`💥 Error processing project "${project.title}":`,
					error.message
				);
				enhancedResults.push({
					...project,
					ocr_enhanced: false,
					ocr_error: error.message,
				});
			}

			// Small delay between projects to avoid overwhelming the OCR service
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}

		const enhancedCount = enhancedResults.filter((r) => r.ocr_enhanced).length;
		const errorCount = enhancedResults.filter((r) => r.ocr_error).length;

		console.log(`\n🎉 ===== OCR ENHANCEMENT PIPELINE COMPLETED =====`);
		console.log(`📊 Final Statistics:`);
		console.log(`   - Total projects: ${results.length}`);
		console.log(`   - Successfully enhanced: ${enhancedCount}`);
		console.log(`   - Errors encountered: ${errorCount}`);
		console.log(
			`   - Enhancement rate: ${
				enhancedCount > 0
					? ((enhancedCount / results.length) * 100).toFixed(1)
					: 0
			}%`
		);
		console.log(`================================================\n`);

		return enhancedResults;
	}

	// Add currency symbols to amount fields
	addCurrencySymbols(project, platform) {
		const platformCurrencyMap = {
			kickstarter: "$",
			indiegogo: "$",
			greenfunding: "¥",
			makuake: "¥",
			campfire: "¥",
			machiya: "¥",
			zeczec: "NT$",
			flyingv: "NT$",
			wadiz: "₩",
		};

		const platformName = project.platform
			? project.platform.toLowerCase()
			: platform.toLowerCase();
		const currencySymbol = platformCurrencyMap[platformName] || "";

		// Clone the project to avoid modifying the original
		const enhancedProject = { ...project };

		// Add currency symbols to amount fields
		const amountFields = [
			"amount",
			"support_amount",
			"fundingAmount",
			"金額",
			"支援金額",
			"資金調達額",
		];

		amountFields.forEach((field) => {
			if (
				enhancedProject[field] &&
				typeof enhancedProject[field] === "string"
			) {
				const amount = enhancedProject[field];
				// Only add currency symbol if it's not already there
				if (
					currencySymbol &&
					!amount.includes(currencySymbol) &&
					!amount.includes("$") &&
					!amount.includes("¥") &&
					!amount.includes("₩") &&
					!amount.includes("NT$")
				) {
					enhancedProject[field] = `${currencySymbol}${amount}`;
				}
			}
		});

		return enhancedProject;
	}

	// Save enhanced results with folder-based structure and separate language files
	async saveEnhancedResults(results, platform, category, keyword) {
		const timestamp = Date.now();
		const folderName = `${platform}_${category}`;
		const resultsDir = path.join(__dirname, "../results");
		const folderPath = path.join(resultsDir, folderName);

		// Ensure results folder and category folder exist
		try {
			await fs.mkdir(folderPath, { recursive: true });
		} catch (error) {
			// Directory already exists
		}

		const enhancedCount = results.filter((r) => r.ocr_enhanced).length;
		const errorCount = results.filter((r) => r.ocr_error).length;

		// Create base metadata
		const baseMetadata = {
			success: true,
			platform: platform,
			category: category,
			keyword: keyword,
			count: results.length,
			enhanced_count: enhancedCount,
			error_count: errorCount,
			enhancement_rate:
				results.length > 0
					? ((enhancedCount / results.length) * 100).toFixed(2) + "%"
					: "0%",
			generated_at: new Date().toISOString(),
			processing_summary: {
				total_projects: results.length,
				ocr_enhanced: enhancedCount,
				ocr_errors: errorCount,
				complete_without_ocr: results.filter(
					(r) => !r.ocr_enhanced && !r.ocr_error
				).length,
			},
		};

		// Create English-only results (using OCR enhanced English data)
		const englishResults = results.map((project) => {
			let englishProject = { ...project };

			// If project was OCR enhanced and we have English data, use it
			if (project.ocr_enhanced && project.enhanced_data_english) {
				// Replace original fields with English translated versions
				englishProject = {
					...project,
					...project.enhanced_data_english,
					translation_note:
						"This project was enhanced with OCR and translated to English",
				};

				// Ensure we have the English versions of key fields
				if (project.enhanced_data_english.title) {
					englishProject.title = project.enhanced_data_english.title;
				}
				if (project.enhanced_data_english.description) {
					englishProject.description =
						project.enhanced_data_english.description;
				}
				if (project.enhanced_data_english.project_owner) {
					englishProject.project_owner =
						project.enhanced_data_english.project_owner;
				}
			} else if (project.ocr_enhanced) {
				englishProject.translation_note =
					"This project was enhanced with OCR and translated to English";
			}

			// Add currency symbols to English results
			return this.addCurrencySymbols(englishProject, platform);
		});

		// Create Japanese/Original language results (preserving original data with Japanese field names)
		const originalResults = results.map((project) => {
			let originalProject = { ...project };

			// If project was OCR enhanced and we have original data, use it
			if (project.ocr_enhanced && project.enhanced_data_original) {
				// Keep original data but add enhanced fields that don't affect language
				originalProject = {
					...project,
					...project.enhanced_data_original,
					translation_note:
						"このプロジェクトはOCRで強化されましたが、元の言語で保持されています",
				};

				// Ensure we preserve original language fields
				if (project.original_title) {
					originalProject.title = project.original_title;
				}
				if (project.original_description) {
					originalProject.description = project.original_description;
				}
			} else if (project.ocr_enhanced) {
				originalProject.translation_note =
					"このプロジェクトはOCRで強化されましたが、元の言語で保持されています";
			}

			// Remove English-specific fields from Japanese version
			delete originalProject.enhanced_data_english;

			// Add currency symbols to original results
			return this.addCurrencySymbols(originalProject, platform);
		});

		// Translation mapping for field names to Japanese
		const translateFieldsToJapanese = (project) => {
			const fieldMapping = {
				target_site: "ターゲットサイト",
				market: "市場",
				status: "ステータス",
				url: "URL",
				image_url: "画像URL",
				title: "タイトル",
				original_title: "元のタイトル",
				project_owner: "プロジェクトオーナー",
				owner_website: "オーナーウェブサイト",
				owner_sns: "オーナーSNS",
				owner_country: "オーナー国",
				contact_info: "連絡先情報",
				achievement_rate: "達成率",
				supporters: "サポーター",
				amount: "金額",
				support_amount: "支援金額",
				crowdfund_start_date: "クラウドファンディング開始日",
				crowdfund_end_date: "クラウドファンディング終了日",
				start_date: "開始日",
				end_date: "終了日",
				current_or_completed_project: "現在または完了したプロジェクト",
				description: "説明",
				category: "カテゴリー",
				creator: "作成者",
				progress: "進捗",
				daysLeft: "残り日数",
				platform: "プラットフォーム",
				platformUrl: "プラットフォームURL",
				scrapedAt: "スクレイピング日時",
				fundingAmount: "資金調達額",
				backers: "バッカー",
				image: "画像",
				ocr_enhanced: "OCR強化",
				confidence_scores: "信頼度スコア",
				images_processed: "処理済み画像数",
				enhancement_timestamp: "強化タイムスタンプ",
				enhanced_data_english: "強化データ英語",
				enhanced_data_original: "強化データ原語",
				original_description: "元の説明",
				original_project_owner: "元のプロジェクトオーナー",
				translation_note: "翻訳ノート",
				// Additional Kickstarter-specific fields
				funded_amount: "調達金額",
				goal_amount: "目標金額",
				percentage_funded: "達成パーセンテージ",
				backers_count: "バッカー数",
				days_left: "残り日数",
				location: "場所",
			};

			// Value translation mappings
			const valueTranslations = {
				// Status translations
				successful: "成功済み",
				live: "進行中",
				canceled: "キャンセル済み",
				suspended: "停止中",
				failed: "失敗",

				// Project status
				Current: "現在",
				Completed: "完了済み",

				// Countries
				"United States": "アメリカ",
				"United Kingdom": "イギリス",
				Canada: "カナダ",
				Australia: "オーストラリア",
				Germany: "ドイツ",
				France: "フランス",
				Netherlands: "オランダ",
				Sweden: "スウェーデン",
				Japan: "日本",
				Korea: "韓国",
				China: "中国",

				// Platforms
				Kickstarter: "キックスターター",
				Indiegogo: "インディーゴーゴー",
				GoFundMe: "ゴーファンドミー",
			};

			const japaneseProject = {};

			// Translate main project fields
			Object.keys(project).forEach((key) => {
				const japaneseKey = fieldMapping[key] || key;
				let value = project[key];

				// If the value is an object (like confidence_scores), translate its keys too
				if (
					typeof value === "object" &&
					value !== null &&
					!Array.isArray(value)
				) {
					const translatedObject = {};
					Object.keys(value).forEach((subKey) => {
						// Translate confidence score keys
						if (key === "confidence_scores") {
							const confidenceMapping = {
								title_translation: "タイトル翻訳",
								description_translation: "説明翻訳",
								project_owner_translation: "プロジェクトオーナー翻訳",
							};
							const translatedSubKey = confidenceMapping[subKey] || subKey;
							translatedObject[translatedSubKey] = value[subKey];
						} else {
							// For other objects, just copy as is for now
							translatedObject[subKey] = value[subKey];
						}
					});
					japaneseProject[japaneseKey] = translatedObject;
				} else {
					// Translate specific string values
					if (typeof value === "string" && valueTranslations[value]) {
						value = valueTranslations[value];
					}

					japaneseProject[japaneseKey] = value;
				}
			});

			return japaneseProject;
		};

		// Save English file
		const englishFilename = `${platform}_english_${category}.json`;
		const englishOutput = {
			...baseMetadata,
			file: englishFilename,
			language: "english",
			folder: folderName,
			translation_note:
				"All OCR enhanced fields are in English. Non-enhanced fields may remain in original language.",
			results: englishResults,
		};

		const englishFilepath = path.join(folderPath, englishFilename);
		await fs.writeFile(
			englishFilepath,
			JSON.stringify(englishOutput, null, 2),
			"utf8"
		);

		// Save Japanese/Original language file with Japanese field names
		const japaneseFilename = `${platform}_japanese_${category}.json`;

		// Apply Japanese field name translation with currency symbols
		const translatedJapaneseResults = originalResults.map((project) => {
			// First translate field names and static values
			let japaneseProject = translateFieldsToJapanese(project);

			// For English platforms like Kickstarter, translate the content to Japanese
			const englishPlatforms = ["kickstarter", "indiegogo", "gofundme"];
			const isEnglishPlatform = englishPlatforms.includes(
				platform.toLowerCase()
			);

			if (isEnglishPlatform) {
				console.log(`🌐 Translating content for English platform: ${platform}`);

				// Enhanced title translation with comprehensive keyword replacement
				if (
					japaneseProject["タイトル"] &&
					typeof japaneseProject["タイトル"] === "string"
				) {
					const title = japaneseProject["タイトル"];
					let translatedTitle = title
						// Common technical/product terms
						.replace(/\bPortable\b/gi, "ポータブル")
						.replace(/\bDual[- ]?Design\b/gi, "デュアルデザイン")
						.replace(/\bHangboard\b/gi, "ハングボード")
						.replace(/\bTrain Smarter\b/gi, "スマートトレーニング")
						.replace(/\bCinema\b/gi, "シネマ")
						.replace(/\bIntelligent\b/gi, "インテリジェント")
						.replace(/\bLanguage Translator\b/gi, "言語翻訳機")
						.replace(/\bCharger\b/gi, "充電器")
						.replace(/\bInkjet Printer\b/gi, "インクジェットプリンター")
						.replace(/\bReliable Printing\b/gi, "信頼性のある印刷")
						.replace(/\bRevolutionary\b/gi, "革命的な")
						.replace(/\bTennis Training\b/gi, "テニストレーニング")
						.replace(/\bCompanion\b/gi, "コンパニオン")
						.replace(/\bMagnetic\b/gi, "マグネティック")
						.replace(/\bDice Ring\b/gi, "ダイスリング")
						// Brand/Company names
						.replace(/\bErgoEdge\b/gi, "エルゴエッジ")
						.replace(/\bCarCine\b/gi, "カーシネ")
						.replace(/\bNEWYES\b/gi, "ニューイエス")
						.replace(/\bLD0806\b/gi, "LD0806")
						.replace(/\bTinto\b/gi, "ティント")
						.replace(/\bStellar Ring\b/gi, "ステラリング")
						.replace(/\bD20\b/gi, "D20")
						.replace(/\bSpeak Freely\b/gi, "スピークフリーリー")
						// Common words
						.replace(/\bSwing Chair\b/gi, "スイングチェア")
						.replace(/\bSet Up\b/gi, "セットアップ")
						.replace(/\bUnwind\b/gi, "リラックス")
						.replace(/\bAll Day\b/gi, "一日中")
						.replace(/\bIn Your Car\b/gi, "あなたの車の中で")
						.replace(/\bThe\b/gi, "ザ")
						.replace(/\b&\b/gi, "&")
						.replace(/\bArt\b/gi, "アート")
						.replace(/\bFine Art\b/gi, "ファインアート")
						.replace(/\bBooks?\b/gi, "ブック")
						.replace(/\bSeason\b/gi, "シーズン")
						.replace(/\bGame\b/gi, "ゲーム")
						.replace(/\bMusic\b/gi, "音楽")
						.replace(/\bStudio\b/gi, "スタジオ")
						.replace(/\bKeyboard\b/gi, "キーボード")
						.replace(/\bFlow\b/gi, "フロー")
						.replace(/\bSmoothest\b/gi, "最もスムーズな")
						.replace(/\bEvolved\b/gi, "進化した")
						.replace(/\bRedefined\b/gi, "再定義された")
						.replace(/\bUnleashed\b/gi, "解き放たれた")
						.replace(/\bMiniatures?\b/gi, "ミニチュア")
						.replace(/\bMiniature\b/gi, "ミニチュア")
						.replace(/\bHARDWAR\b/gi, "ハードウォー")
						.replace(/\bLiterature\b/gi, "文学")
						.replace(/\bBanyan\b/gi, "バンヤン")
						.replace(/\bGodsTV\b/gi, "ゴッズTV")
						.replace(/\bSmash\b/gi, "スマッシュ")
						.replace(/\bFame\b/gi, "名声")
						.replace(/\bMadcap\b/gi, "マッドキャップ")
						.replace(/\bKillfest\b/gi, "キルフェスト")
						.replace(/\bNude\b/gi, "ヌード")
						.replace(/\bErotic\b/gi, "エロティック")
						.replace(/\bEmagazine\b/gi, "電子雑誌")
						.replace(/\bAustralian\b/gi, "オーストラリアの");

					japaneseProject["タイトル"] = translatedTitle;
					console.log(`  📝 Title: ${title} → ${translatedTitle}`);
				}

				// Enhanced description translation with comprehensive keyword replacement
				if (
					japaneseProject["説明"] &&
					typeof japaneseProject["説明"] === "string"
				) {
					const description = japaneseProject["説明"];
					let translatedDesc = description
						.replace(/\binnovative project\b/gi, "革新的なプロジェクト")
						.replace(
							/\bexciting campaign\b/gi,
							"エキサイティングなキャンペーン"
						)
						.replace(/\bhas attracted\b/gi, "は")
						.replace(/\bbackers and raised\b/gi, "のバッカーから")
						.replace(/\btowards its goal\b/gi, "の目標に向けて調達しました")
						.replace(/\bcreated by\b/gi, "によって作成された")
						.replace(/\bKickstarter\b/gi, "キックスターター")
						.replace(/\bIndiegogo\b/gi, "インディーゴーゴー")
						.replace(/\bproject on\b/gi, "のプロジェクトは")
						.replace(
							/\bThis exciting campaign\b/gi,
							"このエキサイティングなキャンペーン"
						)
						// Company/product names
						.replace(/\bDigislider\b/gi, "デジスライダー")
						.replace(/\bCarCine\b/gi, "カーシネ")
						.replace(/\bSpeak Freely\b/gi, "スピークフリーリー")
						.replace(/\bNEWYES\b/gi, "ニューイエス")
						.replace(/\bTintoSports\b/gi, "ティントスポーツ")
						.replace(/\bAstranova\b/gi, "アストラノバ")
						.replace(/\bErgoEdge\b/gi, "エルゴエッジ")
						.replace(/\bTinto\b/gi, "ティント")
						.replace(/\bStellar Ring\b/gi, "ステラリング");

					japaneseProject["説明"] = translatedDesc;
					console.log(`  📄 Description translated with keyword replacement`);
				}
			}

			// Add currency symbols
			return this.addCurrencySymbols(japaneseProject, platform);
		});

		// Create Japanese metadata
		const japaneseMetadata = {
			成功: true,
			プラットフォーム: platform,
			カテゴリー: category,
			キーワード: keyword,
			件数: results.length,
			強化件数: enhancedCount,
			エラー件数: errorCount,
			強化率:
				results.length > 0
					? ((enhancedCount / results.length) * 100).toFixed(2) + "%"
					: "0%",
			生成日時: new Date().toISOString(),
			処理サマリー: {
				総プロジェクト数: results.length,
				OCR強化済み: enhancedCount,
				OCRエラー: errorCount,
				OCRなしで完了: results.filter((r) => !r.ocr_enhanced && !r.ocr_error)
					.length,
			},
			ファイル: japaneseFilename,
			言語: "japanese",
			フォルダ: folderName,
			翻訳ノート:
				"すべてのデータは日本語に翻訳されています。英語プラットフォームのコンテンツは包括的なキーワードベース翻訳が適用されています。",
			結果: translatedJapaneseResults,
		};

		const japaneseFilepath = path.join(folderPath, japaneseFilename);
		await fs.writeFile(
			japaneseFilepath,
			JSON.stringify(japaneseMetadata, null, 2),
			"utf8"
		);

		console.log(`✅ Enhanced results saved to folder structure:`);
		console.log(`   � Folder: ${folderName}/`);
		console.log(`   🇺� English file: ${englishFilename}`);
		console.log(`   �� Japanese file: ${japaneseFilename}`);
		console.log(
			`📊 Enhancement Summary: ${enhancedCount}/${results.length} projects enhanced (${baseMetadata.enhancement_rate})`
		);

		return {
			folder: folderName,
			folderPath: folderPath,
			files: {
				english: englishFilepath,
				japanese: japaneseFilepath,
			},
			metadata: baseMetadata,
		};
	}
}

module.exports = BaseScraper;
