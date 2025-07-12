#!/bin/bash

# Crowdfunding Automation Pipeline Startup Script

echo "🚀 Starting Crowdfunding Automation Pipeline..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
if ! command -v python &> /dev/null; then
    if ! command -v python3 &> /dev/null; then
        print_error "Python is not installed. Please install Python first."
        exit 1
    else
        PYTHON_CMD="python3"
    fi
else
    PYTHON_CMD="python"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Start OCR Service
print_status "Starting OCR Service..."
cd crowdfunding-ocr
if [ -f "requirements.txt" ]; then
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start OCR service in background
print_status "Starting OCR service on port 5000..."
$PYTHON_CMD -m uvicorn ocr_service.app.main:app --host 0.0.0.0 --port 5000 &
OCR_PID=$!
echo $OCR_PID > ../ocr_service.pid

# Wait for OCR service to start
sleep 5

# Check if OCR service is running
if curl -f http://localhost:5000/v1/health > /dev/null 2>&1; then
    print_success "OCR Service is running (PID: $OCR_PID)"
else
    print_warning "OCR Service may not be fully ready yet, but continuing..."
fi

# Start Scraper Service
print_status "Starting Scraper Service..."
cd ../crowdfunding-testing

if [ -f "package.json" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
fi

# Start scraper service
print_status "Starting Scraper service on port 3001..."
npm start &
SCRAPER_PID=$!
echo $SCRAPER_PID > scraper_service.pid

# Wait for scraper service to start
sleep 3

# Check if scraper service is running
if curl -f http://localhost:3001/api/platforms > /dev/null 2>&1; then
    print_success "Scraper Service is running (PID: $SCRAPER_PID)"
else
    print_warning "Scraper Service may not be fully ready yet, but continuing..."
fi

print_success "🎉 Automation Pipeline Started Successfully!"
echo ""
print_status "Services Information:"
echo "  📊 OCR Service: http://localhost:5000 (PID: $OCR_PID)"
echo "  🔍 Scraper Service: http://localhost:3001 (PID: $SCRAPER_PID)"
echo "  🌐 Web Interface: http://localhost:3001"
echo ""
print_status "To stop the services, run:"
echo "  kill $OCR_PID $SCRAPER_PID"
echo "  or use ./stop_services.sh"
echo ""
print_status "Logs location:"
echo "  OCR logs: Check terminal output"
echo "  Scraper logs: Check terminal output"
echo ""
print_status "API Endpoints:"
echo "  GET  /api/platforms - List available platforms"
echo "  POST /api/search - Search with OCR enhancement"
echo "  POST /api/enhance-existing - Enhance existing results"
echo "  GET  /api/ocr-status - Check OCR service status"
