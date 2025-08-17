# RateFlow Project Renaming Script
# Run this script to rename all project files and directories

Write-Host "🔄 RateFlow Project Renaming Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Step 1: Stop any running Node processes
Write-Host "1. Stopping any running Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Step 2: Rename internal directories
Write-Host "2. Renaming internal directories..." -ForegroundColor Yellow

try {
    # Rename backend-folder to rateflow-backend
    if (Test-Path "backend-folder") {
        Rename-Item -Path "backend-folder" -NewName "rateflow-backend" -ErrorAction Stop
        Write-Host "   ✅ Renamed backend-folder -> rateflow-backend" -ForegroundColor Green
    }

    # Rename the inner backend directory
    if (Test-Path "rateflow-backend\backend") {
        Rename-Item -Path "rateflow-backend\backend" -NewName "server" -ErrorAction Stop
        Write-Host "   ✅ Renamed backend -> server" -ForegroundColor Green
    }

    # Rename frontend to rateflow-frontend
    if (Test-Path "frontend") {
        Rename-Item -Path "frontend" -NewName "rateflow-frontend" -ErrorAction Stop
        Write-Host "   ✅ Renamed frontend -> rateflow-frontend" -ForegroundColor Green
    }

    # Remove or rename the cole folder if not needed
    if (Test-Path "cole") {
        Remove-Item -Path "cole" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removed cole directory" -ForegroundColor Green
    }

} catch {
    Write-Host "   ❌ Error renaming directories: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Make sure no files are open in IDE or terminals" -ForegroundColor Yellow
}

# Step 3: Rename configuration files
Write-Host "3. Renaming configuration files..." -ForegroundColor Yellow

try {
    # Rename package.json to rateflow-workspace.json or similar
    if (Test-Path "package.json") {
        Rename-Item -Path "package.json" -NewName "rateflow-workspace.json" -ErrorAction Stop
        Write-Host "   ✅ Renamed package.json -> rateflow-workspace.json" -ForegroundColor Green
    }

    # Rename workspace file
    if (Test-Path "assignment.code-workspace") {
        Rename-Item -Path "assignment.code-workspace" -NewName "rateflow.code-workspace" -ErrorAction Stop
        Write-Host "   ✅ Renamed assignment.code-workspace -> rateflow.code-workspace" -ForegroundColor Green
    }

} catch {
    Write-Host "   ❌ Error renaming config files: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Update file contents
Write-Host "4. Updating file contents..." -ForegroundColor Yellow

# Update README.md paths
try {
    if (Test-Path "README.md") {
        $readmeContent = Get-Content "README.md" -Raw
        $readmeContent = $readmeContent -replace "backend-folder\\backend", "rateflow-backend\server"
        $readmeContent = $readmeContent -replace "frontend", "rateflow-frontend"
        $readmeContent = $readmeContent -replace "assignment2", "RateFlow-Application"
        Set-Content -Path "README.md" -Value $readmeContent
        Write-Host "   ✅ Updated README.md paths" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error updating README.md: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Create new structure summary
Write-Host "5. Creating new project structure..." -ForegroundColor Yellow

$newStructure = @"
RateFlow-Application/
├── rateflow-backend/           # Express.js backend server
│   └── server/                 # Main server application
│       ├── server.js           # Main server file
│       ├── package.json        # Backend dependencies
│       └── .env               # Environment variables
├── rateflow-frontend/         # Next.js frontend application
│   ├── app/                   # Next.js 14 App Router
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility functions and API
│   └── package.json           # Frontend dependencies
├── docs/                      # Documentation
│   ├── README.md              # Main documentation
│   ├── MYSQL-SETUP-GUIDE.md   # Database setup guide
│   └── CONTRIBUTING.md        # Contribution guidelines
├── rateflow-workspace.json    # Project configuration
├── rateflow.code-workspace    # VS Code workspace
└── .env.example              # Environment template
"@

Set-Content -Path "NEW-PROJECT-STRUCTURE.txt" -Value $newStructure
Write-Host "   ✅ Created project structure guide" -ForegroundColor Green

Write-Host "" -ForegroundColor White
Write-Host "🎉 Renaming process completed!" -ForegroundColor Green
Write-Host "📋 Check NEW-PROJECT-STRUCTURE.txt for the new layout" -ForegroundColor Cyan
Write-Host "⚠️  If any renames failed, close all editors and run again" -ForegroundColor Yellow

# Step 6: Final instructions
Write-Host "" -ForegroundColor White
Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. Navigate up one directory level (cd ..)" -ForegroundColor White
Write-Host "3. Rename the main folder: Store-Rating-Website -> RateFlow-Application" -ForegroundColor White
Write-Host "4. Update your IDE/editor to point to the new paths" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🚀 Your RateFlow application is ready with new professional naming!" -ForegroundColor Green
