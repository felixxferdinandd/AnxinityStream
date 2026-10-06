const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const defaultSettings = {
  opacity: 0.70,
  fontSize: 'md',
  showTimestamp: true,
  soundAlerts: true,
  soundVolume: 0.8,
  alwaysOnTop: true,
  lastYoutubeInput: '',
  lastTiktokUsername: '',
  tiktokSignApiKey: '',
  showTransients: true, // Auto-disappearing like / follow / join notifications
  overlayWidth: 380,
  overlayHeight: 580,
  overlayX: null,
  overlayY: null
};

class Storage {
  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'stream-helper-settings.json');
    this.settings = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return { ...defaultSettings, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed to load settings file, using defaults', e);
    }
    return { ...defaultSettings };
  }

  get() {
    return this.settings;
  }

  update(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save settings file', e);
    }
    return this.settings;
  }
}

module.exports = Storage;
