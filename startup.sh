#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Header
echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}      Culture Connect - Startup Script       ${NC}"
echo -e "${GREEN}==============================================${NC}"
echo

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking if PostgreSQL is running...${NC}"
pg_isready > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}PostgreSQL is not running!${NC}"
  echo -e "Please start PostgreSQL before continuing."
  echo -e "Example commands:"
  echo -e "  macOS: brew services start postgresql"
  echo -e "  Ubuntu: sudo service postgresql start"
  echo -e "  Windows: Start it from the Services control panel"
  echo
  read -p "Press Enter after starting PostgreSQL or Ctrl+C to exit..."
fi

# Check for .env file in backend directory
echo -e "${YELLOW}Checking for .env file in backend directory...${NC}"
if [ ! -f "./backend/.env" ]; then
  echo -e "${RED}No .env file found in backend directory!${NC}"
  echo -e "Creating a basic .env file..."
  
  echo "PORT=3000" > ./backend/.env
  echo "DATABASE_URL=postgres://localhost:5432/culture_connect" >> ./backend/.env
  echo "JWT_SECRET=development_secret_key_change_in_production" >> ./backend/.env
  echo "NODE_ENV=development" >> ./backend/.env
  
  echo -e "${GREEN}Basic .env file created. Please update it with your database credentials.${NC}"
  echo
fi

# Check if backend dependencies are installed
echo -e "${YELLOW}Checking backend dependencies...${NC}"
if [ ! -d "./backend/node_modules" ]; then
  echo -e "${RED}Backend dependencies not found!${NC}"
  echo -e "Installing backend dependencies..."
  
  cd backend
  npm install
  cd ..
  
  echo -e "${GREEN}Backend dependencies installed.${NC}"
  echo
fi

# Check if frontend dependencies are installed
echo -e "${YELLOW}Checking frontend dependencies...${NC}"
if [ ! -d "./node_modules" ]; then
  echo -e "${RED}Frontend dependencies not found!${NC}"
  echo -e "Installing frontend dependencies..."
  
  npm install
  
  echo -e "${GREEN}Frontend dependencies installed.${NC}"
  echo
fi

# Ask if the database needs initialization
echo -e "${YELLOW}Do you want to initialize and seed the database?${NC}"
echo -e "This will reset any existing data and populate the database with test data."
read -p "Initialize database? [y/N]: " INIT_DB

if [[ $INIT_DB =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Initializing database...${NC}"
  
  cd backend
  npm run sync:db
  npm run seed:activities
  npm run seed:mock
  cd ..
  
  echo -e "${GREEN}Database initialized and seeded.${NC}"
  echo
fi

# Start backend and frontend
echo -e "${YELLOW}Starting backend server...${NC}"
echo -e "The backend will run on http://localhost:3000"
echo

# Start backend in a new terminal window/tab if possible
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/backend\" && npm run dev"'
else
  # Linux/Windows
  echo -e "${RED}Please open a new terminal window and run:${NC}"
  echo -e "cd \"$PWD/backend\" && npm run dev"
  read -p "Press Enter after starting the backend server..."
fi

echo -e "${YELLOW}Starting frontend server...${NC}"
echo -e "The Expo development server will start in a few moments..."
echo

# Pause to let the backend start up
sleep 3

# Start frontend
npm start

echo -e "${GREEN}All done! Both backend and frontend servers are running.${NC}" 