#!/bin/bash

echo "🚀 Starting Ici Ca Pousse Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the authentication server in the background
echo "🔐 Starting authentication server on port 3001..."
node server.js &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 2

# Check if server started successfully
if ! curl -s http://localhost:3001/api/users > /dev/null; then
    echo "❌ Failed to start authentication server. Please check if port 3001 is available."
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "✅ Authentication server started successfully!"

# Start the React development server
echo "⚛️  Starting React development server on port 3000..."
npm start

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait 