#!/bin/bash
# production-deployment.sh
# Quick reference commands for deploying AdMob-enabled app to production

set -e  # Exit on error

echo "🚀 TRiVO App - Production Deployment Helper"
echo "============================================"
echo ""

# Function to print colored output
info() {
    echo "ℹ️  $1"
}

success() {
    echo "✅ $1"
}

warning() {
    echo "⚠️  $1"
}

error() {
    echo "❌ $1"
}

# Check prerequisites
info "Checking prerequisites..."
if ! command -v eas &> /dev/null; then
    error "EAS CLI not found. Install with: npm install -g eas-cli"
    exit 1
fi
success "EAS CLI is installed"

if ! command -v npm &> /dev/null; then
    error "npm not found"
    exit 1
fi
success "npm is installed"

# Main menu
echo ""
echo "Select deployment step:"
echo "1. Verify local setup (npm run dev)"
echo "2. Build preview APK (eas build --profile preview)"
echo "3. Build production Android (eas build -p android --profile production)"
echo "4. Build production iOS (eas build -p ios --profile production)"
echo "5. Check AdMob IDs in config"
echo "6. Show documentation"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        info "Starting local development..."
        info "Run this and check console for:"
        info "  ✅ AdMob initialized"
        info "  ✅ Banner ad loaded"
        npm run dev
        ;;
    2)
        warning "Preview build uses TestIds (no real ads)"
        info "Building preview APK..."
        eas build -p android --profile preview
        success "Preview build started! Check console for download link"
        ;;
    3)
        warning "PRODUCTION: Ensure you've updated ad unit IDs in config/adMobProductionIds.ts"
        read -p "Have you updated the ad unit IDs? (y/n): " confirmed
        if [ "$confirmed" = "y" ]; then
            info "Building production Android..."
            eas build -p android --profile production
            success "Production build started!"
        else
            error "Please update your ad unit IDs first"
            exit 1
        fi
        ;;
    4)
        warning "PRODUCTION: Ensure you've updated ad unit IDs in config/adMobProductionIds.ts"
        read -p "Have you updated the ad unit IDs? (y/n): " confirmed
        if [ "$confirmed" = "y" ]; then
            info "Building production iOS..."
            eas build -p ios --profile production
            success "Production build started!"
        else
            error "Please update your ad unit IDs first"
            exit 1
        fi
        ;;
    5)
        info "Checking AdMob configuration..."
        if grep -q "YOUR_REAL_ID" config/adMobProductionIds.ts; then
            error "Ad unit IDs not updated! Contains placeholder 'YOUR_REAL_ID'"
            echo ""
            echo "Update config/adMobProductionIds.ts with your real IDs from:"
            echo "https://admob.google.com -> Apps -> TRiVO -> Ad units"
            exit 1
        else
            success "Ad unit IDs appear to be configured"
            echo ""
            echo "Current configuration:"
            grep -E "bannerAndroid|bannerIOS" config/adMobProductionIds.ts || echo "Not found"
        fi
        ;;
    6)
        echo ""
        echo "📖 Documentation Files:"
        echo ""
        echo "1. PRODUCTION_DEPLOYMENT.md - Full deployment guide"
        echo "2. ADMOB_SETUP.md - AdMob setup instructions"
        echo "3. ADMOB_VERIFICATION.md - Verification report"
        echo "4. config/adMobProductionIds.ts - Update your unit IDs here"
        echo ""
        info "Open one of these files for detailed instructions"
        ;;
    *)
        error "Invalid choice"
        exit 1
        ;;
esac

echo ""
success "Done!"
