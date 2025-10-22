#!/bin/bash

echo "í°³ Deploying Kombai Docker Fix..."
echo "=================================="
echo ""

# Step 1: Stop current containers
echo "1. Stopping current containers..."
docker-compose down

# Step 2: Rebuild with no cache
echo ""
echo "2. Rebuilding Docker image (no cache)..."
docker-compose build --no-cache

# Step 3: Start services
echo ""
echo "3. Starting services..."
docker-compose up -d

# Step 4: Wait for services to be ready
echo ""
echo "4. Waiting for services to be ready..."
sleep 10

# Step 5: Check status
echo ""
echo "5. Checking service status..."
docker-compose ps

# Step 6: Show logs
echo ""
echo "6. Showing logs (last 50 lines)..."
docker-compose logs --tail=50 app

echo ""
echo "âœ… Deployment complete!"
echo ""
echo "To test the fix:"
echo "  1. Navigate to: http://localhost:3000/kombai-automation"
echo "  2. Submit a test automation request"
echo "  3. Watch the logs: docker-compose logs -f app"
echo ""
