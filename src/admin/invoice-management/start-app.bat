@echo off
echo Starting Invoice Management Application...
cd /d "%~dp0invoice-management"
if not exist package.json (
  echo Error: package.json not found in the invoice-management directory.
  echo Make sure you are in the correct directory and the file exists.
  pause
  exit /b 1
)
echo Running npm start in %CD%
npm start 