module.exports = {
	scraper: {
		port: process.env.PORT || 3001,
		timeout: 120000, // 2 minutes
		batchSize: 5,
		maxRetries: 3,
		delayBetweenRequests: 2000, // 2 seconds
	},
	ocr: {
		serviceUrl: process.env.OCR_SERVICE_URL || "http://localhost:5000",
		timeout: 120000, // 2 minutes
		enableByDefault: true,
		maxImagesPerProject: 5,
		imageMinWidth: 200,
		imageMinHeight: 150,
	},
	output: {
		directory: "./results",
		format: "json",
		includeTimestamp: true,
		saveOriginalAndEnhanced: true,
	},
	requiredFields: [
		"project_owner",
		"owner_website",
		"owner_sns",
		"contact_info",
		"achievement_rate",
		"supporters",
		"amount",
		"support_amount",
		"crowdfund_start_date",
		"crowdfund_end_date",
		"title",
	],
	logs: {
		level: process.env.LOG_LEVEL || "info",
		enableFileLogging: true,
		logDirectory: "./logs",
	},
};
