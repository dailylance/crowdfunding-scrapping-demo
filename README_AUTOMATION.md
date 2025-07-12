# 🚀 Crowdfunding Automation Pipeline

A complete automation system that combines web scraping with OCR and NLP to extract comprehensive crowdfunding data from multiple platforms.

## 🎯 Overview

This automation pipeline integrates two main components:

1. **Crowdfunding Scraper** - Extracts basic data from crowdfunding websites
2. **OCR/NLP Module** - Enhances scraped data by extracting missing information from project images

## 🌐 Supported Platforms

- **Kickstarter** (https://www.kickstarter.com/)
- **Indiegogo** (https://www.indiegogo.com/)
- **Wadiz** (https://www.wadiz.kr/) - Korea
- **Zeczec** (http://zeczec.com/) - Taiwan
- **FlyingV** (https://www.flyingv.cc/) - Taiwan
- **Makuake** (https://www.makuake.com/) - Japan
- **GREEN FUNDING** (https://greenfunding.jp/) - Japan
- **CAMPFIRE** (https://camp-fire.jp/) - Japan
- **Machi-ya** (https://camp-fire.jp/machi-ya) - Japan

## 🔧 Setup Instructions

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git**

### Quick Start (Windows)

1. **Clone and Setup**

   ```bash
   cd crowdfunding-testing
   ```

2. **Start the Pipeline**

   ```bash
   # Double-click the batch file or run:
   start_pipeline.bat
   ```

3. **Access the Web Interface**
   - Open your browser to `http://localhost:3001`
   - The pipeline will automatically open this for you

### Manual Setup

#### 1. Start OCR Service

```bash
cd crowdfunding-ocr
pip install -r requirements.txt
python -m uvicorn ocr_service.app.main:app --host 0.0.0.0 --port 5000
```

#### 2. Start Scraper Service

```bash
cd crowdfunding-testing
npm install
npm start
```

## 🤖 How the Automation Works

### 1. **Data Collection Phase**

- User searches for campaigns by platform, category, and keyword
- Scraper extracts basic information from search results
- Data includes: title, URL, basic funding info, images

### 2. **OCR Enhancement Phase** (Automatic)

- System analyzes each project for missing data fields
- If gaps are found, OCR processes project images
- Extracts: contact info, detailed funding data, creator information
- NLP structures the extracted text into organized data

### 3. **Data Output Phase**

- Enhanced data is saved in JSON format
- Results include confidence scores and processing metadata
- Original and enhanced data are clearly marked

## 📊 Data Fields Extracted

| Field                  | Description        | Source        |
| ---------------------- | ------------------ | ------------- |
| `target_site`          | Platform name      | Scraper       |
| `status`               | Project status     | Scraper       |
| `url`                  | Project URL        | Scraper       |
| `title`                | Project title      | Scraper       |
| `amount`               | Raised amount      | Scraper + OCR |
| `support_amount`       | Goal amount        | Scraper + OCR |
| `supporters`           | Number of backers  | Scraper + OCR |
| `achievement_rate`     | Funding percentage | Scraper + OCR |
| `project_owner`        | Creator name       | OCR           |
| `contact_info`         | Email/contact      | OCR           |
| `owner_website`        | Creator website    | OCR           |
| `owner_sns`            | Social media       | OCR           |
| `crowdfund_start_date` | Start date         | OCR           |
| `crowdfund_end_date`   | End date           | OCR           |

## 🎛️ API Endpoints

### Search with OCR Enhancement

```http
POST /api/search
Content-Type: application/json

{
  "platform": "indiegogo",
  "category": "technology",
  "keyword": "smartwatch",
  "enableOCR": true
}
```

### Check OCR Service Status

```http
GET /api/ocr-status
```

### Enhance Existing Results

```http
POST /api/enhance-existing
Content-Type: application/json

{
  "filePath": "results/indiegogo_technology_smartwatch_results.json"
}
```

### Get Available Platforms

```http
GET /api/platforms
```

## 🔍 Usage Examples

### Example 1: Technology Products on Indiegogo

```javascript
// Search for smartwatches with OCR enhancement
const results = await fetch("/api/search", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		platform: "indiegogo",
		category: "technology",
		keyword: "smartwatch",
		enableOCR: true,
	}),
});
```

### Example 2: All Categories on Kickstarter

```javascript
// Search without category filter
const results = await fetch("/api/search", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		platform: "kickstarter",
		keyword: "gaming",
		enableOCR: true,
	}),
});
```

## 📁 Output Format

```json
{
	"success": true,
	"platform": "indiegogo",
	"category": "technology",
	"keyword": "smartwatch",
	"count": 15,
	"enhanced_count": 12,
	"enhancement_rate": "80%",
	"file": "indiegogo_technology_smartwatch_enhanced_1234567890.json",
	"generated_at": "2025-07-11T10:30:00.000Z",
	"processing_summary": {
		"total_projects": 15,
		"ocr_enhanced": 12,
		"ocr_errors": 2,
		"complete_without_ocr": 1
	},
	"results": [
		{
			"title": "SmartWatch Pro 2025",
			"url": "https://www.indiegogo.com/projects/smartwatch-pro-2025",
			"target_site": "indiegogo",
			"status": "active",
			"amount": "$45,678",
			"supporters": "234",
			"achievement_rate": "152%",
			"project_owner": "TechCorp Inc.",
			"contact_info": "contact@techcorp.com",
			"ocr_enhanced": true,
			"confidence_scores": {
				"project_owner": 0.8,
				"contact_info": 0.9,
				"achievement_rate": 0.85
			},
			"images_processed": 3,
			"enhancement_timestamp": "2025-07-11T10:35:00.000Z"
		}
	]
}
```

## 🛠️ Configuration

### OCR Service Configuration

```javascript
// config/config.js
module.exports = {
	ocr: {
		serviceUrl: "http://localhost:5000",
		timeout: 120000,
		maxImagesPerProject: 5,
		imageMinWidth: 200,
		imageMinHeight: 150,
	},
};
```

### Scraper Configuration

```javascript
scraper: {
  timeout: 120000,
  batchSize: 5,
  maxRetries: 3,
  delayBetweenRequests: 2000
}
```

## 🧪 Testing

### Run Automated Tests

```bash
node test_automation.js
```

### Test Individual Components

```bash
# Test OCR service
curl http://localhost:5000/v1/health

# Test scraper service
curl http://localhost:3001/api/platforms

# Test OCR integration
curl http://localhost:3001/api/ocr-status
```

## 🚨 Troubleshooting

### OCR Service Not Starting

1. Check Python installation: `python --version`
2. Install dependencies: `pip install -r requirements.txt`
3. Check port 5000: `netstat -an | grep 5000`

### Scraper Service Issues

1. Check Node.js: `node --version`
2. Install dependencies: `npm install`
3. Check port 3001: `netstat -an | grep 3001`

### OCR Enhancement Failing

1. Verify OCR service status: `GET /api/ocr-status`
2. Check image quality and size
3. Ensure images contain readable text
4. Check network connectivity between services

### Low Enhancement Rate

- **Image Quality**: Ensure images are high resolution and clear
- **Text Visibility**: Check if funding amounts and details are visible in images
- **Language Support**: OCR works best with English, Japanese, Korean, Chinese
- **Image Selection**: System prioritizes content images over thumbnails

## 📈 Performance Tips

1. **Batch Processing**: Process multiple campaigns in batches
2. **Image Optimization**: System automatically filters for meaningful images
3. **Caching**: Results are cached to avoid reprocessing
4. **Parallel Processing**: OCR and scraping can run concurrently
5. **Resource Management**: Built-in delays prevent overwhelming target sites

## 🔒 Rate Limiting & Ethics

- Built-in delays between requests (2 seconds default)
- Respects robots.txt and website policies
- Uses stealth mode to avoid detection
- Implements retry logic for failed requests
- Includes user-agent rotation

## 📊 Monitoring & Logs

- Real-time status monitoring in web interface
- Detailed logging of OCR enhancement process
- Performance metrics and enhancement rates
- Error tracking and retry attempts
- Processing time analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test your changes with `node test_automation.js`
4. Submit a pull request

## 📄 License

This project is for educational and research purposes. Please respect the terms of service of the crowdfunding platforms you scrape.
