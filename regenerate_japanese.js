const fs = require("fs").promises;
const path = require("path");
const BaseScraper = require("./services/baseScraper");

// Regenerate Japanese file with new translation logic
async function regenerateJapaneseFile() {
	console.log("🔄 Regenerating Japanese file with new translation logic...\n");

	try {
		// Read the existing English file
		const englishFilePath = path.join(
			__dirname,
			"results",
			"kickstarter_art",
			"kickstarter_english_art.json"
		);
		const englishData = JSON.parse(await fs.readFile(englishFilePath, "utf8"));

		console.log(
			`📁 Loaded ${englishData.results.length} projects from English file`
		);

		// Create base scraper instance to use translation methods
		const baseScraper = new BaseScraper();

		// Use the translation logic from baseScraper
		const translateFieldsToJapanese = (project) => {
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
				Japan: "日本",
				Korea: "韓国",
				China: "中国",
				Kickstarter: "キックスターター",
				Indiegogo: "インディーゴーゴー",
				GoFundMe: "ゴーファンドミー",
			};

			const japaneseProject = {};

			Object.keys(project).forEach((key) => {
				const japaneseKey = fieldMapping[key] || key;
				let value = project[key];

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
					if (typeof value === "string" && valueTranslations[value]) {
						value = valueTranslations[value];
					}
					japaneseProject[japaneseKey] = value;
				}
			});

			return japaneseProject;
		};

		// Process all projects
		console.log("🌐 Applying Japanese translation...");
		const translatedResults = englishData.results.map((project, index) => {
			// First translate field names and static values
			let japaneseProject = translateFieldsToJapanese(project);

			// Apply content translation for English platforms
			const platform = "kickstarter";
			const englishPlatforms = ["kickstarter", "indiegogo", "gofundme"];
			const isEnglishPlatform = englishPlatforms.includes(
				platform.toLowerCase()
			);

			if (isEnglishPlatform) {
				// Translate title
				if (
					japaneseProject["タイトル"] &&
					typeof japaneseProject["タイトル"] === "string"
				) {
					const title = japaneseProject["タイトル"];
					let translatedTitle = title
						.replace(/\bPortable\b/gi, "ポータブル")
						.replace(/\bSwing Chair\b/gi, "スイングチェア")
						.replace(/\bSet Up\b/gi, "セットアップ")
						.replace(/\bUnwind\b/gi, "リラックス")
						.replace(/\bAll Day\b/gi, "一日中")
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
						.replace(/\bAustralian\b/gi, "オーストラリアの")
						.replace(/\banymaka\b/gi, "エニマカ");

					japaneseProject["タイトル"] = translatedTitle;
					if (index < 3) {
						console.log(
							`  📝 [${index + 1}] Title: "${title}" → "${translatedTitle}"`
						);
					}
				}

				// Translate description
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
						.replace(/\banymaka\b/gi, "エニマカ");

					japaneseProject["説明"] = translatedDesc;
					if (index < 3) {
						console.log(`  📄 [${index + 1}] Description translated`);
					}
				}
			}

			// Add currency symbols (¥)
			if (
				japaneseProject["金額"] &&
				typeof japaneseProject["金額"] === "string"
			) {
				japaneseProject["金額"] =
					"¥" + japaneseProject["金額"].replace(/[$]/g, "");
			}
			if (
				japaneseProject["支援金額"] &&
				typeof japaneseProject["支援金額"] === "string"
			) {
				japaneseProject["支援金額"] =
					"¥" + japaneseProject["支援金額"].replace(/[$]/g, "");
			}

			return japaneseProject;
		});

		// Create Japanese metadata
		const japaneseOutput = {
			成功: true,
			プラットフォーム: "kickstarter",
			カテゴリー: "art",
			キーワード: "art",
			件数: englishData.results.length,
			強化件数: englishData.results.filter((r) => r.ocr_enhanced).length,
			エラー件数: englishData.results.filter((r) => r.ocr_error).length,
			強化率:
				englishData.results.length > 0
					? (
							(englishData.results.filter((r) => r.ocr_enhanced).length /
								englishData.results.length) *
							100
					  ).toFixed(2) + "%"
					: "0%",
			生成日時: new Date().toISOString(),
			処理サマリー: {
				総プロジェクト数: englishData.results.length,
				OCR強化済み: englishData.results.filter((r) => r.ocr_enhanced).length,
				OCRエラー: englishData.results.filter((r) => r.ocr_error).length,
				OCRなしで完了: englishData.results.filter(
					(r) => !r.ocr_enhanced && !r.ocr_error
				).length,
			},
			ファイル: "kickstarter_japanese_art.json",
			言語: "japanese",
			フォルダ: "kickstarter_art",
			翻訳ノート:
				"すべてのデータは日本語に翻訳されています。英語プラットフォームのコンテンツはキーワードベースの翻訳が適用されています。",
			結果: translatedResults,
		};

		// Write Japanese file
		const japaneseFilePath = path.join(
			__dirname,
			"results",
			"kickstarter_art",
			"kickstarter_japanese_art.json"
		);
		await fs.writeFile(
			japaneseFilePath,
			JSON.stringify(japaneseOutput, null, 2),
			"utf8"
		);

		console.log(`\\n✅ Japanese file regenerated: ${japaneseFilePath}`);
		console.log(
			`📊 ${translatedResults.length} projects with Japanese content translation`
		);
		console.log("\\n🎉 Regeneration completed!");
	} catch (error) {
		console.error("❌ Regeneration failed:", error.message);
	}
}

regenerateJapaneseFile();
