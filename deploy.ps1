# ============================================
# Deploy to GitHub Pages - SIMPLIFIED
# ============================================
# This script builds and deploys your Angular app to GitHub Pages
# 
# Prerequisites: 
# - You've already pushed your code to GitHub using GitHub Desktop
#
# Usage: .\deploy.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy to GitHub Pages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$angularDir = ".\gallery-app"
$githubRepo = "https://github.com/stavrosflou/gallery-app"

# Navigate to Angular directory
if (-not (Test-Path $angularDir)) {
    Write-Host "Error: gallery-app directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $angularDir

# Step 1: Install angular-cli-ghpages if not already installed
Write-Host "Step 1: Checking for angular-cli-ghpages..." -ForegroundColor Green
$hasGhPages = npm list -g angular-cli-ghpages 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing angular-cli-ghpages..." -ForegroundColor Yellow
    npm install -g angular-cli-ghpages
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install angular-cli-ghpages!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "angular-cli-ghpages is already installed." -ForegroundColor Gray
}

Write-Host ""

# Step 2: Build the application
Write-Host "Step 2: Building application for production..." -ForegroundColor Green
Write-Host "(This may take a few minutes...)" -ForegroundColor Gray
npm run build -- --configuration production --base-href "/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""

# Step 3: Deploy to GitHub Pages
Write-Host "Step 3: Deploying to GitHub Pages..." -ForegroundColor Green
npx angular-cli-ghpages --dir=dist/gallery-app/browser --cname=centralgalleryart.com --no-silent

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  🎉 Deployment Successful! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your site will be available at:" -ForegroundColor Cyan
    Write-Host "https://centralgalleryart.com/" -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: It may take 5-10 minutes for changes to appear." -ForegroundColor Yellow
    Write-Host "Clear your browser cache (Ctrl+Shift+R) if needed." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure you have:" -ForegroundColor Yellow
    Write-Host "1. Pushed your code to GitHub using GitHub Desktop" -ForegroundColor Yellow
    Write-Host "2. Enabled GitHub Pages in repository settings" -ForegroundColor Yellow
    Write-Host "3. Proper authentication configured" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Set-Location ..
