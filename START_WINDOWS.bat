@echo off
cd /d "%~dp0"
echo Starting SportEvent on http://127.0.0.1:8000
where py >nul 2>nul && (py -3 server.py & exit /b)
where python >nul 2>nul && (python server.py & exit /b)
echo Python 3 is required. Install it or run any local static HTTP server.
pause
