#!/bin/bash

# Stop Crowdfunding Automation Pipeline Services

echo "🛑 Stopping Crowdfunding Automation Pipeline..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop OCR Service
if [ -f "ocr_service.pid" ]; then
    OCR_PID=$(cat ocr_service.pid)
    print_status "Stopping OCR Service (PID: $OCR_PID)..."
    if kill $OCR_PID 2>/dev/null; then
        print_success "OCR Service stopped"
    else
        print_error "Failed to stop OCR Service or already stopped"
    fi
    rm -f ocr_service.pid
else
    print_status "OCR Service PID file not found"
fi

# Stop Scraper Service
if [ -f "scraper_service.pid" ]; then
    SCRAPER_PID=$(cat scraper_service.pid)
    print_status "Stopping Scraper Service (PID: $SCRAPER_PID)..."
    if kill $SCRAPER_PID 2>/dev/null; then
        print_success "Scraper Service stopped"
    else
        print_error "Failed to stop Scraper Service or already stopped"
    fi
    rm -f scraper_service.pid
else
    print_status "Scraper Service PID file not found"
fi

# Kill any remaining processes on the ports
print_status "Checking for remaining processes on ports 5000 and 3001..."

# Kill processes on port 5000 (OCR service)
lsof -ti:5000 | xargs kill -9 2>/dev/null && print_success "Killed remaining processes on port 5000"

# Kill processes on port 3001 (Scraper service)  
lsof -ti:3001 | xargs kill -9 2>/dev/null && print_success "Killed remaining processes on port 3001"

print_success "🎉 All services stopped successfully!"
