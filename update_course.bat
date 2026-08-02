@echo off
echo Moving old assets to old folder...
if not exist "docs\assets\old" mkdir "docs\assets\old"
move /Y docs\assets\*.js docs\assets\old\ >nul 2>&1
move /Y docs\assets\*.css docs\assets\old\ >nul 2>&1

echo Building the frontend course application...
cd web_src
npm run build
cd ..
echo.
echo Build complete! The frontend has been updated in the 'docs' folder and will use the latest data.json.
