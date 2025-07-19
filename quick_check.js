const { prisma } = require("./lib/db");

async function quickCheck() {
	try {
		console.log("🔍 Checking latest scraped data...");

		// Get the latest scraped data record
		const latest = await prisma.scrapedData.findFirst({
			orderBy: { createdAt: "desc" },
			select: {
				title: true,
				raised: true,
				goal: true,
				backers: true,
				platform: true,
				createdAt: true,
			},
		});

		if (latest) {
			console.log("✅ Latest Record:");
			console.log(`- Title: ${latest.title}`);
			console.log(`- Raised: ${latest.raised}`);
			console.log(`- Goal: ${latest.goal}`);
			console.log(`- Backers: ${latest.backers}`);
			console.log(`- Platform: ${latest.platform}`);
			console.log(`- Created: ${latest.createdAt}`);
		} else {
			console.log("❌ No records found");
		}
	} catch (error) {
		console.error("❌ Error:", error.message);
	} finally {
		await prisma.$disconnect();
	}
}

quickCheck();
