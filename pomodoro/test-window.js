// Test with visible window + tray
const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(`data:text/html,
    <html>
      <body style="font-family: -apple-system; padding: 20px; background: #FAF8F5;">
        <h1 style="color: #8B7355;">🪷 Pomodoro Test</h1>
        <p>If you see this window, Electron is working!</p>
        <p>Check your menu bar for the tray icon.</p>
        <p id="status">Checking tray...</p>
        <button onclick="window.close()">Close</button>
        <script>
          setTimeout(() => {
            document.getElementById('status').innerHTML = 
              'Tray should be in your menu bar. Look for 🍅 or a circle icon.';
          }, 1000);
        </script>
      </body>
    </html>
  `);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Try with a real PNG icon
  const iconPath = path.join(__dirname, 'src/assets/icons/idle.png');
  console.log('Loading icon from:', iconPath);
  
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
    console.log('Icon loaded, isEmpty:', icon.isEmpty(), 'size:', icon.getSize());
    
    if (icon.isEmpty()) {
      // Fallback to creating a simple icon
      console.log('Icon was empty, creating fallback...');
      icon = nativeImage.createEmpty();
    }
  } catch (e) {
    console.error('Error loading icon:', e);
    icon = nativeImage.createEmpty();
  }
  
  // Create tray
  tray = new Tray(icon);
  tray.setTitle(' 🍅 25:00');
  tray.setToolTip('Pomodoro Timer - Click me!');
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Pomodoro Timer', enabled: false },
    { type: 'separator' },
    { label: 'Start Focus', click: () => console.log('Start clicked') },
    { label: 'Take Break', click: () => console.log('Break clicked') },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    console.log('Tray clicked!');
    if (mainWindow) {
      mainWindow.show();
    } else {
      createWindow();
    }
  });
  
  console.log('Tray created successfully');
  console.log('Tray bounds:', tray.getBounds());
}

app.whenReady().then(() => {
  console.log('=== Electron App Ready ===');
  console.log('Platform:', process.platform);
  console.log('Electron version:', process.versions.electron);
  console.log('macOS version:', process.getSystemVersion?.() || 'unknown');
  
  createTray();
  createWindow();
  
  console.log('=== Setup Complete ===');
  console.log('Look for the tray in your menu bar!');
});

app.on('window-all-closed', () => {
  // Don't quit on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
