#!/bin/bash

# Break Sanctuary Installer
# Installs the app to /Applications and sets up Auto-Login.

APP_NAME="Break Sanctuary"
APP_DIR="/Applications"
RELEASE_URL="https://github.com/Vrv18/home/releases/latest/download/Break.Sanctuary.dmg" # TODO: Update this when Release is created

echo "🪷  Installing $APP_NAME..."

# 1. Download / Build
# If we are running from source repo, build it.
if [ -f "tauri-app/package.json" ]; then
    echo "📦  Detected source code. Building from source..."
    cd "tauri-app"
    npm install
    npm run tauri build
    cd ..
    TARGET_APP="tauri-app/src-tauri/target/release/bundle/macos/$APP_NAME.app"
else
    # Remote Install Mode: Download DMG
    echo "⬇️   Downloading latest release..."
    curl -L -o "/tmp/$APP_NAME.dmg" "$RELEASE_URL"
    
    # Mount and Copy
    hdiutil attach "/tmp/$APP_NAME.dmg" -mountpoint "/Volumes/$APP_NAME"
    TARGET_APP="/Volumes/$APP_NAME/$APP_NAME.app"
fi

# 2. Install
if [ -d "$TARGET_APP" ]; then
    echo "📂  Moving to $APP_DIR..."
    rm -rf "$APP_DIR/$APP_NAME.app"
    cp -R "$TARGET_APP" "$APP_DIR/"
    
    # Cleanup (if downloaded)
    if [ ! -f "tauri-app/package.json" ]; then
        hdiutil detach "/Volumes/$APP_NAME"
        rm "/tmp/$APP_NAME.dmg"
    fi
    
    echo "✅  Installed to $APP_DIR/$APP_NAME.app"
else
    echo "❌  Installation failed. Could not find app bundle."
    exit 1
fi

# 3. Auto-Start (Login Item)
echo "⚙️   Configuring Auto-Start..."
osascript -e "tell application \"System Events\" to make login item at end with properties {path:\"$APP_DIR/$APP_NAME.app\", hidden:false}" 2>/dev/null

echo ""
echo "🎉  Installation Complete!"
echo "    App is ready in your Applications folder and set to start at login."
echo "    Run 'open -a \"$APP_NAME\"' to start now."
