const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Connection commands
  connectYoutube: (target) => ipcRenderer.invoke('connect-youtube', target),
  disconnectYoutube: () => ipcRenderer.invoke('disconnect-youtube'),
  connectTiktok: (username, apiKey) => ipcRenderer.invoke('connect-tiktok', username, apiKey),
  disconnectTiktok: () => ipcRenderer.invoke('disconnect-tiktok'),

  // Overlay management
  toggleOverlayLock: (locked) => ipcRenderer.invoke('toggle-overlay-lock', locked),
  getOverlayLockState: () => ipcRenderer.invoke('get-overlay-lock-state'),
  showOverlay: () => ipcRenderer.invoke('show-overlay'),
  hideOverlay: () => ipcRenderer.invoke('hide-overlay'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

  // Simulation & Debug
  simulateEvent: (eventData) => ipcRenderer.invoke('simulate-event', eventData),
  clearChat: () => ipcRenderer.invoke('clear-chat'),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Event Listeners
  onChatMessage: (callback) => {
    const handler = (event, msg) => callback(msg);
    ipcRenderer.on('chat-message', handler);
    return () => ipcRenderer.removeListener('chat-message', handler);
  },

  onStatusUpdate: (callback) => {
    const handler = (event, status) => callback(status);
    ipcRenderer.on('status-update', handler);
    return () => ipcRenderer.removeListener('status-update', handler);
  },

  onStreamStats: (callback) => {
    const handler = (event, stats) => callback(stats);
    ipcRenderer.on('stream-stats', handler);
    return () => ipcRenderer.removeListener('stream-stats', handler);
  },

  onOverlayLockChanged: (callback) => {
    const handler = (event, isLocked) => callback(isLocked);
    ipcRenderer.on('overlay-lock-changed', handler);
    return () => ipcRenderer.removeListener('overlay-lock-changed', handler);
  },

  onSettingsChanged: (callback) => {
    const handler = (event, settings) => callback(settings);
    ipcRenderer.on('settings-changed', handler);
    return () => ipcRenderer.removeListener('settings-changed', handler);
  },

  onClearChat: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('clear-chat', handler);
    return () => ipcRenderer.removeListener('clear-chat', handler);
  },

  onStreamHealth: (callback) => {
    const handler = (event, health) => callback(health);
    ipcRenderer.on('stream-health', handler);
    return () => ipcRenderer.removeListener('stream-health', handler);
  }
});
