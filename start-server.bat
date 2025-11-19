@echo off
echo.
echo ========================================
echo   Bay Area Family Eats Local Server
echo ========================================
echo.
echo Server running at: http://localhost:8000
echo Open this URL in your browser: http://localhost:8000/index.html
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python -m http.server 8000
