-- Pomodoro Timer Installer
-- One-click installer for SwiftBar + Pomodoro plugin

use scripting additions
use framework "Foundation"

-- Configuration
property swiftbarURL : "https://github.com/swiftbar/SwiftBar/releases/download/v2.0.0/SwiftBar.zip"
property pluginFolderPath : "~/Documents/SwiftBar"
property appName : "SwiftBar"

on run
	try
		-- Show welcome dialog
		display dialog "Welcome to Pomodoro Timer!

This will install:
• SwiftBar (menu bar app)
• Pomodoro Timer plugin

Click Install to continue." buttons {"Cancel", "Install"} default button "Install" with title "Pomodoro Timer Installer" with icon note
		
		if button returned of result is "Cancel" then
			return
		end if
		
		-- Expand paths
		set pluginFolder to expandPath(pluginFolderPath)
		set appFolder to "/Applications"
		set swiftbarApp to appFolder & "/SwiftBar.app"
		set tempFolder to "/tmp/pomodoro-install"
		
		-- Get the installer's location (to find bundled files)
		set myPath to path to me as text
		set myPosixPath to POSIX path of myPath
		set resourcesPath to myPosixPath & "Contents/Resources/"
		
		-- Check if SwiftBar already installed
		set swiftbarInstalled to fileExists(swiftbarApp)
		
		if not swiftbarInstalled then
			-- Download and install SwiftBar
			showProgress("Downloading SwiftBar...")
			
			-- Create temp folder
			do shell script "mkdir -p " & quoted form of tempFolder
			
			-- Download SwiftBar
			set zipPath to tempFolder & "/SwiftBar.zip"
			try
				do shell script "curl -L -o " & quoted form of zipPath & " " & quoted form of swiftbarURL
			on error errMsg
				display dialog "Failed to download SwiftBar: " & errMsg buttons {"OK"} default button "OK" with icon stop
				return
			end try
			
			-- Unzip SwiftBar
			showProgress("Installing SwiftBar...")
			do shell script "unzip -o -q " & quoted form of zipPath & " -d " & quoted form of tempFolder
			
			-- Move to Applications
			do shell script "mv " & quoted form of (tempFolder & "/SwiftBar.app") & " " & quoted form of appFolder with administrator privileges
			
			-- Cleanup temp files
			do shell script "rm -rf " & quoted form of tempFolder
		end if
		
		-- Create plugin folder
		showProgress("Setting up Pomodoro plugin...")
		do shell script "mkdir -p " & quoted form of pluginFolder
		
		-- Copy the plugin script from Resources
		set scriptSource to resourcesPath & "pomodoro.1s.sh"
		set scriptDest to pluginFolder & "/pomodoro.1s.sh"
		
		-- Check if script exists in Resources
		if fileExists(scriptSource) then
			do shell script "cp " & quoted form of scriptSource & " " & quoted form of scriptDest
			do shell script "chmod +x " & quoted form of scriptDest
		else
			-- Script might be alongside the installer during development
			set devScriptPath to (do shell script "dirname " & quoted form of myPosixPath) & "/pomodoro.1s.sh"
			if fileExists(devScriptPath) then
				do shell script "cp " & quoted form of devScriptPath & " " & quoted form of scriptDest
				do shell script "chmod +x " & quoted form of scriptDest
			else
				display dialog "Could not find pomodoro.1s.sh script. Please reinstall." buttons {"OK"} default button "OK" with icon stop
				return
			end if
		end if
		
		-- Set SwiftBar preferences to use our plugin folder
		showProgress("Configuring SwiftBar...")
		do shell script "defaults write com.ameba.SwiftBar PluginDirectory " & quoted form of pluginFolder
		
		-- Create the pomodoro state directory
		do shell script "mkdir -p ~/.pomodoro"
		
		-- Launch SwiftBar
		showProgress("Launching Pomodoro Timer...")
		delay 0.5
		
		-- Kill any existing SwiftBar instance
		try
			do shell script "pkill -x SwiftBar"
			delay 1
		end try
		
		-- Launch SwiftBar
		do shell script "open -a SwiftBar"
		
		-- Success!
		display dialog "Pomodoro Timer installed successfully!

Look for the timer icon in your menu bar (top right).

Click the icon to start a focus session." buttons {"Done"} default button "Done" with title "Installation Complete" with icon note
		
	on error errMsg number errNum
		if errNum is not -128 then -- Not user cancelled
			display dialog "Installation failed: " & errMsg buttons {"OK"} default button "OK" with icon stop
		end if
	end try
end run

-- Helper: Expand ~ in path
on expandPath(thePath)
	return do shell script "echo " & thePath
end expandPath

-- Helper: Check if file exists
on fileExists(thePath)
	try
		do shell script "test -e " & quoted form of thePath
		return true
	on error
		return false
	end try
end fileExists

-- Helper: Show progress (just logs, could be enhanced with progress bar)
on showProgress(message)
	-- In a more complex installer, this could update a progress window
	log message
end showProgress
