# Crowdfunding Campaign Scraper (MVC Architecture)

A scalable web scraper for crowdfunding platforms built with Node.js, Express, and Puppeteer using MVC pattern.

## 🏗️ Architecture

```
├── controllers/           # Business logic controllers
│   └── searchController.js
├── services/             # Scraper services for different platforms
│   ├── baseScraper.js    # Base scraper class
│   ├── indiegogoScraper.js
│   ├── kickstarterScraper.js
│   ├── makuakeScraper.js
│   ├── wadizScraper.js
│   ├── campfireScraper.js
│   ├── flyingvScraper.js
│   └── scraperFactory.js
├── routes/               # API routes
│   └── api.js
├── models/               # Data models (for future use)
├── views/                # View templates (for future use)
├── public/               # Static files (HTML, CSS, JS)
│   └── index.html
├── results/              # Generated JSON results
├── server.js             # Main server file
└── index.js              # Original monolithic version (backup)
```

## ✨ Features

- **MVC Architecture**: Clean separation of concerns
- **Multiple Platform Support**: Easy to add new crowdfunding platforms
- **Web Interface**: User-friendly frontend for testing
- **RESTful API**: Clean API endpoints
- **Category-based Search**: Search within specific categories
- **Relevance Filtering**: Smart filtering to exclude irrelevant results
- **Complete Data**: All requested fields included in results

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
# or
npm run dev
```

### 3. Access the Application

- **Web Interface**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Available Platforms**: http://localhost:3001/api/platforms

## 🌐 API Endpoints

### Get Available Platforms

```bash
GET /api/platforms
```

### Get Categories for a Platform

```bash
GET /api/platforms/:platform/categories
```

### Search Campaigns

```bash
POST /api/search
Content-Type: application/json

{
  "platform": "indiegogo",
  "category": "transportation",
  "keyword": "ebike"
}
```

### Test Direct URL (Coming Soon)

```bash
POST /api/test-direct
Content-Type: application/json

{
  "platform": "indiegogo",
  "url": "https://www.indiegogo.com/projects/example"
}
```

## 🧪 Testing Methods

### 1. Web Interface (Recommended)

1. Open http://localhost:3001 in your browser
2. Select a platform (e.g., "Indiegogo")
3. Choose a category (optional, e.g., "Transportation")
4. Enter a keyword (e.g., "ebike")
5. Click "Search Campaigns"

### 2. cURL Commands

```bash
# Get available platforms
curl -X GET http://localhost:3001/api/platforms

# Search for ebikes on Indiegogo
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"platform":"indiegogo","category":"transportation","keyword":"ebike"}'

# Search for audio products
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"platform":"indiegogo","category":"audio","keyword":"audio"}'

# Search for cameras
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"platform":"indiegogo","category":"camera-gear","keyword":"camera"}'
```

### 3. Postman/Thunder Client

Import the following requests:

- GET `http://localhost:3001/api/platforms`
- POST `http://localhost:3001/api/search` with JSON body

## 📊 Response Format

```json
{
	"success": true,
	"platform": "indiegogo",
	"category": "transportation",
	"keyword": "ebike",
	"count": 14,
	"file": "results/indiegogo_transportation_ebike_results.json",
	"results": [
		{
			"target_site": "Indiegogo",
			"market": "Indiegogo",
			"status": "Live",
			"url": "https://www.indiegogo.com/projects/example",
			"title": "Example E-Bike Campaign",
			"project_owner": "Example Company",
			"achievement_rate": "150%",
			"supporters": "250",
			"amount": "$75,000",
			"support_amount": "$50,000",
			"crowdfund_start_date": "1/1/2025",
			"crowdfund_end_date": "2/1/2025",
			"current_or_completed_project": "Current"
		}
	]
}
```

## 🎯 Supported Platforms

### ✅ Indiegogo (Fully Implemented)

- **Categories**: 25+ categories across Tech & Innovation, Creative Works, and Community Projects
- **Features**: Complete scraping with all requested fields, timeout handling improved
- **Filtering**: Smart relevance filtering to exclude mismatched products
- **Status**: Production ready with 30-second timeout handling

### ✅ Makuake (Fully Implemented)

- **Categories**: 20+ categories including technology, fashion, food, and more
- **Features**: Complete scraping with Japanese/English translation
- **Filtering**: Category-based filtering and enhanced creator extraction
- **Status**: Production ready with accurate creator extraction

### ✅ FlyingV (Fully Implemented)

- **Categories**: 6 official categories:
  - Technology Design (科技設計)
  - Music (音樂)
  - Art Films (藝術影視)
  - Life (生活)
  - Public Place (公共在地)
  - Game Publishing (遊戲出版)
- **Features**: Complete scraping with Traditional Chinese/English translation
- **Data Format**: Normalized format matching Indiegogo standard
- **Filtering**: Category-based filtering for Taiwanese crowdfunding projects
- **Status**: Production ready with enhanced project owner extraction and normalized output

### 🚧 Kickstarter (Template Ready)

- **Status**: Template ready, implementation in progress
- **Categories**: 16 main categories
- **Timeline**: Available for implementation

### 🚧 Wadiz (Template Ready)

- **Status**: Template ready, implementation in progress
- **Categories**: Korean crowdfunding platform
- **Timeline**: Available for implementation

### 🚧 CAMPFIRE (Template Ready)

- **Status**: Template ready, implementation in progress
- **Categories**: Japanese crowdfunding platform
- **Timeline**: Available for implementation

## 🔧 Adding New Platforms

1. **Create Scraper Service**:

   ```javascript
   // services/newPlatformScraper.js
   const BaseScraper = require('./baseScraper');

   class NewPlatformScraper extends BaseScraper {
     getName() { return "NewPlatform"; }
     getCategories() { return {...}; }
     async scrape(category, keyword) { ... }
   }
   ```

2. **Register in Factory**:

   ```javascript
   // services/scraperFactory.js
   case 'newplatform':
     return new NewPlatformScraper();
   ```

3. **Test**: Platform automatically appears in web interface

## 🐛 Troubleshooting

### Common Issues:

1. **"Apex 300" in wrong categories**: Fixed with smart filtering
2. **Limited results**: Now scrapes ALL relevant campaigns
3. **Missing fields**: All requested fields now included
4. **Port conflicts**: Change PORT in server.js

### Debug Mode:

```bash
DEBUG=* npm start
```

## 📈 Next Steps

1. **Add More Platforms**: Kickstarter, GoFundMe, etc.
2. **Database Integration**: Store results in database
3. **User Authentication**: Multi-user support
4. **Scheduled Scraping**: Automated periodic scraping
5. **Data Analytics**: Trend analysis and insights
6. **Export Options**: CSV, Excel export
7. **Real-time Updates**: WebSocket for live updates

## 🤝 Contributing

1. Fork the repository
2. Create a new scraper service in `services/`
3. Register it in `scraperFactory.js`
4. Test using the web interface
5. Submit a pull request

## 📝 License

MIT License - feel free to use for personal and commercial projects.
