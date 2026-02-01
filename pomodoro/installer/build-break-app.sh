#!/bin/bash

# Build the Break Sanctuary as a standalone Electron app
# This creates a .app bundle that can be distributed without Node.js

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$SCRIPT_DIR/build"

echo "🪷 Building Break Sanctuary app..."

cd "$PROJECT_DIR"

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create a temporary package.json for the break screen build
cat > "$PROJECT_DIR/src/break-screen/package.json" << 'EOF'
{
  "name": "break-sanctuary",
  "version": "1.0.0",
  "description": "Break Sanctuary - Hoysala inspired break screen",
  "main": "main.js",
  "author": "",
  "license": "MIT"
}
EOF

# Use electron-packager to create standalone app
echo "📦 Packaging Break Sanctuary..."

# Check if electron-packager is available, if not use npx
if ! command -v electron-packager &> /dev/null; then
    npx electron-packager "$PROJECT_DIR/src/break-screen" "Break Sanctuary" \
        --platform=darwin \
        --arch=universal \
        --out="$BUILD_DIR" \
        --overwrite \
        --app-bundle-id=com.pomodoro.break-sanctuary \
        --app-version=1.0.0 \
        --icon="$PROJECT_DIR/src/assets/icons/break.png" \
        --prune=true
else
    electron-packager "$PROJECT_DIR/src/break-screen" "Break Sanctuary" \
        --platform=darwin \
        --arch=universal \
        --out="$BUILD_DIR" \
        --overwrite \
        --app-bundle-id=com.pomodoro.break-sanctuary \
        --app-version=1.0.0 \
        --icon="$PROJECT_DIR/src/assets/icons/break.png" \
        --prune=true
fi

# Clean up temporary package.json
rm "$PROJECT_DIR/src/break-screen/package.json"

# Move to expected location
BREAK_APP="$BUILD_DIR/Break Sanctuary-darwin-universal/Break Sanctuary.app"
if [ -d "$BREAK_APP" ]; then
    # Move to build root
    rm -rf "$BUILD_DIR/Break Sanctuary.app"
    mv "$BREAK_APP" "$BUILD_DIR/"
    rm -rf "$BUILD_DIR/Break Sanctuary-darwin-universal"
    echo "✅ Break Sanctuary app built: $BUILD_DIR/Break Sanctuary.app"
else
    echo "❌ Failed to build Break Sanctuary app"
    exit 1
fi
