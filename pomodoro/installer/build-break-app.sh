#!/bin/bash

# Build the Break Sanctuary as a standalone Electron app
# Uses electron-builder with ASAR packaging for smaller size

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$SCRIPT_DIR/build"
BREAK_SRC="$PROJECT_DIR/src/break-screen"

echo "🪷 Building Break Sanctuary app..."

cd "$PROJECT_DIR"

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install electron-builder if not present
if ! npx electron-builder --version &> /dev/null; then
    echo "📦 Installing electron-builder..."
    npm install --save-dev electron-builder
fi

# Install electron in break-screen folder if needed
echo "📦 Setting up Break Sanctuary build environment..."
cd "$BREAK_SRC"
if [ ! -d "node_modules/electron" ]; then
    npm install --prefer-offline
fi

# Build using electron-builder with ASAR packaging
echo "📦 Packaging Break Sanctuary with ASAR..."

# Run electron-builder from project root to use its electron-builder
cd "$PROJECT_DIR"
npx electron-builder --mac --dir \
    --project "$BREAK_SRC" \
    --config.directories.output="$BUILD_DIR/break-build"

# Move to expected location
BREAK_APP="$BUILD_DIR/break-build/mac-arm64/Break Sanctuary.app"
if [ ! -d "$BREAK_APP" ]; then
    # Try alternate path
    BREAK_APP="$BUILD_DIR/break-build/mac/Break Sanctuary.app"
fi

if [ -d "$BREAK_APP" ]; then
    # Move to build root
    rm -rf "$BUILD_DIR/Break Sanctuary.app"
    mv "$BREAK_APP" "$BUILD_DIR/"
    rm -rf "$BUILD_DIR/break-build"
    
    # Show final size
    APP_SIZE=$(du -sh "$BUILD_DIR/Break Sanctuary.app" | cut -f1)
    echo "✅ Break Sanctuary app built: $BUILD_DIR/Break Sanctuary.app ($APP_SIZE)"
else
    echo "❌ Failed to build Break Sanctuary app"
    echo "Looking for app in: $BUILD_DIR/break-build/"
    ls -la "$BUILD_DIR/break-build/" 2>/dev/null || true
    exit 1
fi
