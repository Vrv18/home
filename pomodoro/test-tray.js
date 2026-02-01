// Minimal test to see if tray works
const { app, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let tray = null;

app.whenReady().then(() => {
  console.log('App ready');
  
  // Try creating a simple 1x1 transparent image
  const icon = nativeImage.createEmpty();
  console.log('Empty icon created');
  
  // Create tray with empty icon
  tray = new Tray(icon);
  console.log('Tray created');
  
  // Set title to show text in menu bar
  tray.setTitle('🍅 25:00');
  console.log('Title set');
  
  // Set tooltip
  tray.setToolTip('Pomodoro Timer');
  
  // Set context menu
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Test Item', type: 'normal' },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setContextMenu(contextMenu);
  
  console.log('Tray bounds:', tray.getBounds());
  console.log('Test complete - check your menu bar for "🍅 25:00"');
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
