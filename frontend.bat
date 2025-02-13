
@REM REM Navigate to the web (frontend) directory
cd C:\Users\Admin\Desktop\DBCE NIO\web

@REM REM Perform git pull to update the repository
@REM echo Pulling latest changes for Next.js...
@REM git pull

@REM @REM REM Install dependencies if needed
@REM echo Installing npm dependencies...
@REM npm install

@REM REM Start Next.js development server
echo Starting Next.js server...
npm install && npm run build npm run start
