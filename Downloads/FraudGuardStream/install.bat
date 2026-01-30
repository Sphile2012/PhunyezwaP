@echo off
echo Instagram Clone Setup - Created by Phumeh
echo ==========================================

echo.
echo Installing root dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Building frontend for production...
cd frontend
call npm run build
cd ..

echo.
echo ==========================================
echo Setup complete! 
echo.
echo To start development:
echo 1. Set up your .env file in backend folder
echo 2. Start MongoDB
echo 3. Run: npm run dev
echo.
echo To deploy:
echo - Backend: Deploy backend folder to Railway/Render
echo - Frontend: Deploy frontend/build folder to Netlify
echo.
echo Created by Phumeh - Ready to deploy! 🚀
pause