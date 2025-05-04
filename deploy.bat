@echo off
REM deploy.bat - Docker deployment script for Assess & Align

echo Building and starting Docker containers...
docker-compose -f docker-compose.prod.yml up -d --build

echo Checking if the application is running...
timeout /t 10 /nobreak > nul
curl -s http://localhost:3000 > nul
if %ERRORLEVEL% == 0 (
  echo ✅ Application is running successfully at http://localhost:3000
) else (
  echo ❌ Application failed to start. Check the logs with: docker-compose -f docker-compose.prod.yml logs
  exit /b 1
)

echo.
echo Deployment completed successfully!
echo You can view the application at: http://localhost:3000
echo To view logs: docker-compose -f docker-compose.prod.yml logs -f
echo To stop the application: docker-compose -f docker-compose.prod.yml down
