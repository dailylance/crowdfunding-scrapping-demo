const fs = require("fs").promises;
const path = require("path");

// Test translation functionality manually
async function testTranslationLogic() {
	console.log("🧪 Testing Japanese Translation Logic Manually\n");

	// Load existing English data
	const englishFilePath = path.join(
		__dirname,
		"results",
		"kickstarter_art",
		"kickstarter_english_art.json"
	);

	try {
		const englishData = JSON.parse(await fs.readFile(englishFilePath, "utf8"));
		console.log(
			`📁 Loaded ${englishData.results.length} projects from English file`
		);

		// Test with first project
		const testProject = englishData.results[0];
		console.log(`🎯 Testing with: "${testProject.title}"\n`);

		// Field mapping (same as in baseScraper.js)
		const fieldMapping = {
			url: "URL",
			title: "タイトル",
			original_title: "元のタイトル",
			project_owner: "プロジェクトオーナー",
			image: "画像",
			status: "ステータス",
			location: "場所",
			owner_country: "オーナー国",
			market: "市場",
			platform: "プラットフォーム",
			target_site: "ターゲットサイト",
			description: "説明",
			crowdfund_start_date: "クラウドファンディング開始日",
			crowdfund_end_date: "クラウドファンディング終了日",
			support_amount: "支援金額",
			current_or_completed_project: "現在または完了したプロジェクト",
			achievement_rate: "達成率",
			supporters: "サポーター",
			amount: "金額",
			ocr_enhanced: "OCR強化",
			confidence_scores: "信頼度スコア",
			images_processed: "処理済み画像数",
			enhancement_timestamp: "強化タイムスタンプ",
			enhanced_data_original: "強化データ原語",
			original_description: "元の説明",
			original_project_owner: "元のプロジェクトオーナー",
			translation_note: "翻訳ノート",
		};

		// Value translations
		const valueTranslations = {
			successful: "成功済み",
			live: "進行中",
			canceled: "キャンセル済み",
			suspended: "停止中",
			failed: "失敗",
			Current: "現在",
			Completed: "完了済み",
			"United States": "アメリカ",
			"United Kingdom": "イギリス",
			Canada: "カナダ",
			Australia: "オーストラリア",
			Germany: "ドイツ",
			France: "フランス",
			Netherlands: "オランダ",
			Sweden: "スウェーデン",
			Kickstarter: "キックスターター",
			Indiegogo: "インディーゴーゴー",
		};

		// Step 1: Translate field names and static values
		console.log("📝 Step 1: Translating field names and static values...");
		const japaneseProject = {};
		Object.keys(testProject).forEach((key) => {
			const japaneseKey = fieldMapping[key] || key;
			let value = testProject[key];

			// Handle objects
			if (
				typeof value === "object" &&
				value !== null &&
				!Array.isArray(value)
			) {
				if (key === "confidence_scores") {
					const confidenceMapping = {
						title_translation: "タイトル翻訳",
						description_translation: "説明翻訳",
						project_owner_translation: "プロジェクトオーナー翻訳",
					};
					const translatedObject = {};
					Object.keys(value).forEach((subKey) => {
						const translatedSubKey = confidenceMapping[subKey] || subKey;
						translatedObject[translatedSubKey] = value[subKey];
					});
					japaneseProject[japaneseKey] = translatedObject;
				} else {
					japaneseProject[japaneseKey] = value;
				}
			} else {
				// Translate string values
				if (typeof value === "string" && valueTranslations[value]) {
					value = valueTranslations[value];
				}
				japaneseProject[japaneseKey] = value;
			}
		});

		console.log("✅ Field mapping completed");
		console.log(
			`   status: "${testProject.status}" → "${japaneseProject["ステータス"]}"`
		);
		console.log(
			`   platform: "${testProject.platform}" → "${japaneseProject["プラットフォーム"]}"`
		);
		console.log(
			`   owner_country: "${testProject.owner_country}" → "${japaneseProject["オーナー国"]}"`
		);

		// Step 2: Content translation for English platforms
		console.log("\n🌐 Step 2: Content translation for English platforms...");

		const englishPlatforms = ["kickstarter", "indiegogo", "gofundme"];
		const platform = "kickstarter"; // Current platform
		const isEnglishPlatform = englishPlatforms.includes(platform.toLowerCase());

		if (isEnglishPlatform) {
			console.log(
				`   Platform "${platform}" is English - applying content translation`
			);

			// Translate title
			if (
				japaneseProject["タイトル"] &&
				typeof japaneseProject["タイトル"] === "string"
			) {
				const originalTitle = japaneseProject["タイトル"];
				let translatedTitle = originalTitle
					.replace(/\\bPortable\\b/gi, "ポータブル")
					.replace(/\\bSwing Chair\\b/gi, "スイングチェア")
					.replace(/\\bSet Up\\b/gi, "セットアップ")
					.replace(/\\bUnwind\\b/gi, "リラックス")
					.replace(/\\bAll Day\\b/gi, "一日中")
					.replace(/\\bArt\\b/gi, "アート")
					.replace(/\\bFine Art\\b/gi, "ファインアート")
					.replace(/\\banymaka\\b/gi, "エニマカ");

				japaneseProject["タイトル"] = translatedTitle;
				console.log(`   📝 Title translation:`);
				console.log(`      Original: "${originalTitle}"`);
				console.log(`      Japanese: "${translatedTitle}"`);
			}

			// Translate description
			if (
				japaneseProject["説明"] &&
				typeof japaneseProject["説明"] === "string"
			) {
				const originalDesc = japaneseProject["説明"];
				let translatedDesc = originalDesc
					.replace(/\\binnovative project\\b/gi, "革新的なプロジェクト")
					.replace(
						/\\bexciting campaign\\b/gi,
						"エキサイティングなキャンペーン"
					)
					.replace(/\\bhas attracted\\b/gi, "は")
					.replace(/\\bbackers and raised\\b/gi, "のバッカーから")
					.replace(/\\btowards its goal\\b/gi, "の目標に向けて調達しました")
					.replace(/\\bcreated by\\b/gi, "によって作成された")
					.replace(/\\bKickstarter\\b/gi, "キックスターター")
					.replace(/\\bIndiegogo\\b/gi, "インディーゴーゴー")
					.replace(/\\bproject on\\b/gi, "のプロジェクトは")
					.replace(
						/\\bThis exciting campaign\\b/gi,
						"このエキサイティングなキャンペーン"
					)
					.replace(/\\banymaka\\b/gi, "エニマカ");

				japaneseProject["説明"] = translatedDesc;
				console.log(`   📄 Description translation:`);
				console.log(`      Original: "${originalDesc}"`);
				console.log(`      Japanese: "${translatedDesc}"`);
			}
		}

		// Step 3: Show final result
		console.log("\n📋 Final Japanese Project Structure:");
		const displayFields = [
			"URL",
			"タイトル",
			"ステータス",
			"プラットフォーム",
			"オーナー国",
			"金額",
			"説明",
		];
		displayFields.forEach((field) => {
			if (japaneseProject[field]) {
				let value = japaneseProject[field];
				if (typeof value === "string" && value.length > 100) {
					value = value.substring(0, 100) + "...";
				}
				console.log(`  ${field}: ${value}`);
			}
		});

		// Test creating full file format
		console.log("\n💾 Creating Japanese file format...");
		const japaneseOutput = {
			成功: true,
			プラットフォーム: "kickstarter",
			カテゴリー: "art",
			キーワード: "art",
			件数: 1,
			強化件数: 1,
			エラー件数: 0,
			強化率: "100.00%",
			生成日時: new Date().toISOString(),
			処理サマリー: {
				総プロジェクト数: 1,
				OCR強化済み: 1,
				OCRエラー: 0,
				OCRなしで完了: 0,
			},
			ファイル: "kickstarter_japanese_art.json",
			言語: "japanese",
			フォルダ: "kickstarter_art",
			翻訳ノート: "すべてのデータは日本語に翻訳されています。",
			結果: [japaneseProject],
		};

		// Write test file
		const testFilePath = path.join(__dirname, "test_japanese_output.json");
		await fs.writeFile(
			testFilePath,
			JSON.stringify(japaneseOutput, null, 2),
			"utf8"
		);
		console.log(`✅ Test Japanese file created: ${testFilePath}`);

		console.log("\n🎉 Translation test completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

testTranslationLogic();
