#!/bin/bash

# 🚀 SecureChat Deployment Script
# This script helps you deploy your SecureChat application

echo "🔐 SecureChat Deployment Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

echo "✅ Dependencies installed successfully"

# Build the application
echo "🔨 Building application..."
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

echo "✅ Application built successfully"

echo ""
echo "🎯 Choose your deployment option:"
echo "1. Railway + Vercel (Recommended)"
echo "2. Render + Vercel"
echo "3. Encore.ts Cloud"
echo "4. Local Development"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Railway + Vercel..."
        echo ""
        echo "📋 Steps to follow:"
        echo "1. Go to https://railway.app and sign up"
        echo "2. Create new project from GitHub repo: Malaviya24/securechat"
        echo "3. Set root directory to 'backend'"
        echo "4. Add PostgreSQL database"
        echo "5. Set environment variables (see DEPLOYMENT_GUIDE.md)"
        echo "6. Go to https://vercel.com and deploy frontend"
        echo "7. Set root directory to 'frontend'"
        echo "8. Add VITE_API_URL environment variable"
        ;;
    2)
        echo "🚀 Deploying to Render + Vercel..."
        echo ""
        echo "📋 Steps to follow:"
        echo "1. Go to https://render.com and sign up"
        echo "2. Create new Web Service from GitHub repo"
        echo "3. Set root directory to 'backend'"
        echo "4. Add PostgreSQL database"
        echo "5. Set environment variables (see DEPLOYMENT_GUIDE.md)"
        echo "6. Go to https://vercel.com and deploy frontend"
        echo "7. Set root directory to 'frontend'"
        echo "8. Add VITE_API_URL environment variable"
        ;;
    3)
        echo "🚀 Deploying to Encore.ts Cloud..."
        echo ""
        echo "📋 Steps to follow:"
        echo "1. Install Encore CLI: npm install -g encore"
        echo "2. Login to Encore: encore auth login"
        echo "3. Deploy: encore deploy"
        echo "4. Get your app URL: encore app list"
        ;;
    4)
        echo "🔧 Setting up local development..."
        echo ""
        echo "📋 Steps to follow:"
        echo "1. Install PostgreSQL locally"
        echo "2. Create database and user (see DEPLOYMENT_GUIDE.md)"
        echo "3. Create .env files with local settings"
        echo "4. Run: cd backend && npm run dev"
        echo "5. Run: cd frontend && npm run dev"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "🎉 Good luck with your deployment!"
