#!/bin/bash

# FlowTrack Backend Setup Script
# This script sets up the complete backend environment

set -e  # Exit on error

echo "🚀 FlowTrack Backend Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Python version
echo "📦 Checking Python version..."
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+')
required_version="3.10"

if (( $(echo "$python_version < $required_version" | bc -l) )); then
    echo -e "${RED}❌ Python $required_version or higher is required. You have $python_version${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Python $python_version detected${NC}"
fi

# Create virtual environment
echo ""
echo "🐍 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo ""
echo "🔌 Activating virtual environment..."
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check if .env exists
echo ""
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your actual configuration${NC}"
    echo -e "${YELLOW}   Database, Redis, and JWT_SECRET need to be configured${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Check PostgreSQL
echo ""
echo "🔍 Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
    echo ""
    echo "To create the database, run:"
    echo "  psql -U postgres"
    echo "  CREATE DATABASE flowtrack_db;"
    echo "  CREATE USER flowtrack_user WITH PASSWORD 'flowtrack_pass';"
    echo "  GRANT ALL PRIVILEGES ON DATABASE flowtrack_db TO flowtrack_user;"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please install it:${NC}"
    echo "  sudo apt-get install postgresql postgresql-contrib"
fi

# Check Redis
echo ""
echo "🔍 Checking Redis..."
if command -v redis-server &> /dev/null; then
    echo -e "${GREEN}✅ Redis is installed${NC}"
    if systemctl is-active --quiet redis-server; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis is not running. Start it with:${NC}"
        echo "  sudo systemctl start redis-server"
    fi
else
    echo -e "${YELLOW}⚠️  Redis not found. Please install it:${NC}"
    echo "  sudo apt-get install redis-server"
fi

# Database migrations
echo ""
echo "📊 Database migrations..."
echo "After setting up PostgreSQL, run:"
echo "  alembic revision --autogenerate -m 'Initial migration'"
echo "  alembic upgrade head"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🚀 To start the server:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "📚 Documentation will be available at:"
echo "  http://localhost:8000/docs"
echo ""
