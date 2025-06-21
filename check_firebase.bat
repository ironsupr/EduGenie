@echo off
echo.
echo ==========================================
echo   Firebase Configuration Checker
echo   EduGenie Platform
echo ==========================================
echo.

REM Check if Python virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo ERROR: Python virtual environment not found!
    echo Please set up Python environment first.
    echo.
    pause
    exit /b 1
)

REM Check if requests package is installed
".venv\Scripts\python.exe" -c "import requests" 2>nul
if errorlevel 1 (
    echo Installing required packages...
    ".venv\Scripts\python.exe" -m pip install requests
    echo.
)

echo Choose Firebase check type:
echo.
echo 1. Quick Check (fast overview)
echo 2. Detailed Check (comprehensive analysis)
echo 3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Running Quick Firebase Check...
    echo.
    ".venv\Scripts\python.exe" quick_firebase_check.py
) else if "%choice%"=="2" (
    echo.
    echo Running Detailed Firebase Check...
    echo.
    ".venv\Scripts\python.exe" enhanced_firebase_checker.py
) else if "%choice%"=="3" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please try again.
    goto :start
)

echo.
echo ==========================================
echo Check completed. 
if errorlevel 1 (
    echo Status: Issues found - see output above
) else (
    echo Status: All good!
)
echo ==========================================
echo.
pause
