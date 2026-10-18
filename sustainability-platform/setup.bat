@echo off
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv
  if errorlevel 1 goto fail
)
".venv\Scripts\python.exe" -m pip install -r requirements.lock
if errorlevel 1 goto fail
if not exist ".env" copy /Y ".env.example" ".env" >nul
echo Setup complete. Edit .env to add your OpenAI API key, then run start.bat.
pause
exit /b 0
:fail
echo Setup failed. Check Python 3.12 or newer is installed and available as python.
pause
exit /b 1
