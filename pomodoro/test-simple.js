// Simplest possible Electron test
const { app, BrowserWindow, Tray, nativeImage } = require('electron');
const path = require('path');

let win = null;
let tray = null;

app.whenReady().then(() => {
  console.log('Creating window...');
  
  // Create window
  win = new BrowserWindow({
    width: 350,
    height: 450,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // Load HTML file
  const htmlPath = path.join(__dirname, 'test.html');
  console.log('Loading:', htmlPath);
  win.loadFile(htmlPath);
  
  // Try to create tray with just title (no icon)
  console.log('Creating tray...');
  const emptyIcon = nativeImage.createEmpty();
  tray = new Tray(emptyIcon);
  tray.setTitle('🍅 25:00');
  
  console.log('Done! Check window and menu bar.');
});

app.on('window-all-closed', () => app.quit());
