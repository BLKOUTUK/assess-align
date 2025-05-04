#!/bin/bash
# deploy.sh - Docker deployment script for Assess & Align

# Exit on error
set -e

# Load environment variables from .env.production
if [ -f .env.production ]; then
  export $(grep -v "^#" .env.production | xargs)
  echo "Loaded environment variables from .env.production"
else
  echo "Warning: .env.production file not found. Make sure environment variables are set."
fi

# Build and start the Docker containers
echo "Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Check if the application is running
echo "Checking if the application is running..."
sleep 10
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Application is running successfully at http://localhost:3000"
else
  echo "❌ Application failed to start. Check the logs with: docker-compose -f docker-compose.prod.yml logs"
  exit 1
fi

echo ""
echo "Deployment completed successfully!"
echo "You can view the application at: http://localhost:3000"
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop the application: docker-compose -f docker-compose.prod.yml down"
