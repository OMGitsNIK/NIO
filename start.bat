@echo off
REM ==========================================
REM Start the Django server in a new terminal
REM ==========================================
start cmd /k (
    REM Navigate to the backend directory
    cd C:\Users\Admin\Desktop\DBCE NIO\backend

    REM Perform git pull to update the repository
    echo Pulling latest changes for Django...
    git pull

    REM Activate the virtual environment
    echo Activating virtual environment...
    call .\.env\Scripts\activate

    REM Start Django server
    echo Starting Django server...
    python .\manage.py runserver
)

REM ==========================================
REM Start the Next.js server in another terminal
REM ==========================================
start cmd /k (
    REM Navigate to the web (frontend) directory
    cd C:\Users\Admin\Desktop\DBCE NIO\web

    REM Perform git pull to update the repository
    echo Pulling latest changes for Next.js...
    git pull

    REM Install dependencies if needed
    echo Installing npm dependencies...
    npm install

    REM Start Next.js development server
    echo Starting Next.js server...
    npm run dev
)
