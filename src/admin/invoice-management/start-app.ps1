Write-Host "Starting Invoice Management Application..." -ForegroundColor Green

# Get the directory of the script and navigate to the invoice-management subdirectory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Join-Path -Path $scriptDir -ChildPath "invoice-management"
Set-Location -Path $appDir

# Check if package.json exists
if (-not (Test-Path -Path "package.json")) {
    Write-Host "Error: package.json not found in the invoice-management directory." -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    Write-Host "Make sure you are in the correct directory and the file exists." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Running npm start in $(Get-Location)" -ForegroundColor Cyan
npm start 