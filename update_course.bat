@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Building Frontend Course Application
echo ============================================
echo.

rem Old builds are kept in git history, so no local copies are kept.
rem Remove the legacy docs\assets\old folder left by earlier versions of this script.
if exist "docs\assets\old" (
    echo Removing legacy docs\assets\old ...
    rmdir /s /q "docs\assets\old"
)

rem Move the current bundles to a temp folder so a failed build can be rolled back.
set "BACKUP=%TEMP%\teach_prev_assets"
if exist "%BACKUP%" rmdir /s /q "%BACKUP%"
mkdir "%BACKUP%"
move /Y docs\assets\*.js "%BACKUP%\" >nul 2>&1
move /Y docs\assets\*.css "%BACKUP%\" >nul 2>&1

echo Building frontend with Vite...
pushd web_src
call npm run build
set "BUILD_ERR=%ERRORLEVEL%"
popd

if not "%BUILD_ERR%"=="0" (
    echo.
    echo [ERROR] Build failed. Restoring previous assets...
    move /Y "%BACKUP%\*.*" docs\assets\ >nul 2>&1
    rmdir /s /q "%BACKUP%"
    exit /b %BUILD_ERR%
)

rem Build succeeded: discard the previous bundles.
rmdir /s /q "%BACKUP%"

echo.
echo ============================================
echo   Build complete!
echo   docs/assets/ now contains only the new bundles
echo   Content is loaded from docs/content/
echo ============================================
echo.
echo You can now: git add -A ^&^& git commit ^&^& git push
endlocal
