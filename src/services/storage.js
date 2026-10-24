const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const defaultSettings = {
  // Visual & Overlay
  opacity: 0.75,
  fontSize: 'md', // sm, md, lg, xl
  fontFamily: 'modern', // modern, gaming, mono
  overlayTheme: 'cyber', // cyber, obsidian, glass, gold
  bubbleStyle: 'card', // card, compact, pill
  showTimestamp: true,
  alwaysOnTop: true,
  showTransients: true, // Likes, shares, joins
  platformFilter: 'all', // all, youtube, tiktok
  maxChatHistory: 150,

  // Audio Engine
  soundAlerts: true,
  soundVolume: 0.8,
  soundProfile: 'cyber', // cyber, arcade, ding, casino, level
  soundOnLock: true, // Audio cue on F9 ghost mode toggle

  // Text-To-Speech (TTS) Voice Engine
  ttsEnabled: false,
  ttsFilter: 'highlight', // all, highlight (superchats/gifts), mod
  ttsVolume: 0.8,
  ttsRate: 1.0,
  ttsPitch: 1.0,

  // Moderation & Filters
  antiSpam: true,
  blacklistWords: '',
  minGiftDiamonds: 1,

  // Connection Resilience
  autoReconnect: true,
  lastYoutubeInput: '',
  lastTiktokUsername: '',

  // Overlay Dimensions & Position
  overlayWidth: 380,
  overlayHeight: 580,
  overlayX: null,
  overlayY: null
};

class Storage {
  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'anxinity-stream-settings-v5.json');
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
