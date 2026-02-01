#!/bin/bash

# Break Sanctuary Installer
# 1. Builds the Tauri app (Release mode)
# 2. Installs to /Applications
# 3. Sets up Auto-Login

APP_NAME="Break Sanctuary"
APP_DIR="/Applications"
SOURCE_DIR="tauri-app"

echo "🪷  Installing $APP_NAME..."

# 1. Build
echo "📦  Building Release Binary..."
cd "$SOURCE_DIR"
if npm run tauri build; then
    echo "✅  Build Successful."
else
    echo "❌  Build Failed."
    exit 1
fi

# 2. Install
TARGET_APP="src-tauri/target/release/bundle/macos/$APP_NAME.app"

if [ -d "$TARGET_APP" ]; then
    echo "📂  Moving to $APP_DIR..."
    # Remove existing if present
    rm -rf "$APP_DIR/$APP_NAME.app"
    cp -R "$TARGET_APP" "$APP_DIR/"
    echo "✅  Installed to $APP_DIR/$APP_NAME.app"
else
    echo "❌  Could not find built app at $TARGET_APP"
    exit 1
fi

# 3. Auto-Start (Login Item)
echo "⚙️   Configuring Auto-Start..."
osascript -e "tell application \"System Events\" to make login item at end with properties {path:\"$APP_DIR/$APP_NAME.app\", hidden:false}" 2>/dev/null

echo ""
echo "🎉  Installation Complete!"
echo "    $APP_NAME has been added to your Login Items."
echo "    You can launch it now from Spotlight or Applications."
echo ""
echo "    To launch immediately:"
echo "    open -a \"$APP_NAME\""
