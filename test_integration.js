const { prisma } = require("./lib/db");

async function testDatabaseIntegration() {
	try {
		console.log("🔍 Testing database integration...");

		// Check if we have any users
		const users = await prisma.user.findMany({
			take: 1,
		});

		let testUserId;
		if (users.length > 0) {
			testUserId = users[0].id;
			console.log(`✅ Found existing user: ${testUserId}`);
		} else {
			// Create a test user
			const testUser = await prisma.user.create({
				data: {
					email: "test@example.com",
					name: "Test User",
					signupMethod: "manual",
				},
			});
			testUserId = testUser.id;
			console.log(`✅ Created test user: ${testUserId}`);
		}

		// Test the search endpoint with user ID
		const response = await fetch("http://localhost:3001/api/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				platform: "kickstarter",
				category: "technology",
				keyword: "gaming",
				language: "en",
				enableOCR: false, // Disable OCR for faster testing
				userId: testUserId,
			}),
		});

		const result = await response.json();
		console.log("🎉 Search response:", JSON.stringify(result, null, 2));

		if (result.success && result.searchId) {
			// Check if data was saved to database
			const savedSearch = await prisma.search.findUnique({
				where: { id: result.searchId },
				include: {
					scrapedData: true,
				},
			});

			console.log(`✅ Search saved to database: ${savedSearch ? "YES" : "NO"}`);
			if (savedSearch) {
				console.log(`✅ Scraped data items: ${savedSearch.scrapedData.length}`);
			}
		}
	} catch (error) {
		console.error("❌ Test failed:", error);
	} finally {
		await prisma.$disconnect();
	}
}

testDatabaseIntegration();
