#!/bin/bash

# Build script for Pomodoro Timer DMG
# Creates a distributable disk image with the installer

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$SCRIPT_DIR/build"
DMG_NAME="Pomodoro-Timer"
APP_NAME="Install Pomodoro.app"
VOLUME_NAME="Pomodoro Timer"

echo "🍅 Building Pomodoro Timer Installer..."

# Clean previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Step 0: Build the Break Sanctuary app
echo "🪷 Building Break Sanctuary app..."
chmod +x "$SCRIPT_DIR/build-break-app.sh"
"$SCRIPT_DIR/build-break-app.sh"

BREAK_APP="$BUILD_DIR/Break Sanctuary.app"
if [ ! -d "$BREAK_APP" ]; then
    echo "⚠️  Break Sanctuary app not built - continuing without it"
fi

# Step 1: Compile AppleScript to .app
echo "📦 Compiling installer app..."
osacompile -o "$BUILD_DIR/$APP_NAME" "$SCRIPT_DIR/Install Pomodoro.applescript"

# Step 2: Copy the pomodoro script into app bundle Resources
echo "📋 Bundling plugin script..."
RESOURCES_DIR="$BUILD_DIR/$APP_NAME/Contents/Resources"
cp "$PROJECT_DIR/pomodoro.1s.sh" "$RESOURCES_DIR/"
chmod +x "$RESOURCES_DIR/pomodoro.1s.sh"

# Step 2.5: Copy Break Sanctuary app into Resources if it exists
if [ -d "$BREAK_APP" ]; then
    echo "🪷 Bundling Break Sanctuary app..."
    cp -R "$BREAK_APP" "$RESOURCES_DIR/"
fi

# Step 3: Set a nice icon for the installer (optional - uses default AppleScript icon)
# If you have a custom .icns file, uncomment and modify:
# cp "$PROJECT_DIR/src/assets/icons/installer.icns" "$RESOURCES_DIR/applet.icns"

# Step 4: Create DMG staging folder
echo "📀 Creating DMG contents..."
DMG_STAGE="$BUILD_DIR/dmg-stage"
mkdir -p "$DMG_STAGE"
cp -R "$BUILD_DIR/$APP_NAME" "$DMG_STAGE/"

# Add a README
cat > "$DMG_STAGE/README.txt" << 'EOF'
Pomodoro Timer
==============

Double-click "Install Pomodoro" to install.

⚠️  IMPORTANT - First Launch:
If you see "Install Pomodoro is damaged", this is macOS blocking unsigned apps.
Fix: Right-click the app → Click "Open" → Click "Open" again in the dialog.

The installer will:
1. Download SwiftBar (if not already installed)
2. Set up the Pomodoro timer plugin + Break Sanctuary
3. Launch the timer in your menu bar

After installation, click the timer icon in your menu bar to start a focus session!

---
Troubleshooting:

If you see "damaged and can't be opened":
- Right-click "Install Pomodoro" → Click "Open"
- Or run in Terminal: xattr -cr /Volumes/Pomodoro\ Timer/Install\ Pomodoro.app

If you don't see the timer:
- Open SwiftBar from Applications
- Look for the icon in the top-right menu bar

To uninstall:
- Delete SwiftBar from Applications
- Delete ~/Documents/SwiftBar folder
- Delete ~/.pomodoro folder
EOF

# Add Applications symlink for drag-install of SwiftBar (if user wants)
ln -s /Applications "$DMG_STAGE/Applications"

# Step 5: Create the DMG with maximum compression
echo "💿 Creating DMG with maximum compression..."
DMG_PATH="$BUILD_DIR/$DMG_NAME.dmg"
rm -f "$DMG_PATH"

# Create DMG using hdiutil with bzip2 compression (smaller than default zlib)
hdiutil create -volname "$VOLUME_NAME" \
    -srcfolder "$DMG_STAGE" \
    -ov -format UDBZ \
    "$DMG_PATH"

# Cleanup staging
rm -rf "$DMG_STAGE"

echo ""
echo "✅ Build complete!"
echo "   DMG: $DMG_PATH"
echo ""
echo "📤 To distribute:"
echo "   1. Send the DMG file to your wife"
echo "   2. She double-clicks to open"
echo "   3. She double-clicks 'Install Pomodoro'"
echo "   4. Done!"
