const { prisma } = require("./lib/db");

async function checkRawData() {
	try {
		console.log("🔍 Checking raw data in database...");

		// Get the latest scraped data with original data
		const scrapedData = await prisma.scrapedData.findFirst({
			orderBy: { createdAt: "desc" },
		});

		if (scrapedData) {
			console.log(`\n📦 Latest Record: ${scrapedData.title}`);
			console.log(`Database fields:`);
			console.log(`- raised: ${scrapedData.raised}`);
			console.log(`- goal: ${scrapedData.goal}`);
			console.log(`- backers: ${scrapedData.backers}`);

			console.log(`\n📄 Original data (first 500 chars):`);
			const originalData = JSON.parse(scrapedData.originalData);
			console.log(
				JSON.stringify(originalData, null, 2).substring(0, 500) + "..."
			);

			console.log(`\n🔍 Available fields in original data:`);
			console.log("- funded_amount:", originalData.funded_amount);
			console.log("- goal_amount:", originalData.goal_amount);
			console.log("- backers_count:", originalData.backers_count);
			console.log("- amount:", originalData.amount);
			console.log("- support_amount:", originalData.support_amount);
			console.log("- supporters:", originalData.supporters);
		}
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkRawData();
