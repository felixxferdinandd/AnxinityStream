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

let isLocked = false;
let soundEnabled = true;
let soundVolume = 0.8;
let hudTimeout = null;

// Audio Chime / Fanfare Synthesizer (Web Audio API)
function playHypeAlertSound(volume = 0.8) {
  if (!soundEnabled || volume <= 0) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Fanfare chords: E5, G#5, B5, E6 with sparkling harmonics
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
  } catch (e) {
    console.error('Audio synthesizer error:', e);
  }
}

// Show HUD toast notification
function showHud(text) {
  if (hudTimeout) clearTimeout(hudTimeout);
  hudToastText.textContent = text;
  hudToast.classList.add('show');
  hudTimeout = setTimeout(() => {
    hudToast.classList.remove('show');
  }, 2200);
}

// Apply Lock State
function setLockState(locked, showNotice = true) {
  isLocked = locked;
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
  overlayOpacitySlider.value = pct;
  overlayOpacityLabel.textContent = `${pct}%`;
}

// Apply all settings
function applySettings(settings) {
  if (!settings) return;

  if (settings.opacity !== undefined) {
    applyOpacity(settings.opacity);
  }

  if (settings.fontSize) {
    document.body.classList.remove('font-sm', 'font-md', 'font-lg');
    document.body.classList.add(`font-${settings.fontSize}`);
  }

  if (settings.showTimestamp !== undefined) {
    document.body.classList.toggle('hide-timestamp', !settings.showTimestamp);
  }

  if (settings.soundAlerts !== undefined) {
    soundEnabled = settings.soundAlerts;
  }

  if (settings.soundVolume !== undefined) {
    soundVolume = settings.soundVolume;
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

// Append Incoming Message / Alert
function appendMessage(item) {
  const isScrolledToBottom =
    chatFeed.scrollHeight - chatFeed.clientHeight <= chatFeed.scrollTop + 60;

  const itemEl = document.createElement('div');
  const platform = item.platform || 'youtube';
  const authorName = escapeHtml(item.author ? item.author.name : 'Penonton');
  const timestamp = escapeHtml(item.timestamp || '');
  const inlineBadge = platform === 'youtube' ? ICONS.youtubeInline : ICONS.tiktokInline;
  const avatarHtml = buildAvatarHtml(item.author, platform);

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
    itemEl.className = 'hype-gift-card';
    const giftName = escapeHtml(item.gift ? item.gift.name : 'Gift');
    const giftCount = item.gift ? item.gift.count : 1;
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
        </div>
      </div>
    `;

    playHypeAlertSound(soundVolume);
  }
  // Case 3: YouTube SuperChat (HYPE ALERT)
  else if (item.type === 'superchat') {
    itemEl.className = 'hype-superchat-card';
    const amount = escapeHtml(item.superchat ? item.superchat.amount : '$10.00');
    const msg = escapeHtml(item.message || '');

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

    playHypeAlertSound(soundVolume);
  }
  // Case 4: Standard Chat Message
  else {
    itemEl.className = 'chat-row';
    const authorClass = platform === 'youtube' ? 'yt' : 'tt';
    const badgeHtml = item.author && item.author.isMember ? '<span class="author-badge">MEMBER</span>' : '';
    const modHtml = item.author && item.author.isModerator ? '<span class="author-badge">MOD</span>' : '';
    const msgText = escapeHtml(item.message || '');

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

  // Keep DOM lean
  while (chatList.children.length > 150) {
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
    } else {
      statusYt.classList.replace('online', 'offline');
    }
  } else if (statusData.platform === 'tiktok') {
    if (statusData.status === 'connected') {
      statusTt.classList.replace('offline', 'online');
    } else {
      statusTt.classList.replace('online', 'offline');
    }
  }
}

// Update Stream Stats (Viewers, Likes)
function updateStats(stats) {
  if (stats.viewers !== undefined) {
    statViewersCount.textContent = formatCompactNumber(stats.viewers);
  }
  if (stats.likes !== undefined) {
    statLikesCount.textContent = formatCompactNumber(stats.likes);
  }
}

// Opacity Slider directly on Overlay Header
overlayOpacitySlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  applyOpacity(val / 100);
  window.api.updateSettings({ opacity: val / 100 });
});

// Lock Button Click
btnLock.addEventListener('click', async () => {
  await window.api.toggleOverlayLock(true);
});

// Hide Button Click
btnHide.addEventListener('click', () => {
  window.api.hideOverlay();
});

// Clear chat event
window.api.onClearChat(() => {
  chatList.innerHTML = '';
});

// IPC Listeners
window.api.onChatMessage((msg) => {
  appendMessage(msg);
});

window.api.onStatusUpdate((status) => {
  updatePlatformStatus(status);
});

window.api.onStreamStats((stats) => {
  updateStats(stats);
});

window.api.onOverlayLockChanged((locked) => {
  setLockState(locked, true);
});

window.api.onSettingsChanged((settings) => {
  applySettings(settings);
});

// Initialize
async function init() {
  try {
    const settings = await window.api.getSettings();
    applySettings(settings);

    const initialLock = await window.api.getOverlayLockState();
    setLockState(initialLock, false);
  } catch (err) {
    console.error('Failed to init overlay:', err);
  }
}

init();
