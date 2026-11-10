@echo off
echo ============================================
echo   Full Course Update (content + compile)
echo ============================================
echo.

echo Step 1: Copying content to docs/...
call update_content.bat
echo.

echo Step 2: Moving old assets to old folder...
if not exist "docs\assets\old" mkdir "docs\assets\old"
move /Y docs\assets\*.js docs\assets\old\ >nul 2>&1
move /Y docs\assets\*.css docs\assets\old\ >nul 2>&1

echo Step 3: Building the frontend application...
cd web_src
npm run build
cd ..
echo.
echo ✅ Full build complete!
echo    The frontend has been updated in the 'docs' folder.
echo    Data is loaded at runtime from docs/data.json.
echo.
echo You can now: git add . && git commit && git push
