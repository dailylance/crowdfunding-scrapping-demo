const fs = require("fs").promises;
const path = require("path");

// Test Japanese translation on existing Kickstarter data
async function testJapaneseTranslation() {
	console.log(
		"Testing Japanese content translation on existing Kickstarter data...\n"
	);

	try {
		// Read the existing English Kickstarter file
		const englishFilePath = path.join(
			__dirname,
			"results",
			"kickstarter_art",
			"kickstarter_english_art.json"
		);
		const englishData = JSON.parse(await fs.readFile(englishFilePath, "utf8"));

		console.log(
			"📁 Found existing English Kickstarter data with",
			englishData.results.length,
			"projects"
		);

		// Take the first project as a test
		const testProject = englishData.results[0];
		console.log("\n🧪 Testing with project:", testProject.title);

		// Value translation mappings (same as in baseScraper.js)
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

		// Field mapping
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

		// Translate field names and values
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

		console.log("\n✅ Field and value translation completed");
		console.log("\n📊 Sample translations:");
		console.log("- 'successful' →", japaneseProject["ステータス"]);
		console.log("- 'United States' →", japaneseProject["オーナー国"]);
		console.log("- 'Kickstarter' →", japaneseProject["プラットフォーム"]);

		// Test content translation via translation API
		console.log("\n🌐 Testing content translation via API...");

		try {
			const titleResponse = await fetch(
				"http://localhost:5000/v1/translate-text",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						text: testProject.title,
						target_language: "ja",
					}),
				}
			);

			if (titleResponse.ok) {
				const titleData = await titleResponse.json();
				japaneseProject["タイトル"] = titleData.translated_text;
				console.log("✅ Title translated:");
				console.log("  Original:", testProject.title);
				console.log("  Japanese:", titleData.translated_text);
			} else {
				console.log("❌ Title translation failed");
			}
		} catch (error) {
			console.log("⚠️ Translation API not available:", error.message);
		}

		// Show final result
		console.log("\n📋 Final Japanese project structure:");
		const sampleFields = [
			"URL",
			"タイトル",
			"ステータス",
			"オーナー国",
			"プラットフォーム",
			"金額",
		];
		sampleFields.forEach((field) => {
			if (japaneseProject[field]) {
				console.log(`  ${field}: ${japaneseProject[field]}`);
			}
		});

		console.log("\n🎉 Japanese translation test completed!");
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

testJapaneseTranslation();
