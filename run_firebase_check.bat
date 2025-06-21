@echo off
echo 🔥 Firebase Configuration Checker for EduGenie Platform
echo =====================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo ✅ Python is installed
echo.

REM Install required packages
echo 📦 Installing required packages...
pip install -r requirements-comprehensive-firebase.txt
if errorlevel 1 (
    echo ⚠️ Failed to install some packages, trying without requirements file...
    pip install firebase-admin google-cloud-firestore requests python-dotenv
)

echo.
echo 🚀 Running Firebase Configuration Check...
echo.

REM Run the checker
python comprehensive_firebase_checker.py

echo.
echo 📋 Check completed. Press any key to exit...
pause >nul
