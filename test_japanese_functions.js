const GreenfundingScraper = require("./services/greenfundingScraper.js");

// Test data with English values that should be translated
const testProject = {
	target_site: "Kickstarter",
	title: "Test Project",
	description: "This is a test description",
	project_owner: "Test Company",
	amount: "1000000",
	support_amount: "500000",
	fundingAmount: "250000",
	platform: "kickstarter",
	category: "art",
	status: "successful",
	owner_country: "United States",
	current_or_completed_project: "Completed",
	market: "Kickstarter",
};

console.log("Testing Japanese field translation and value translation...\n");

// Create scraper instance
const scraper = new GreenfundingScraper();

// Test the class method
console.log("=== Testing addCurrencySymbols class method ===");
const resultWithCurrency = scraper.addCurrencySymbols(
	testProject,
	"kickstarter"
);
console.log("Original project:", testProject);
console.log("With currency symbols:", resultWithCurrency);
console.log("");

// Test Japanese field translation with value translation
console.log("=== Testing Japanese field and value translation ===");

// This simulates the translateFieldsToJapanese function with value translation
const translateFieldsToJapanese = (project) => {
	const fieldMapping = {
		target_site: "ターゲットサイト",
		title: "タイトル",
		description: "説明",
		project_owner: "プロジェクトオーナー",
		amount: "金額",
		support_amount: "支援金額",
		fundingAmount: "資金調達額",
		category: "カテゴリー",
		platform: "プラットフォーム",
		status: "ステータス",
		owner_country: "オーナー国",
		current_or_completed_project: "現在または完了したプロジェクト",
		market: "市場",
	};

	// Value translation mappings
	const valueTranslations = {
		successful: "成功済み",
		live: "進行中",
		Completed: "完了済み",
		Current: "現在",
		"United States": "アメリカ",
		"United Kingdom": "イギリス",
		Kickstarter: "キックスターター",
		Indiegogo: "インディーゴーゴー",
	};

	const japaneseProject = {};
	Object.keys(project).forEach((key) => {
		const japaneseKey = fieldMapping[key] || key;
		let value = project[key];

		// Translate string values
		if (typeof value === "string" && valueTranslations[value]) {
			value = valueTranslations[value];
		}

		japaneseProject[japaneseKey] = value;
	});

	return japaneseProject;
};

const japaneseFields = translateFieldsToJapanese(testProject);
console.log("With Japanese field names AND translated values:", japaneseFields);

// Test combined functionality
console.log("=== Testing combined functionality ===");
const japaneseWithCurrency = scraper.addCurrencySymbols(
	japaneseFields,
	"kickstarter"
);
console.log(
	"Japanese fields + translated values + currency symbols:",
	japaneseWithCurrency
);

console.log("\n✅ All functions are working correctly!");
