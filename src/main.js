const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');
const Storage = require('./services/storage');
const YoutubeService = require('./services/youtubeService');
const TiktokService = require('./services/tiktokService');

// Restrict to single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let controlWindow = null;
let overlayWindow = null;
let storage = null;
let youtubeService = null;
let tiktokService = null;
let isOverlayLocked = false; // Ghost mode / click-through

function createControlWindow() {
  controlWindow = new BrowserWindow({
    width: 980,
    height: 730,
    minWidth: 860,
    minHeight: 620,
    title: 'AnxinityStream v5.0.0 - Broadcast Mega Studio',
    backgroundColor: '#070b12',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  controlWindow.loadFile(path.join(__dirname, 'views', 'control', 'control.html'));

  controlWindow.once('ready-to-show', () => {
    controlWindow.show();
  });

  controlWindow.on('closed', () => {
    controlWindow = null;
    // If control window is closed, close overlay window and quit
    if (overlayWindow) {
      overlayWindow.close();
    }
  });
}

function createOverlayWindow() {
  const settings = storage.get();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;

  const defaultW = settings.overlayWidth || 380;
  const defaultH = settings.overlayHeight || 580;
  const defaultX = settings.overlayX ?? Math.max(20, screenW - defaultW - 30);
  const defaultY = settings.overlayY ?? Math.max(40, Math.floor((screenH - defaultH) / 2));

  overlayWindow = new BrowserWindow({
    width: defaultW,
    height: defaultH,
    x: defaultX,
    y: defaultY,
    minWidth: 260,
    minHeight: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: settings.alwaysOnTop !== false,
    resizable: true,
    hasShadow: false,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    title: 'AnxinityStream Overlay v5.0.0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlayWindow.loadFile(path.join(__dirname, 'views', 'overlay', 'overlay.html'));

  overlayWindow.on('resize', () => {
    if (!overlayWindow) return;
    const [w, h] = overlayWindow.getSize();
    storage.update({ overlayWidth: w, overlayHeight: h });
  });

  overlayWindow.on('move', () => {
    if (!overlayWindow) return;
    const [x, y] = overlayWindow.getPosition();
    storage.update({ overlayX: x, overlayY: y });
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function setOverlayLock(locked) {
  isOverlayLocked = locked;
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    if (isOverlayLocked) {
      // In ghost mode, forward all mouse events to windows underneath
      overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      // Unlocked: interactive and draggable
      overlayWindow.setIgnoreMouseEvents(false);
    }
    overlayWindow.webContents.send('overlay-lock-changed', isOverlayLocked);
  }
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send('overlay-lock-changed', isOverlayLocked);
  }
}

function broadcastToWindows(channel, data) {
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send(channel, data);
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send(channel, data);
  }
}

function registerHotkeys() {
  try {
    globalShortcut.register('F9', () => {
      setOverlayLock(!isOverlayLocked);
    });
    // Fallback shortcut Ctrl+F9
    globalShortcut.register('CommandOrControl+F9', () => {
      setOverlayLock(!isOverlayLocked);
    });
  } catch (err) {
    console.error('Failed to register global shortcut:', err);
  }
}

app.whenReady().then(() => {
  storage = new Storage();
  youtubeService = new YoutubeService();
  tiktokService = new TiktokService();

  // Forward events from YouTube
  youtubeService.on('status', (data) => broadcastToWindows('status-update', data));
  youtubeService.on('message', (data) => broadcastToWindows('chat-message', data));

  // Forward events from TikTok
  tiktokService.on('status', (data) => broadcastToWindows('status-update', data));
  tiktokService.on('message', (data) => broadcastToWindows('chat-message', data));
  tiktokService.on('stats', (data) => broadcastToWindows('stream-stats', data));
  tiktokService.on('health', (data) => broadcastToWindows('stream-health', data));

  createControlWindow();
  createOverlayWindow();
  registerHotkeys();

  // Handle second instance request
  app.on('second-instance', () => {
    if (controlWindow) {
      if (controlWindow.isMinimized()) controlWindow.restore();
      controlWindow.focus();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('connect-youtube', async (event, target) => {
  storage.update({ lastYoutubeInput: target });
  return await youtubeService.connect(target);
});

ipcMain.handle('disconnect-youtube', async () => {
  await youtubeService.disconnect();
  return true;
});

ipcMain.handle('connect-tiktok', async (event, username, apiKey) => {
  const currentSettings = storage.get();
  const effectiveKey = apiKey !== undefined ? apiKey : (currentSettings.tiktokSignApiKey || '');
  storage.update({ lastTiktokUsername: username, tiktokSignApiKey: effectiveKey });
  return await tiktokService.connect(username, effectiveKey);
});

ipcMain.handle('disconnect-tiktok', async () => {
  await tiktokService.disconnect();
  return true;
});

ipcMain.handle('toggle-overlay-lock', (event, locked) => {
  const nextState = typeof locked === 'boolean' ? locked : !isOverlayLocked;
  setOverlayLock(nextState);
  return isOverlayLocked;
});

ipcMain.handle('get-overlay-lock-state', () => isOverlayLocked);

ipcMain.handle('show-overlay', () => {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlayWindow();
  } else {
    overlayWindow.show();
  }
  return true;
});

ipcMain.handle('hide-overlay', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
  }
  return true;
});

ipcMain.handle('get-settings', () => {
  return storage.get();
});

ipcMain.handle('update-settings', (event, newSettings) => {
  const updated = storage.update(newSettings);
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    if (typeof updated.alwaysOnTop === 'boolean') {
      overlayWindow.setAlwaysOnTop(updated.alwaysOnTop);
    }
  }
  broadcastToWindows('settings-changed', updated);
  return updated;
});

ipcMain.handle('simulate-event', (event, eventData) => {
  broadcastToWindows('chat-message', eventData);
  return true;
});

ipcMain.handle('clear-chat', () => {
  broadcastToWindows('clear-chat');
  return true;
});

ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});
