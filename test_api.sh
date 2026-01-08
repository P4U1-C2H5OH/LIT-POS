#!/bin/bash

# Test script to verify backend API endpoints

echo "Testing backend API endpoints..."
echo ""

# Get a valid token first (you'll need to replace with actual credentials)
echo "1. Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract token (this is a simple extraction, might need adjustment)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "ERROR: Failed to get authentication token"
    echo "Please check if backend is running and credentials are correct"
    exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Test inventory endpoint
echo "2. Testing inventory endpoint..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/inventory/ | head -c 200
echo ""
echo ""

# Test creating a transaction
echo "3. Testing transaction creation..."
TRANSACTION_DATA='{
  "customer": null,
  "payment_method": "CASH",
  "subtotal": "100.00",
  "tax": "15.00",
  "discount": "0.00",
  "total": "115.00",
  "status": "COMPLETED",
  "items": []
}'

curl -v -X POST http://localhost:8000/api/transactions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$TRANSACTION_DATA" 2>&1 | grep -E "(HTTP|error|detail)"

echo ""
echo ""
echo "Test complete!"
