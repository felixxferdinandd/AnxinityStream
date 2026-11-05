// Inject Icons
document.getElementById('brand-logo-slot').innerHTML = ICONS.anxinity;
document.getElementById('wifi-icon-slot').innerHTML = ICONS.wifi;
document.getElementById('settings-icon-slot').innerHTML = ICONS.settings;
document.getElementById('viewers-icon-slot').innerHTML = ICONS.viewers;
document.getElementById('likes-icon-slot').innerHTML = ICONS.heart;
document.getElementById('clock-icon-slot').innerHTML = ICONS.clock;
document.getElementById('trash-icon-slot').innerHTML = ICONS.trash;

// Elements
const chatFeedContainer = document.getElementById('chat-feed-container');
const chatFeedList = document.getElementById('chat-feed-list');
const btnJumpLatest = document.getElementById('btn-jump-latest');

const metricViewersCount = document.getElementById('metric-viewers-count');
const metricLikesCount = document.getElementById('metric-likes-count');
const metricUptimeCount = document.getElementById('metric-uptime-count');
const metricStatusPill = document.getElementById('metric-status-pill');
const metricStatusText = document.getElementById('metric-status-text');

// Connection Drawer Elements
const btnToggleConnect = document.getElementById('btn-toggle-connect');
const connectionDrawer = document.getElementById('connection-drawer');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const connTabs = document.querySelectorAll('.conn-tab');
const connPanels = document.querySelectorAll('.conn-panel');
const inputPcIp = document.getElementById('input-pc-ip');
const btnConnectPc = document.getElementById('btn-connect-pc');

const inputDirectTt = document.getElementById('input-direct-tt');
const btnConnectTtDirect = document.getElementById('btn-connect-tt-direct');
const inputDirectYt = document.getElementById('input-direct-yt');
const btnConnectYtDirect = document.getElementById('btn-connect-yt-direct');

// Filter Pills
const filterPills = document.querySelectorAll('.filter-pill');

// Settings Elements
const btnOpenSettings = document.getElementById('btn-open-settings');
const settingsModal = document.getElementById('settings-modal');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnSaveSettings = document.getElementById('btn-save-settings');
const toggleWakelock = document.getElementById('toggle-wakelock');
const toggleVibration = document.getElementById('toggle-vibration');
const toggleSound = document.getElementById('toggle-sound');
const toggleTts = document.getElementById('toggle-tts');

// Font Stepper
const btnFontDecrease = document.getElementById('btn-font-decrease');
const btnFontIncrease = document.getElementById('btn-font-increase');
const currentFontLabel = document.getElementById('current-font-label');
const btnClearFeed = document.getElementById('btn-clear-feed');

// App State
let activeFilter = 'all';
let socket = null;
let isConnected = false;
let sessionStartTime = null;
let uptimeInterval = null;
let userScrolledUp = false;

const fontSizes = [
  { id: 'normal', label: 'Normal (14px)', class: 'font-size-normal' },
  { id: 'large', label: 'Besar (18px)', class: 'font-size-large' },
  { id: 'xlarge', label: 'Ekstra (22px)', class: 'font-size-xlarge' },
  { id: 'giant', label: 'Raksasa (26px)', class: 'font-size-giant' }
];
let currentFontIndex = 1; // Default: large (18px)

// Settings State
let settings = {
  wakelock: true,
  vibration: true,
  sound: true,
  tts: false,
  pcIp: '192.168.1.5:19890'
};

// ================= LOAD SAVED SETTINGS =================
function loadSettings() {
  try {
    const saved = localStorage.getItem('anxinity_mobile_settings');
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };
    }
    const savedFont = localStorage.getItem('anxinity_mobile_font_idx');
    if (savedFont !== null) {
      currentFontIndex = parseInt(savedFont, 10) || 1;
    }
  } catch (e) {}

  applyFontSize();
  toggleWakelock.checked = settings.wakelock;
  toggleVibration.checked = settings.vibration;
  toggleSound.checked = settings.sound;
  toggleTts.checked = settings.tts;
  if (settings.pcIp) inputPcIp.value = settings.pcIp;

  applyWakelock(settings.wakelock);
}

function saveSettings() {
  settings.wakelock = toggleWakelock.checked;
  settings.vibration = toggleVibration.checked;
  settings.sound = toggleSound.checked;
  settings.tts = toggleTts.checked;
  settings.pcIp = inputPcIp.value.trim();

  try {
    localStorage.setItem('anxinity_mobile_settings', JSON.stringify(settings));
    localStorage.setItem('anxinity_mobile_font_idx', currentFontIndex);
  } catch (e) {}

  applyWakelock(settings.wakelock);
  if (window.AndroidBridge) {
    window.AndroidBridge.showToast('Pengaturan berhasil disimpan');
  }
}

// Apply Wakelock (Keep Screen On)
function applyWakelock(enable) {
  if (window.AndroidBridge) {
    window.AndroidBridge.setKeepScreenOn(enable);
  }
  if ('wakeLock' in navigator && enable) {
    navigator.wakeLock.request('screen').catch(() => {});
  }
}

// Trigger Mobile Vibration
function triggerVibrate(ms = 180) {
  if (!settings.vibration) return;
  if (window.AndroidBridge) {
    window.AndroidBridge.vibrate(ms);
  } else if ('vibrate' in navigator) {
    navigator.vibrate(ms);
  }
}

// Play Audio Chime
function playAlertChime() {
  if (!settings.sound) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.55);
    });
  } catch (e) {}
}

// Text-To-Speech
function speakGiftText(text) {
  if (!settings.tts || !('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

// Apply Font Size
function applyFontSize() {
  fontSizes.forEach(f => document.body.classList.remove(f.class));
  const current = fontSizes[currentFontIndex];
  document.body.classList.add(current.class);
  currentFontLabel.textContent = current.id.toUpperCase();
}

btnFontDecrease.addEventListener('click', () => {
  if (currentFontIndex > 0) {
    currentFontIndex--;
    applyFontSize();
    localStorage.setItem('anxinity_mobile_font_idx', currentFontIndex);
  }
});

btnFontIncrease.addEventListener('click', () => {
  if (currentFontIndex < fontSizes.length - 1) {
    currentFontIndex++;
    applyFontSize();
    localStorage.setItem('anxinity_mobile_font_idx', currentFontIndex);
  }
});

// Clear Chat
btnClearFeed.addEventListener('click', () => {
  chatFeedList.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-title">Layar Dibersihkan</div>
      <div class="welcome-body">Komentar baru akan muncul di sini secara otomatis.</div>
    </div>
  `;
});

// ================= SESSION UPTIME CLOCK =================
function startUptimeClock() {
  if (uptimeInterval) return;
  sessionStartTime = Date.now();
  uptimeInterval = setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - sessionStartTime) / 1000);
    const hrs = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    metricUptimeCount.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function stopUptimeClock() {
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
    uptimeInterval = null;
  }
}

// Format numbers
function formatCompactNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
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

// Avatar Builder
function buildAvatarHtml(author, platform) {
  const authorName = author && author.name ? author.name : 'User';
  const avatarUrl = author && author.avatar ? author.avatar : '';
  const initialLetter = escapeHtml((authorName || 'U').charAt(0).toUpperCase());

  if (avatarUrl) {
    return `
      <div class="m-avatar-box">
        <img 
          src="${escapeHtml(avatarUrl)}" 
          class="m-avatar-img" 
          alt="${escapeHtml(authorName)}" 
          referrerpolicy="no-referrer"
          onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" 
        />
        <span class="m-avatar-fallback ${platform}" style="display:none;">${initialLetter}</span>
      </div>
    `;
  }
  return `
    <div class="m-avatar-box">
      <span class="m-avatar-fallback ${platform}">${initialLetter}</span>
    </div>
  `;
}

// ================= CHAT MESSAGE INGESTION & RENDERING =================
function appendChatMessage(item) {
  const platform = item.platform || 'youtube';
  const authorName = escapeHtml(item.author ? item.author.name : 'Penonton');
  const timestamp = escapeHtml(item.timestamp || '');
  const inlineBadge = platform === 'youtube' ? ICONS.youtubeInline : ICONS.tiktokInline;
  const avatarHtml = buildAvatarHtml(item.author, platform);

  const row = document.createElement('div');
  row.dataset.platform = platform;
  row.dataset.type = item.type;

  // Case 1: Transient Interactions (TikTok Likes, Joins, Follows, Shares)
  if (item.type === 'transient') {
    row.className = 'm-transient-row';
    let iconSvg = ICONS.heart;
    let actionDesc = escapeHtml(item.message || '');

    if (item.subtype === 'join') {
      iconSvg = ICONS.viewers;
      actionDesc = 'bergabung ke siaran live';
    } else if (item.subtype === 'follow') {
      actionDesc = 'mulai mengikuti streamer';
    } else if (item.subtype === 'share') {
      actionDesc = 'membagikan siaran live';
    }

    row.innerHTML = `
      <span class="m-transient-icon">${iconSvg}</span>
      <span class="m-transient-author">${authorName}</span>
      <span class="m-transient-action">${actionDesc}</span>
    `;
  }
  // Case 2: TikTok Gift (HYPE ALERT)
  else if (item.type === 'gift') {
    row.className = 'm-gift-card';
    const giftName = escapeHtml(item.gift ? item.gift.name : 'Gift');
    const giftCount = item.gift ? item.gift.count : 1;
    const diamondCount = item.gift ? item.gift.diamondCount : 0;
    const giftIcon = item.gift && item.gift.icon 
      ? `<img src="${escapeHtml(item.gift.icon)}" class="m-gift-img" alt="${giftName}" />`
      : ICONS.gift;

    row.innerHTML = `
      <div class="m-gift-header">
        <span class="m-gift-sender">${inlineBadge} ${authorName}</span>
        <span class="m-gift-pill">TIKTOK GIFT</span>
      </div>
      <div class="m-gift-body">
        <div class="m-gift-icon-box">
          ${giftIcon}
        </div>
        <div class="m-gift-info">
          <span class="m-gift-name">${giftName}</span>
          <span class="m-gift-count">x${giftCount}</span>
          ${diamondCount > 0 ? `<span class="m-gift-diamonds">${diamondCount} Diamonds</span>` : ''}
        </div>
      </div>
    `;

    // Trigger Phone Haptic & Sound
    triggerVibrate(220);
    playAlertChime();
    speakGiftText(`Gift dari ${authorName}: ${giftName} ${giftCount} buah`);
  }
  // Case 3: YouTube SuperChat (HYPE ALERT)
  else if (item.type === 'superchat') {
    row.className = 'm-sc-card';
    const amount = escapeHtml(item.superchat ? item.superchat.amount : '$10.00');
    const msg = escapeHtml(item.message || '');

    row.innerHTML = `
      <div class="m-sc-header">
        <span class="m-gift-sender">${inlineBadge} ${authorName}</span>
        <span class="m-sc-amount">${amount}</span>
      </div>
      ${msg ? `<div class="m-sc-text">${msg}</div>` : ''}
    `;

    // Trigger Phone Haptic & Sound
    triggerVibrate(250);
    playAlertChime();
    speakGiftText(`SuperChat ${amount} dari ${authorName}: ${msg}`);
  }
  // Case 4: Standard Chat Message
  else {
    row.className = `mobile-chat-row ${platform === 'youtube' ? 'yt' : 'tt'}`;
    const authorClass = platform === 'youtube' ? 'yt' : 'tt';
    const badgeHtml = item.author && item.author.isMember ? '<span class="m-badge member">MEMBER</span>' : '';
    const modHtml = item.author && item.author.isModerator ? '<span class="m-badge mod">MOD</span>' : '';
    const msgText = escapeHtml(item.message || '');

    row.innerHTML = `
      ${avatarHtml}
      <div class="m-chat-content">
        <div class="m-author-row">
          <span class="m-time">[${timestamp}]</span>
          <span class="m-platform-badge">${inlineBadge}</span>
          ${badgeHtml}${modHtml}
          <strong class="m-author-name ${authorClass}">${authorName}:</strong>
        </div>
        <div class="m-message-text">${msgText}</div>
      </div>
    `;
  }

  // Apply current active category filter
  applyCategoryFilterToRow(row);

  chatFeedList.appendChild(row);

  // Auto-scroll logic
  if (!userScrolledUp) {
    chatFeedContainer.scrollTop = chatFeedContainer.scrollHeight;
    btnJumpLatest.style.display = 'none';
  } else {
    btnJumpLatest.style.display = 'block';
  }

  // Keep DOM lean (max 250 items on phone)
  while (chatFeedList.children.length > 250) {
    chatFeedList.removeChild(chatFeedList.firstChild);
  }
}

// User Scroll Detection
chatFeedContainer.addEventListener('scroll', () => {
  const atBottom = chatFeedContainer.scrollHeight - chatFeedContainer.clientHeight <= chatFeedContainer.scrollTop + 80;
  userScrolledUp = !atBottom;
  if (atBottom) {
    btnJumpLatest.style.display = 'none';
  }
});

btnJumpLatest.addEventListener('click', () => {
  userScrolledUp = false;
  chatFeedContainer.scrollTop = chatFeedContainer.scrollHeight;
  btnJumpLatest.style.display = 'none';
});

// ================= FILTER LOGIC =================
function applyCategoryFilterToRow(row) {
  const type = row.dataset.type;
  const platform = row.dataset.platform;

  let show = true;
  if (activeFilter === 'chat') {
    show = (type === 'chat');
  } else if (activeFilter === 'gifts') {
    show = (type === 'gift' || type === 'superchat');
  } else if (activeFilter === 'interactions') {
    show = (type === 'transient');
  } else if (activeFilter === 'youtube') {
    show = (platform === 'youtube');
  } else if (activeFilter === 'tiktok') {
    show = (platform === 'tiktok');
  }

  row.style.display = show ? '' : 'none';
}

filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.getAttribute('data-filter');

    // Re-filter all rows
    Array.from(chatFeedList.children).forEach(row => {
      if (row.classList.contains('welcome-card')) return;
      applyCategoryFilterToRow(row);
    });
  });
});

// ================= WEBSOCKET & LAN COMPANION SYNC =================
function connectToPcCompanion(address) {
  let target = address.trim();
  if (!target.startsWith('ws://') && !target.startsWith('wss://')) {
    target = 'ws://' + target;
  }

  if (socket) {
    try { socket.close(); } catch (e) {}
  }

  metricStatusPill.className = 'metric-pill status-pill';
  metricStatusText.textContent = 'CONNECTING...';

  try {
    socket = new WebSocket(target);

    socket.onopen = () => {
      isConnected = true;
      metricStatusPill.className = 'metric-pill status-pill online';
      metricStatusText.textContent = 'SYNCED TO PC';
      startUptimeClock();
      connectionDrawer.classList.remove('open');

      if (window.AndroidBridge) {
        window.AndroidBridge.showToast('Tersambung ke AnxinityStream PC!');
      }

      // Add connected banner
      const banner = document.createElement('div');
      banner.className = 'welcome-card';
      banner.innerHTML = `
        <div class="welcome-title" style="color: #34d399;">✓ Terhubung ke PC (${target})</div>
        <div class="welcome-body">Live stream, viewers, likes, dan komentar tersinkronisasi secara real-time!</div>
      `;
      chatFeedList.appendChild(banner);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.channel === 'chat-message') {
          appendChatMessage(payload.data);
        } else if (payload.channel === 'stream-stats') {
          if (payload.data.viewers !== undefined) {
            metricViewersCount.textContent = formatCompactNumber(payload.data.viewers);
          }
          if (payload.data.likes !== undefined) {
            metricLikesCount.textContent = formatCompactNumber(payload.data.likes);
          }
        } else if (payload.channel === 'status-update') {
          // Status updates
        } else if (payload.channel === 'clear-chat') {
          chatFeedList.innerHTML = '';
        }
      } catch (e) {}
    };

    socket.onerror = () => {
      metricStatusPill.className = 'metric-pill status-pill';
      metricStatusText.textContent = 'ERROR / RETRY';
    };

    socket.onclose = () => {
      isConnected = false;
      metricStatusPill.className = 'metric-pill status-pill';
      metricStatusText.textContent = 'OFFLINE';
      stopUptimeClock();
    };
  } catch (err) {
    alert('Gagal menghubungkan ke ' + target + '. Pastikan PC dan HP dalam satu jaringan WiFi.');
  }
}

// Connect Button Events
btnConnectPc.addEventListener('click', () => {
  const ip = inputPcIp.value.trim();
  if (!ip) {
    alert('Masukkan IP dan Port PC Anda (contoh: 192.168.1.5:19890)');
    return;
  }
  settings.pcIp = ip;
  localStorage.setItem('anxinity_mobile_settings', JSON.stringify(settings));
  connectToPcCompanion(ip);
});

// Standalone Direct Connect Handlers
btnConnectTtDirect.addEventListener('click', () => {
  const user = inputDirectTt.value.trim();
  if (!user) return alert('Masukkan username TikTok');
  // Send connect command to bridge or direct
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ action: 'connect-tiktok', target: user }));
    connectionDrawer.classList.remove('open');
    if (window.AndroidBridge) window.AndroidBridge.showToast('Menghubungkan ke TikTok @' + user);
  } else {
    // If not connected to PC, auto-connect to PC first or notify
    connectToPcCompanion(inputPcIp.value.trim());
    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'connect-tiktok', target: user }));
      }
    }, 1500);
  }
});

btnConnectYtDirect.addEventListener('click', () => {
  const yt = inputDirectYt.value.trim();
  if (!yt) return alert('Masukkan link YouTube Live');
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ action: 'connect-youtube', target: yt }));
    connectionDrawer.classList.remove('open');
    if (window.AndroidBridge) window.AndroidBridge.showToast('Menghubungkan ke YouTube...');
  } else {
    connectToPcCompanion(inputPcIp.value.trim());
    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'connect-youtube', target: yt }));
      }
    }, 1500);
  }
});

// UI Drawers & Modals
btnToggleConnect.addEventListener('click', () => {
  connectionDrawer.classList.toggle('open');
});
btnCloseDrawer.addEventListener('click', () => {
  connectionDrawer.classList.remove('open');
});

connTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    connTabs.forEach(t => t.classList.remove('active'));
    connPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-conn');
    document.getElementById(`conn-panel-${target}`).classList.add('active');
  });
});

btnOpenSettings.addEventListener('click', () => {
  settingsModal.classList.add('open');
});
btnCloseSettings.addEventListener('click', () => {
  settingsModal.classList.remove('open');
});
btnSaveSettings.addEventListener('click', () => {
  saveSettings();
  settingsModal.classList.remove('open');
});

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  // Try auto-connect to PC on startup if IP is configured
  if (settings.pcIp) {
    connectToPcCompanion(settings.pcIp);
  }
});
