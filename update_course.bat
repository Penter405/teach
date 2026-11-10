@echo off
echo ============================================
echo   Building Frontend Course Application
echo ============================================
echo.

echo Moving old assets to old folder...
if not exist "docs\assets\old" mkdir "docs\assets\old"
move /Y docs\assets\*.js docs\assets\old\ >nul 2>&1
move /Y docs\assets\*.css docs\assets\old\ >nul 2>&1

echo Building frontend with Vite...
cd web_src
npm run build
cd ..
echo.
echo ============================================
echo   Build complete!
echo   Frontend bundles updated in docs/assets/
echo   Content is loaded from docs/content/
echo ============================================
echo.
echo You can now: git add . && git commit && git push
