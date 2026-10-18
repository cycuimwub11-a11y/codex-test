@echo off
setlocal
cd /d "%~dp0"
set "ESG_PYTHON_ENV=%LOCALAPPDATA%\CYCU-ESG\venv"
if not exist "%ESG_PYTHON_ENV%\Scripts\python.exe" (
  echo Run setup.bat first.
  pause
  exit /b 1
)
if not exist ".env" copy /Y ".env.example" ".env" >nul
if not exist "frontend\local-dist\index.html" (
  echo The built website is missing. Download the complete project package.
  pause
  exit /b 1
)
echo Open http://127.0.0.1:8000 in your browser after the server starts.
echo Keep this window open while using the website. Press Ctrl+C to stop.
"%ESG_PYTHON_ENV%\Scripts\python.exe" -m uvicorn app:app --host 127.0.0.1 --port 8000
if errorlevel 1 echo Server startup failed. Share a screenshot of the error above.
pause
