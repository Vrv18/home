// Main entry point for Pomodoro Menu Bar App
// Using simple Tray approach for reliability

import { app, Tray, Menu, nativeImage, Notification, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import { PomodoroTimer } from './timer';
import { TimerStatus, Session, BreakType } from './types';
import { getLast7DaysStats, getSettings, updateSettings } from './store';

let tray: Tray | null = null;
let window: BrowserWindow | null = null;
let timer: PomodoroTimer;

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get icon file path for state
function getIconPath(state: string): string {
  const iconsDir = path.join(__dirname, '../../src/assets/icons');
  let iconName: string;
  
  switch (state) {
    case 'focus':
      iconName = 'focus';
      break;
    case 'break':
      iconName = 'break';
      break;
    case 'paused':
      iconName = 'paused';
      break;
    default:
      iconName = 'idle';
  }
  
  return path.join(iconsDir, `${iconName}.png`);
}

// Load icon for state
function getIconForState(state: string): Electron.NativeImage {
  const iconPath = getIconPath(state);
  const img = nativeImage.createFromPath(iconPath);
  // Resize to 22x22 for macOS menu bar
  const resized = img.resize({ width: 22, height: 22 });
  resized.setTemplateImage(true);
  return resized;
}

// Update tray with current status
function updateTray(status: TimerStatus): void {
  if (!tray) return;

  try {
    const icon = getIconForState(status.state);
    tray.setImage(icon);

    // Set title (shows next to icon in menu bar)
    if (status.state === 'idle') {
      tray.setTitle('');
    } else {
      tray.setTitle(` ${formatTime(status.remainingSeconds)}`);
    }
  } catch (error) {
    console.error('Error updating tray:', error);
  }
}

// Create the popup window
function createWindow(): void {
  if (window) {
    window.show();
    return;
  }

  const indexPath = path.join(__dirname, '../../src/renderer/index.html');
  
  window = new BrowserWindow({
    width: 320,
    height: 420,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.loadFile(indexPath);

  window.on('blur', () => {
    window?.hide();
  });

  window.on('closed', () => {
    window = null;
  });
}

// Position and show window near tray
function toggleWindow(): void {
  if (!tray) return;

  if (window && window.isVisible()) {
    window.hide();
    return;
  }

  createWindow();

  // Position window below tray icon
  const trayBounds = tray.getBounds();
  const windowBounds = window!.getBounds();
  
  // Center window horizontally under tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  // Position below tray
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  window!.setPosition(x, y, false);
  window!.show();
  window!.focus();
  
  // Send current status to renderer
  window!.webContents.send('timer-tick', timer.getStatus());
}

// Show notification
function showNotification(title: string, body: string): void {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      silent: false,
    });
    notification.show();
  }
}

// Setup IPC handlers
function setupIPC(): void {
  ipcMain.handle('get-status', () => timer.getStatus());
  ipcMain.handle('get-stats', () => getLast7DaysStats());
  ipcMain.handle('get-settings', () => getSettings());
  
  ipcMain.handle('start-focus', () => {
    timer.startFocus();
    return timer.getStatus();
  });

  ipcMain.handle('start-break', (_, type: BreakType) => {
    timer.startBreak(type);
    return timer.getStatus();
  });

  ipcMain.handle('pause', () => {
    timer.pause();
    return timer.getStatus();
  });

  ipcMain.handle('resume', () => {
    timer.resume();
    return timer.getStatus();
  });

  ipcMain.handle('forfeit', (_, reason?: string) => {
    timer.forfeit(reason);
    return timer.getStatus();
  });

  ipcMain.handle('reset', () => {
    timer.reset();
    return timer.getStatus();
  });

  ipcMain.handle('update-settings', (_, settings) => {
    const updated = updateSettings(settings);
    timer.reloadSettings();
    return updated;
  });

  ipcMain.handle('get-next-break-type', () => timer.getNextBreakType());
  
  ipcMain.handle('quit-app', () => {
    app.quit();
  });
}

// Create the app
function createApp(): void {
  console.log('Creating Pomodoro app...');
  
  // Create timer
  timer = new PomodoroTimer();
  console.log('Timer created');

  // Create tray
  const iconPath = getIconPath('idle');
  console.log('Icon path:', iconPath);
  
  const icon = nativeImage.createFromPath(iconPath);
  console.log('Icon loaded, isEmpty:', icon.isEmpty(), 'size:', icon.getSize());
  
  // Resize for menu bar (22x22 is standard for macOS retina)
  const resizedIcon = icon.resize({ width: 22, height: 22 });
  // Mark as template image for proper macOS appearance
  resizedIcon.setTemplateImage(true);
  console.log('Resized icon, isEmpty:', resizedIcon.isEmpty());
  
  tray = new Tray(resizedIcon);
  tray.setToolTip('Pomodoro Timer');
  
  console.log('Tray created');
  console.log('Tray bounds:', tray.getBounds());

  // Set up click handler
  tray.on('click', () => {
    console.log('Tray clicked');
    toggleWindow();
  });
  
  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open', click: () => toggleWindow() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray?.popUpContextMenu(contextMenu);
  });

  // Setup IPC handlers
  setupIPC();

  // Timer events
  timer.on('tick', (status: TimerStatus) => {
    updateTray(status);
    if (window && !window.isDestroyed()) {
      window.webContents.send('timer-tick', status);
    }
  });

  timer.on('stateChange', (status: TimerStatus) => {
    updateTray(status);
    if (window && !window.isDestroyed()) {
      window.webContents.send('timer-state-change', status);
    }
  });

  timer.on('complete', (session: Session) => {
    if (session.type === 'focus') {
      showNotification(
        'Focus Complete! 🪷',
        `Great work! You completed a ${session.duration} minute focus session.`
      );
    } else {
      showNotification(
        'Break Over',
        'Ready to focus again?'
      );
    }
    
    if (window && !window.isDestroyed()) {
      window.webContents.send('session-complete', session);
    }
  });

  timer.on('forfeit', (reason?: string) => {
    if (window && !window.isDestroyed()) {
      window.webContents.send('session-forfeit', reason);
    }
  });

  console.log('Pomodoro app ready!');
  updateTray(timer.getStatus());
}

// App lifecycle
app.whenReady().then(() => {
  console.log('Electron app ready');
  createApp();
});

app.on('window-all-closed', (e: Event) => {
  // Prevent app from quitting when window closes
  e.preventDefault();
});

app.on('before-quit', () => {
  console.log('App quitting');
  timer?.destroy();
});

// Keep app running
app.on('activate', () => {
  if (tray) {
    toggleWindow();
  }
});

// Keep dock icon visible for now (debugging)
// app.dock?.hide();
