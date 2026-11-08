@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo SportEvent: publish existing Git history to GitHub
 echo ============================================================
where git >nul 2>nul || (echo ERROR: Git for Windows is not installed.& pause& exit /b 1)
echo.
echo IMPORTANT: first create an EMPTY PUBLIC repository named:
echo   sportevent-git-coursework
echo under the GitHub account kotnarys.
echo Do not initialize it with README or LICENSE.
echo.
git remote -v
echo.
git status --short
echo.
echo If remote URL points to the wrong owner, edit origin via:
echo   git remote set-url origin https://github.com/YOUR_LOGIN/sportevent-git-coursework.git
pause
git push -u origin main || (echo PUSH FAILED. Check that the repo exists and login is authorized.& pause& exit /b 1)
git push origin stage/analysis stage/design stage/implementation stage/testing stage/deployment || (echo Branch push failed.& pause& exit /b 1)
git push origin v1.0.0 || (echo Tag push failed.& pause& exit /b 1)
echo.
echo DONE. Check your public repo URL and add it to the coursework DOCX.
pause
