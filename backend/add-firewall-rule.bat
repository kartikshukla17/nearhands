@echo off
REM Batch script to add Windows Firewall rule for Node.js server
REM Run this script as Administrator (Right-click -> Run as administrator)

echo Adding Windows Firewall rule for port 5000...

netsh advfirewall firewall add rule name="NearHands Backend Port 5000" dir=in action=allow protocol=TCP localport=5000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Firewall rule added successfully!
    echo Your backend server should now be accessible from mobile devices on the same network.
) else (
    echo.
    echo ❌ Failed to add firewall rule. Make sure you're running as Administrator.
)

echo.
pause

