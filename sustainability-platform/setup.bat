@echo off
setlocal
cd /d "%~dp0"
if not defined LOCALAPPDATA (
  echo Windows LOCALAPPDATA was not found. Please run from a normal Windows user account.
  pause
  exit /b 1
)
set "ESG_PYTHON_ENV=%LOCALAPPDATA%\CYCU-ESG\venv"
python -c "import sys; raise SystemExit(0 if sys.version_info >= (3,12) else 1)"
if errorlevel 1 (
  echo Python 3.12 or newer is required. Install Python and enable Add Python to PATH.
  pause
  exit /b 1
)
if not exist "%ESG_PYTHON_ENV%\Scripts\python.exe" (
  python -m venv "%ESG_PYTHON_ENV%"
  if errorlevel 1 goto fail
)
"%ESG_PYTHON_ENV%\Scripts\python.exe" -m pip install -r requirements.lock
if errorlevel 1 goto fail
"%ESG_PYTHON_ENV%\Scripts\python.exe" -m pip check
if errorlevel 1 goto fail
if not exist ".env" copy /Y ".env.example" ".env" >nul
if not exist "frontend\local-dist\index.html" (
  echo The built website is missing. Download the complete project package.
  pause
  exit /b 1
)
echo.
echo Setup complete. Your existing .env was preserved.
echo Edit .env to add your OpenAI API key, then run start.bat.
echo Python packages are stored in: %ESG_PYTHON_ENV%
pause
exit /b 0
:fail
echo.
echo Setup failed. Keep this window open and share a screenshot of the error above.
pause
exit /b 1
