# PowerShell script to add Windows Firewall rule for Node.js server
# Run this script as Administrator

Write-Host "Adding Windows Firewall rule for port 5000..." -ForegroundColor Yellow

# Add inbound rule for port 5000
netsh advfirewall firewall add rule name="NearHands Backend Port 5000" dir=in action=allow protocol=TCP localport=5000

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Firewall rule added successfully!" -ForegroundColor Green
    Write-Host "Your backend server should now be accessible from mobile devices on the same network." -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add firewall rule. Make sure you're running as Administrator." -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

