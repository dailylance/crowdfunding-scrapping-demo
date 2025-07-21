const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/search';
const TEST_USER_ID = '1'; // <-- Replace with a real userId from your DB

const platformTests = [
//   { platform: "indiegogo", category: "technology", keyword: "gadget" },
//   { platform: "kickstarter", category: "technology", keyword: "robot" },
//   { platform: "wadiz", category: "tech", keyword: "smart" },
  { platform: "campfire", category: "technology", keyword: "AI" },
//   { platform: "machiya", category: "product", keyword: "kitchen" },
//   { platform: "makuake", category: "product", keyword: "travel" },
//   { platform: "flyingv", category: "product", keyword: "design" },
//   { platform: "greenfunding", category: "gadgets", keyword: "audio" },
//   { platform: "zeczec", category: "music", keyword: "band" }
];

async function testScraper({ platform, category, keyword }) {
  try {
    const response = await axios.post(BASE_URL, {
      platform,
      category,
      keyword,
      userId: TEST_USER_ID,
      enableOCR: false,
      language: "en"
    });
    console.log(`✅ [${platform}] Success: ${response.data.count} results`);
  } catch (err) {
    if (err.response) {
      console.error(`❌ [${platform}] Error:`, err.response.data);
    } else {
      console.error(`❌ [${platform}] Network/Error:`, err.message);
    }
  }
}

async function runAllTests() {
  for (const test of platformTests) {
    await testScraper(test);
  }
}

runAllTests();
