@echo off
echo Building the frontend course application...
cd web_src
npm run build
echo.
echo Build complete! The frontend has been updated in the 'docs' folder and will use the latest data.json.
pause
