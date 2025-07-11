const IndiegogoScraper = require("./indiegogoScraper");
const KickstarterScraper = require("./kickstarterScraper");
const WadizScraper = require("./wadizScraper");
const CampfireScraper = require("./campfireScraper");
const MachiyaScraper = require("./machiyaScraper");
const MakuakeScraper = require("./makuakeScraper");
const FlyingVScraper = require("./flyingvScraper");
const GreenFundingScraper = require("./greenfundingScraper");
const ZecZecScraper = require("./zeczecScraper");

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
			case "machiya":
				return new MachiyaScraper();
			case "makuake":
				return new MakuakeScraper();
			case "flyingv":
				return new FlyingVScraper();
			case "greenfunding":
				return new GreenFundingScraper();
			case "zeczec":
				return new ZecZecScraper();
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
				name: "machiya",
				displayName: "CAMPFIRE Machi-ya (キャンプファイヤー町や)",
				description:
					"Japanese crowdfunding platform for lifestyle and consumer products",
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
			{
				name: "greenfunding",
				displayName: "GreenFunding (グリーンファンディング)",
				description:
					"Japanese crowdfunding platform for innovative technology and lifestyle products",
			},
			{
				name: "zeczec",
				displayName: "ZecZec (嘖嘖)",
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
