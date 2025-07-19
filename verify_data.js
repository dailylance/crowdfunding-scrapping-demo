const { prisma } = require("./lib/db");

async function verifyDatabaseData() {
	try {
		console.log("🔍 Verifying database data...");

		// Check recent searches
		const recentSearches = await prisma.search.findMany({
			orderBy: { createdAt: "desc" },
			take: 3,
			include: {
				user: {
					select: { email: true, name: true },
				},
				_count: {
					select: { scrapedData: true },
				},
			},
		});

		console.log("\n📊 Recent Searches:");
		recentSearches.forEach((search) => {
			console.log(
				`- ${search.platform}/${search.category} "${search.keyword}"`
			);
			console.log(`  User: ${search.user.email} (${search.user.name})`);
			console.log(`  Results: ${search._count.scrapedData} items`);
			console.log(`  Created: ${search.createdAt}`);
			console.log("");
		});

		// Check scraped data for latest search
		if (recentSearches.length > 0) {
			const latestSearchId = recentSearches[0].id;
			const scrapedData = await prisma.scrapedData.findMany({
				where: { searchId: latestSearchId },
				take: 3,
				select: {
					title: true,
					platform: true,
					raised: true,
					goal: true,
					backers: true,
					url: true,
				},
			});

			console.log(`📦 Sample Scraped Data from latest search:`);
			scrapedData.forEach((item, index) => {
				console.log(`${index + 1}. ${item.title}`);
				console.log(`   Platform: ${item.platform}`);
				console.log(`   Funding: ${item.raised} / ${item.goal}`);
				console.log(`   Backers: ${item.backers}`);
				console.log(`   URL: ${item.url}`);
				console.log("");
			});
		}

		// Get user stats
		if (recentSearches.length > 0) {
			const userId = recentSearches[0].userId;
			const stats = await Promise.all([
				prisma.search.count({ where: { userId } }),
				prisma.scrapedData.count({ where: { userId } }),
				prisma.savedData.count({ where: { userId } }),
			]);

			console.log(`📈 User Stats for ${recentSearches[0].user.email}:`);
			console.log(`- Total Searches: ${stats[0]}`);
			console.log(`- Total Scraped Items: ${stats[1]}`);
			console.log(`- Total Saved Items: ${stats[2]}`);
		}
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

verifyDatabaseData();
