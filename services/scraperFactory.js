const IndiegogoScraper = require("./indiegogoScraper");
const KickstarterScraper = require("./kickstarterScraper");
const WadizScraper = require("./wadizScraper");
const CampfireScraper = require("./campfireScraper");

class ScraperFactory {
	static getScraper(platform) {
		switch (platform.toLowerCase()) {
			case "indiegogo":
				return new IndiegogoScraper();
			case "kickstarter":
				return new KickstarterScraper();
			case "wadiz":
				return new WadizScraper();
			case "campfire":
				return new CampfireScraper();
			// Add more platforms here
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}
	}

	static getAvailablePlatforms() {
		return [
			{
				name: "indiegogo",
				displayName: "Indiegogo",
				description: "Creative and innovative projects worldwide",
			},
			{
				name: "kickstarter",
				displayName: "Kickstarter",
				description: "Creative projects seeking funding",
			},
			{
				name: "wadiz",
				displayName: "Wadiz (와디즈)",
				description: "Korean crowdfunding platform for innovative projects",
			},
			{
				name: "campfire",
				displayName: "CAMPFIRE (キャンプファイヤー)",
				description: "Japanese crowdfunding platform for creative projects",
			},
		];
	}

	static getPlatformCategories(platform) {
		try {
			const scraper = this.getScraper(platform);
			return scraper.getCategories();
		} catch (error) {
			return {};
		}
	}
}

module.exports = ScraperFactory;
