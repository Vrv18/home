// Break Screen - Minimal Electron Wrapper
// Launches a full-screen, borderless break sanctuary

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let breakWindow = null;

function createBreakWindow() {
  // Get primary display for full screen
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  breakWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    fullscreen: true,
    frame: false,
    transparent: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#4A4238', // Deep earth color
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the break screen
  breakWindow.loadFile(path.join(__dirname, 'index.html'));

  // Prevent the window from being closed accidentally
  breakWindow.on('close', (e) => {
    // Allow close
  });

  breakWindow.on('closed', () => {
    breakWindow = null;
    // Quit the app when break window closes
    app.quit();
  });

  // Focus the window
  breakWindow.focus();
  
  // On macOS, set window level to be above all
  if (process.platform === 'darwin') {
    breakWindow.setAlwaysOnTop(true, 'screen-saver');
    breakWindow.setVisibleOnAllWorkspaces(true);
  }
}

// Handle close request from renderer
ipcMain.on('close-break-screen', () => {
  if (breakWindow) {
    breakWindow.close();
  }
});

// App lifecycle
app.whenReady().then(() => {
  createBreakWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus existing window
    if (breakWindow) {
      breakWindow.focus();
    }
  });
}

// Hide dock icon on macOS (optional - for a cleaner experience)
if (process.platform === 'darwin') {
  app.dock?.hide();
}
