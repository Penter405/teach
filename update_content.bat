@echo off
echo ============================================
echo   Content-Only Update (NO compile needed)
echo ============================================
echo.

echo Copying content/data.json to docs/...
copy /Y content\data.json docs\data.json >nul

echo Copying content/image/ to docs/image/...
if not exist "docs\image" mkdir "docs\image"
xcopy /Y /S /Q content\image\* docs\image\ >nul 2>&1

echo.
echo ✅ Content updated! No compilation was needed.
echo    - docs/data.json  (course data)
echo    - docs/image/     (lesson images)
echo.
echo You can now: git add . && git commit && git push

