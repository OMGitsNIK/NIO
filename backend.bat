
@REM REM Navigate to the backend directory
cd C:\Users\Admin\Desktop\DBCE NIO\backend

@REM REM Perform git pull to update the repository
@REM echo Pulling latest changes for Django...
@REM git pull

REM Activate the virtual environment
echo Activating virtual environment...
call .\.env\Scripts\activate

REM Start Django server
echo Starting Django server...
python .\manage.py runserver


