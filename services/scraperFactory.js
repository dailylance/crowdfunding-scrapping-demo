const IndiegogoScraper = require("./indiegogoScraper");
const KickstarterScraper = require("./kickstarterScraper");
const WadizScraper = require("./wadizScraper");
const CampfireScraper = require("./campfireScraper");
const MakuakeScraper = require("./makuakeScraper");
const FlyingVScraper = require("./flyingvScraper");

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
			case "makuake":
				return new MakuakeScraper();
			case "flyingv":
				return new FlyingVScraper();
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
			{
				name: "makuake",
				displayName: "Makuake (マクアケ)",
				description:
					"Japanese crowdfunding platform for new products and ideas",
			},
			{
				name: "flyingv",
				displayName: "FlyingV (嘖嘖)",
				description: "Taiwanese crowdfunding platform for creative projects",
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
