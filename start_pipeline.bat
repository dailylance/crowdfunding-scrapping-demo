@echo off
echo 🚀 Starting Crowdfunding Automation Pipeline...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo 📊 Starting OCR Service...
cd crowdfunding-ocr

REM Install Python dependencies
if exist requirements.txt (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

REM Start OCR service
echo Starting OCR service on port 5000...
start "OCR Service" cmd /k "python -m uvicorn ocr_service.app.main:app --host 0.0.0.0 --port 5000"

REM Wait for OCR service to start
timeout /t 8 /nobreak >nul

echo 🔍 Starting Scraper Service...
cd ..\crowdfunding-testing

REM Install Node.js dependencies
if exist package.json (
    echo Installing Node.js dependencies...
    call npm install
)

REM Start scraper service
echo Starting Scraper service on port 3001...
start "Scraper Service" cmd /k "npm start"

REM Wait for scraper service to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Automation Pipeline Started Successfully!
echo.
echo Services Information:
echo   📊 OCR Service: http://localhost:5000
echo   🔍 Scraper Service: http://localhost:3001
echo   🌐 Web Interface: http://localhost:3001
echo.
echo ⚠️ Keep both terminal windows open to maintain the services
echo.
echo API Endpoints:
echo   GET  /api/platforms - List available platforms
echo   POST /api/search - Search with OCR enhancement
echo   POST /api/enhance-existing - Enhance existing results
echo   GET  /api/ocr-status - Check OCR service status
echo.

REM Open browser to the web interface
timeout /t 3 /nobreak >nul
start http://localhost:3001

pause
