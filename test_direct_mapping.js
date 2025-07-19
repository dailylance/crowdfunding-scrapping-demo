const { prisma } = require("./lib/db");

async function testDirectMapping() {
	try {
		console.log("🔍 Testing direct field mapping...");

		// Sample data from the response
		const sampleItem = {
			url: "https://www.kickstarter.com/projects/direwolfdigital/clank-catacombs-underworld",
			title: "Clank! Catacombs: Underworld",
			original_title: "Clank! Catacombs: Underworld",
			project_owner: "Dire Wolf",
			image: "https://example.com/image.jpg",
			funded_amount: 46066,
			goal_amount: 52894,
			percentage_funded: 87,
			backers_count: 1506,
			days_left: 4,
			status: "live",
			location: "San Francisco, CA",
			owner_country: "United States",
			market: "Kickstarter",
			platform: "kickstarter",
			target_site: "Kickstarter",
			description: "Test description",
			crowdfund_start_date: "2025-06-23",
			crowdfund_end_date: "2025-07-23",
			support_amount: "$52,894",
			current_or_completed_project: "Current",
			achievement_rate: "87%",
			supporters: "1506",
			amount: "$46,066",
			category: "technology",
			keyword: "gaming",
			language: "en",
			ocrEnabled: false,
		};

		// Test field extraction
		const raisedAmount =
			sampleItem.amount ||
			(sampleItem.funded_amount ? String(sampleItem.funded_amount) : null);
		const goalAmount =
			sampleItem.support_amount ||
			(sampleItem.goal_amount ? String(sampleItem.goal_amount) : null);
		const backersCount =
			sampleItem.supporters ||
			(sampleItem.backers_count ? String(sampleItem.backers_count) : null);

		console.log("🔍 Field extraction test:");
		console.log("- raisedAmount:", raisedAmount);
		console.log("- goalAmount:", goalAmount);
		console.log("- backersCount:", backersCount);

		// Get a test user
		const testUser = await prisma.user.findFirst();
		console.log("👤 Test user:", testUser.email);

		// Create a test search
		const testSearch = await prisma.search.create({
			data: {
				userId: testUser.id,
				platform: "kickstarter",
				category: "technology",
				keyword: "test-direct-mapping",
				results: JSON.stringify([sampleItem]),
				status: "completed",
				resultCount: 1,
				enabledOCR: false,
				language: "en",
			},
		});

		console.log("📊 Created test search:", testSearch.id);

		// Try creating scraped data directly
		const scrapedData = await prisma.scrapedData.create({
			data: {
				searchId: testSearch.id,
				userId: testUser.id,
				title: sampleItem.title,
				description: sampleItem.description || "Test description",
				platform: sampleItem.platform,
				category: "technology",
				keyword: "test-direct-mapping",
				url: sampleItem.url,
				imageUrl: sampleItem.image,
				raised: raisedAmount,
				goal: goalAmount,
				backers: backersCount,
				daysLeft: sampleItem.days_left ? String(sampleItem.days_left) : null,
				startDate: sampleItem.crowdfund_start_date,
				endDate: sampleItem.crowdfund_end_date,
				originalData: JSON.stringify(sampleItem),
				ocrData: null,
				nlpData: null,
				isRelevant: true,
			},
		});

		console.log("✅ Created scraped data record with ID:", scrapedData.id);
		console.log("📊 Stored data:");
		console.log("- raised:", scrapedData.raised);
		console.log("- goal:", scrapedData.goal);
		console.log("- backers:", scrapedData.backers);
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

testDirectMapping();
