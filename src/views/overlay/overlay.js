// Elements
const chatList = document.getElementById('chat-list');
const chatFeed = document.getElementById('chat-feed');
const statusYt = document.getElementById('status-yt');
const statusTt = document.getElementById('status-tt');
const statViewersCount = document.getElementById('stat-viewers-count');
const statLikesCount = document.getElementById('stat-likes-count');

const overlayOpacitySlider = document.getElementById('overlay-opacity-slider');
const overlayOpacityLabel = document.getElementById('overlay-opacity-label');

const btnLock = document.getElementById('btn-lock');
const btnHide = document.getElementById('btn-hide');
const hudToast = document.getElementById('hud-toast');
const hudToastText = document.getElementById('hud-toast-text');

// Active settings state
let isLocked = false;
let soundEnabled = true;
let soundVolume = 0.8;
let soundProfile = 'cyber'; // cyber, arcade, ding, casino, level
let soundOnLock = true;

let ttsEnabled = false;
let ttsFilter = 'highlight'; // all, highlight, mod
let ttsVolume = 0.8;
let ttsRate = 1.0;
let ttsPitch = 1.0;

let overlayTheme = 'cyber';
let bubbleStyle = 'card';
let fontFamily = 'modern';
let platformFilter = 'all';
let minGiftDiamonds = 1;
let blacklistWords = [];
let antiSpam = true;
let maxChatHistory = 150;

let hudTimeout = null;
const recentMessageHashes = new Set();

// ================= AUDIO SYNTHESIZER V5.0 =================
function playHypeAlertSound(volume = 0.8, profile = soundProfile) {
  if (!soundEnabled || volume <= 0) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (profile === 'arcade') {
      // 8-bit retro coin arpeggio
      const notes = [987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22 * volume, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } else if (profile === 'ding') {
      // Clean crystal chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35 * volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    } else if (profile === 'casino') {
      // Coin cascade jackpot
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.25 * volume, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.42);
      });
    } else if (profile === 'level') {
      // Rising electronic sweep
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18 * volume, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.32);
      });
    } else {
      // Default: Cyberpunk fanfare chords
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.3 * volume, now + idx * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.55);
      });
    }
  } catch (e) {
    console.error('Audio synthesizer error:', e);
  }
}

// Subtle Lock Tone (Acoustic feedback on F9 toggle)
function playLockCue(isLocking) {
  if (!soundOnLock) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = isLocking ? 600 : 900;
    const endFreq = isLocking ? 900 : 600;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    // Ignore audio cue errors
  }
}

// ================= IN-GAME TTS (TEXT-TO-SPEECH) ENGINE =================
function speakMessage(text, author, type, isMod) {
  if (!ttsEnabled || !window.speechSynthesis) return;

  // Filter check
  if (ttsFilter === 'highlight' && type !== 'gift' && type !== 'superchat') {
    return;
  }
  if (ttsFilter === 'mod' && !isMod && type !== 'gift' && type !== 'superchat') {
    return;
  }

  try {
    let cleanText = text || '';
    if (type === 'gift') {
      cleanText = `Gift dari ${author}: ${text}`;
    } else if (type === 'superchat') {
      cleanText = `SuperChat dari ${author}: ${text}`;
    } else {
      cleanText = `${author} berkata: ${text}`;
    }

    // Strip URLs or emojis
    cleanText = cleanText.replace(/https?:\/\/\S+/gi, '').replace(/[^\p{L}\p{N}\s,.\?!]/gu, '');
    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = Math.max(0.1, Math.min(1.0, ttsVolume));
    utterance.rate = Math.max(0.7, Math.min(1.5, ttsRate));
    utterance.pitch = Math.max(0.8, Math.min(1.3, ttsPitch));
    utterance.lang = 'id-ID';

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('TTS error:', e);
  }
}

// ================= HUD TOAST NOTIFICATIONS =================
function showHud(text, duration = 2200) {
  if (hudTimeout) clearTimeout(hudTimeout);
  hudToastText.textContent = text;
  hudToast.classList.add('show');
  hudTimeout = setTimeout(() => {
    hudToast.classList.remove('show');
  }, duration);
}

// Apply Lock State
function setLockState(locked, showNotice = true) {
  isLocked = locked;
  playLockCue(locked);

  if (locked) {
    document.body.classList.remove('unlocked');
    document.body.classList.add('locked');
    if (showNotice) {
      showHud('Ghost Mode Aktif (Tembus Klik) - F9 untuk membuka');
    }
  } else {
    document.body.classList.remove('locked');
    document.body.classList.add('unlocked');
    if (showNotice) {
      showHud('Mode Interaktif - Bisa digeser & diubah ukuran');
    }
  }
}

// Set Opacity directly on overlay
function applyOpacity(val) {
  document.documentElement.style.setProperty('--overlay-opacity', val);
  const pct = Math.round(val * 100);
  if (overlayOpacitySlider) overlayOpacitySlider.value = pct;
  if (overlayOpacityLabel) overlayOpacityLabel.textContent = `${pct}%`;
}

// Apply All Settings
function applySettings(settings) {
  if (!settings) return;

  if (settings.opacity !== undefined) {
    applyOpacity(settings.opacity);
  }

  // Theme
  if (settings.overlayTheme) {
    overlayTheme = settings.overlayTheme;
    document.body.classList.remove('theme-cyber', 'theme-obsidian', 'theme-glass', 'theme-gold');
    document.body.classList.add(`theme-${overlayTheme}`);
  }

  // Bubble style
  if (settings.bubbleStyle) {
    bubbleStyle = settings.bubbleStyle;
    document.body.classList.remove('bubble-card', 'bubble-compact', 'bubble-pill');
    document.body.classList.add(`bubble-${bubbleStyle}`);
  }

  // Font Family
  if (settings.fontFamily) {
    fontFamily = settings.fontFamily;
    document.body.classList.remove('font-family-modern', 'font-family-gaming', 'font-family-mono');
    document.body.classList.add(`font-family-${fontFamily}`);
  }

  // Font Size
  if (settings.fontSize) {
    document.body.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
    document.body.classList.add(`font-${settings.fontSize}`);
  }

  if (settings.showTimestamp !== undefined) {
    document.body.classList.toggle('hide-timestamp', !settings.showTimestamp);
  }

  // Audio Engine
  if (settings.soundAlerts !== undefined) soundEnabled = settings.soundAlerts;
  if (settings.soundVolume !== undefined) soundVolume = settings.soundVolume;
  if (settings.soundProfile) soundProfile = settings.soundProfile;
  if (settings.soundOnLock !== undefined) soundOnLock = settings.soundOnLock;

  // TTS
  if (settings.ttsEnabled !== undefined) ttsEnabled = settings.ttsEnabled;
  if (settings.ttsFilter) ttsFilter = settings.ttsFilter;
  if (settings.ttsVolume !== undefined) ttsVolume = settings.ttsVolume;
  if (settings.ttsRate !== undefined) ttsRate = settings.ttsRate;
  if (settings.ttsPitch !== undefined) ttsPitch = settings.ttsPitch;

  // Moderation & Filter
  if (settings.platformFilter) platformFilter = settings.platformFilter;
  if (settings.minGiftDiamonds !== undefined) minGiftDiamonds = settings.minGiftDiamonds;
  if (settings.antiSpam !== undefined) antiSpam = settings.antiSpam;
  if (settings.maxChatHistory !== undefined) maxChatHistory = settings.maxChatHistory;

  if (settings.blacklistWords !== undefined) {
    blacklistWords = settings.blacklistWords
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Profanity / Blacklist Filter
function filterText(text) {
  if (!text || blacklistWords.length === 0) return escapeHtml(text);
  let sanitized = text;
  blacklistWords.forEach(badWord => {
    const reg = new RegExp('\\b' + badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    sanitized = sanitized.replace(reg, '***');
  });
  return escapeHtml(sanitized);
}

// Format numbers (e.g. 1500 -> 1.5K)
function formatCompactNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

// Helper: Build User Avatar HTML
function buildAvatarHtml(author, platform) {
  const authorName = author && author.name ? author.name : 'User';
  const avatarUrl = author && author.avatar ? author.avatar : '';
  const initialLetter = escapeHtml((authorName || 'U').charAt(0).toUpperCase());

  if (avatarUrl) {
    return `
      <div class="avatar-box">
        <img 
          src="${escapeHtml(avatarUrl)}" 
          class="avatar-img" 
          alt="${escapeHtml(authorName)}" 
          referrerpolicy="no-referrer"
          onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" 
        />
        <span class="avatar-fallback ${platform}" style="display:none;">${initialLetter}</span>
      </div>
    `;
  }
  return `
    <div class="avatar-box">
      <span class="avatar-fallback ${platform}">${initialLetter}</span>
    </div>
  `;
}

// ================= MESSAGE RENDER PIPELINE =================
function appendMessage(item) {
  const platform = item.platform || 'youtube';

  // 1. Platform Filter
  if (platformFilter !== 'all' && platformFilter !== platform) {
    return;
  }

  // 2. Anti-Spam Duplicate Filter (Only applies to normal chat)
  if (antiSpam && item.type === 'chat' && item.message) {
    const hash = `${platform}_${item.author ? item.author.name : ''}_${item.message}`.toLowerCase();
    if (recentMessageHashes.has(hash)) {
      return; // Filter duplicate identical chat
    }
    recentMessageHashes.add(hash);
    setTimeout(() => recentMessageHashes.delete(hash), 4000);
  }

  const isScrolledToBottom =
    chatFeed.scrollHeight - chatFeed.clientHeight <= chatFeed.scrollTop + 60;

  const itemEl = document.createElement('div');
  const authorName = escapeHtml(item.author ? item.author.name : 'Penonton');
  const timestamp = escapeHtml(item.timestamp || '');
  const inlineBadge = platform === 'youtube' ? ICONS.youtubeInline : ICONS.tiktokInline;
  const avatarHtml = buildAvatarHtml(item.author, platform);

  // Trigger In-Game TTS
  speakMessage(
    item.message, 
    item.author ? item.author.name : 'User', 
    item.type, 
    item.author && (item.author.isModerator || item.author.isOwner)
  );

  // Case 1: Transient Events (Likes, Joins, Follows) - Auto disappears smoothly without collision
  if (item.type === 'transient') {
    itemEl.className = 'transient-row';
    let iconSvg = ICONS.heart;
    if (item.subtype === 'join') iconSvg = ICONS.viewers;
    if (item.subtype === 'follow') iconSvg = ICONS.info;

    itemEl.innerHTML = `
      <span class="transient-icon">${iconSvg}</span>
      ${avatarHtml}
      <span class="inline-platform-badge ${platform}">${inlineBadge}</span>
      <strong class="transient-author">${authorName}</strong>
      <span class="transient-msg">${escapeHtml(item.message || '')}</span>
    `;

    chatList.appendChild(itemEl);

    // Auto-remove after 3.8s with smooth CSS fade-out to prevent collision
    setTimeout(() => {
      itemEl.classList.add('fade-out');
      setTimeout(() => {
        if (itemEl.parentNode) {
          itemEl.parentNode.removeChild(itemEl);
        }
      }, 400);
    }, 3800);

    if (isScrolledToBottom) chatFeed.scrollTop = chatFeed.scrollHeight;
    return;
  }

  // Case 2: TikTok Gift (HYPE ALERT)
  if (item.type === 'gift') {
    const giftName = escapeHtml(item.gift ? item.gift.name : 'Gift');
    const giftCount = item.gift ? item.gift.count : 1;
    const diamondCount = item.gift ? item.gift.diamondCount : 0;

    // Check minimum diamond threshold
    const isMega = diamondCount >= minGiftDiamonds;

    if (isMega) {
      itemEl.className = 'hype-gift-card';
      const giftIcon = item.gift && item.gift.icon 
        ? `<img src="${escapeHtml(item.gift.icon)}" class="hype-gift-img" alt="${giftName}" />`
        : ICONS.gift;

      itemEl.innerHTML = `
        <div class="hype-gift-header">
          <div class="hype-sender-group">
            ${avatarHtml}
            <span class="inline-platform-badge tt">${inlineBadge}</span>
            <span class="hype-sender">${authorName}</span>
          </div>
          <span class="hype-banner-badge">TIKTOK GIFT</span>
        </div>
        <div class="hype-gift-body">
          <div class="hype-gift-icon-wrapper">
            ${giftIcon}
          </div>
          <div class="hype-gift-info">
            <span class="hype-gift-title">${giftName}</span>
            <span class="hype-gift-count">x${giftCount}</span>
            ${diamondCount > 0 ? `<span class="hype-gift-diamonds">${diamondCount} Diamonds</span>` : ''}
          </div>
        </div>
      `;

      playHypeAlertSound(soundVolume, soundProfile);
    } else {
      // Render as compact gift message
      itemEl.className = 'chat-row gift-compact';
      itemEl.innerHTML = `
        ${avatarHtml}
        <div class="chat-content-wrap">
          <span class="msg-time">${timestamp}</span>
          <span class="inline-platform-badge tt">${inlineBadge}</span>
          <strong class="author-name tt">${authorName}:</strong>
          <span class="msg-gift-compact">🎁 ${giftName} x${giftCount}</span>
        </div>
      `;
    }
  }
  // Case 3: YouTube SuperChat (HYPE ALERT)
  else if (item.type === 'superchat') {
    itemEl.className = 'hype-superchat-card';
    const amount = escapeHtml(item.superchat ? item.superchat.amount : '$10.00');
    const msg = filterText(item.message || '');

    itemEl.innerHTML = `
      <div class="hype-sc-header">
        <div class="hype-sender-group">
          ${avatarHtml}
          <span class="inline-platform-badge yt">${inlineBadge}</span>
          <span class="hype-sender">${authorName}</span>
        </div>
        <span class="hype-sc-amount">${amount}</span>
      </div>
      ${msg ? `<div class="hype-sc-msg">${msg}</div>` : ''}
    `;

    playHypeAlertSound(soundVolume, soundProfile);
  }
  // Case 4: Standard Chat Message
  else {
    itemEl.className = 'chat-row';
    const authorClass = platform === 'youtube' ? 'yt' : 'tt';
    const badgeHtml = item.author && item.author.isMember ? '<span class="author-badge member">MEMBER</span>' : '';
    const modHtml = item.author && item.author.isModerator ? '<span class="author-badge mod">MOD</span>' : '';
    const msgText = filterText(item.message || '');

    itemEl.innerHTML = `
      ${avatarHtml}
      <div class="chat-content-wrap">
        <span class="msg-time">${timestamp}</span>
        <span class="inline-platform-badge ${platform}">${inlineBadge}</span>
        ${badgeHtml}${modHtml}
        <strong class="author-name ${authorClass}">${authorName}:</strong>
        <span class="msg-text">${msgText}</span>
      </div>
    `;
  }

  chatList.appendChild(itemEl);

  // Keep DOM lean according to maxChatHistory
  while (chatList.children.length > maxChatHistory) {
    chatList.removeChild(chatList.firstChild);
  }

  if (isScrolledToBottom) {
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }
}

// Update Platform Connection Indicator Chips in Header
function updatePlatformStatus(statusData) {
  if (statusData.platform === 'youtube') {
    if (statusData.status === 'connected') {
      statusYt.classList.replace('offline', 'online');
      statusYt.classList.remove('reconnecting');
      statusYt.title = 'YouTube Live: Online';
    } else if (statusData.status === 'reconnecting') {
      statusYt.classList.add('reconnecting');
      statusYt.title = `YouTube: ${statusData.message || 'Mencoba Reconnect...'}`;
      showHud(`YouTube: Reconnecting (${statusData.attempt}/${statusData.maxAttempts})...`);
    } else {
      statusYt.classList.remove('online', 'reconnecting');
      statusYt.classList.add('offline');
      statusYt.title = 'YouTube Live: Offline';
    }
  } else if (statusData.platform === 'tiktok') {
    if (statusData.status === 'connected') {
      statusTt.classList.replace('offline', 'online');
      statusTt.classList.remove('reconnecting');
      statusTt.title = 'TikTok LIVE: Online';
    } else if (statusData.status === 'reconnecting') {
      statusTt.classList.add('reconnecting');
      statusTt.title = `TikTok: ${statusData.message || 'Mencoba Reconnect...'}`;
      showHud(`TikTok: Reconnecting (${statusData.attempt}/${statusData.maxAttempts})...`);
    } else {
      statusTt.classList.remove('online', 'reconnecting');
      statusTt.classList.add('offline');
      statusTt.title = 'TikTok LIVE: Offline';
    }
  }
}

// Direct Opacity Slider Handler
if (overlayOpacitySlider) {
  overlayOpacitySlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) / 100;
    applyOpacity(val);
    window.api.updateSettings({ opacity: val });
  });
}

// Button Events
if (btnLock) {
  btnLock.addEventListener('click', () => {
    window.api.toggleOverlayLock();
  });
}

if (btnHide) {
  btnHide.addEventListener('click', () => {
    window.api.hideOverlay();
  });
}

// ================= IPC LISTENERS =================
window.api.onChatMessage((msg) => {
  appendMessage(msg);
});

window.api.onStatusUpdate((status) => {
  updatePlatformStatus(status);
});

window.api.onStreamStats((stats) => {
  if (stats.viewers !== undefined && statViewersCount) {
    statViewersCount.textContent = formatCompactNumber(stats.viewers);
  }
  if (stats.likes !== undefined && statLikesCount) {
    statLikesCount.textContent = formatCompactNumber(stats.likes);
  }
});

window.api.onOverlayLockChanged((locked) => {
  setLockState(locked);
});

window.api.onSettingsChanged((newSettings) => {
  applySettings(newSettings);
});

window.api.onClearChat(() => {
  chatList.innerHTML = `
    <div class="chat-row notice-row">
      <div class="notice-box">
        Chat feed dibersihkan oleh streamer.
      </div>
    </div>
  `;
});

// Initialize on Load
window.addEventListener('DOMContentLoaded', async () => {
  const currentLock = await window.api.getOverlayLockState();
  setLockState(currentLock, false);

  const initialSettings = await window.api.getSettings();
  applySettings(initialSettings);
});
