// Inject Brand & Official SVGs
document.getElementById('brand-logo-slot').innerHTML = ICONS.anxinity;
document.getElementById('yt-logo-slot').innerHTML = ICONS.youtube;
document.getElementById('tt-logo-slot').innerHTML = ICONS.tiktok;
document.getElementById('trash-icon-slot').innerHTML = ICONS.trash;
document.getElementById('ghost-icon-slot').innerHTML = ICONS.lock;
if (document.getElementById('clock-icon-slot')) {
  document.getElementById('clock-icon-slot').innerHTML = ICONS.clock;
}

// Tab Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanels = document.querySelectorAll('.tab-panel');

navTabs.forEach(btn => {
  btn.addEventListener('click', () => {
    navTabs.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const targetId = btn.getAttribute('data-tab');
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) targetPanel.classList.add('active');
  });
});

// Channel Elements
const ytInput = document.getElementById('yt-input');
const ytBtn = document.getElementById('yt-connect-btn');
const ytBadge = document.getElementById('yt-status-badge');
const ytInfoTag = document.getElementById('yt-info-tag');

const ttInput = document.getElementById('tt-input');
const ttBtn = document.getElementById('tt-connect-btn');
const ttBadge = document.getElementById('tt-status-badge');
const ttViewersDisplay = document.getElementById('tt-viewers-display');
const ttLikesDisplay = document.getElementById('tt-likes-display');
const ttRoomStatus = document.getElementById('tt-room-status');

// Global Status & Health
const globalBroadcastPill = document.getElementById('global-broadcast-pill');
const globalBroadcastText = document.getElementById('global-broadcast-text');
const footerActivityText = document.getElementById('footer-activity-text');
const healthPill = document.getElementById('health-pill');
const healthDot = document.getElementById('health-dot');
const healthText = document.getElementById('health-text');

// Session Timer Elements
const sessionTimerDisplay = document.getElementById('session-timer-display');
let sessionStartTime = null;
let sessionTimerInterval = null;

// Stats Counters
const statYtCount = document.getElementById('stat-yt-count');
const statTtCount = document.getElementById('stat-tt-count');
const statHypeCount = document.getElementById('stat-hype-count');
let countYt = 0;
let countTt = 0;
let countHype = 0;

// Ghost Mode Elements
const ghostDeckCard = document.getElementById('ghost-deck-card');
const ghostPanelTitle = document.getElementById('ghost-panel-title');
const ghostPanelDesc = document.getElementById('ghost-panel-desc');
const btnToggleGhost = document.getElementById('btn-toggle-ghost');

const btnOpenOverlay = document.getElementById('btn-open-overlay');
const btnClearChat = document.getElementById('btn-clear-chat');
const btnForceReconnect = document.getElementById('btn-force-reconnect');

// Live Monitor Elements
const liveMonitorScreen = document.getElementById('live-monitor-screen');
const monitorChatList = document.getElementById('monitor-chat-list');
const emptyFeedPlaceholder = document.getElementById('empty-feed-placeholder');
const feedCountBadge = document.getElementById('feed-count-badge');
const btnClearMonitor = document.getElementById('btn-clear-monitor');

// Deck Sliders
const deckOpacitySlider = document.getElementById('deck-opacity-slider');
const deckOpacityVal = document.getElementById('deck-opacity-val');
const deckVolumeSlider = document.getElementById('deck-volume-slider');
const deckVolumeVal = document.getElementById('deck-volume-val');

// Tab 2: Audio & TTS Elements
const soundCards = document.querySelectorAll('.sound-card');
const toggleSoundLock = document.getElementById('toggle-sound-lock');
const toggleTts = document.getElementById('toggle-tts');
const ttsFilterButtons = document.querySelectorAll('#tts-filter-control .pill-btn');
const ttsRateSlider = document.getElementById('tts-rate-slider');
const ttsRateVal = document.getElementById('tts-rate-val');
const ttsVolSlider = document.getElementById('tts-vol-slider');
const ttsVolVal = document.getElementById('tts-vol-val');
const btnTestTts = document.getElementById('btn-test-tts');

// Tab 3: Themes & Visual Elements
const themeCards = document.querySelectorAll('.theme-card');
const bubbleStyleButtons = document.querySelectorAll('#bubble-style-control .pill-btn');
const fontSizeButtons = document.querySelectorAll('#font-size-control .pill-btn');
const fontFamilyButtons = document.querySelectorAll('#font-family-control .pill-btn');
const toggleTimestamp = document.getElementById('toggle-timestamp');
const toggleAlwaysTop = document.getElementById('toggle-always-top');

// Tab 4: Moderation & Filter Elements
const platformFilterButtons = document.querySelectorAll('#platform-filter-control .pill-btn');
const toggleAntiSpam = document.getElementById('toggle-anti-spam');
const toggleTransients = document.getElementById('toggle-transients');
const toggleAutoReconnect = document.getElementById('toggle-auto-reconnect');
const minDiamondSlider = document.getElementById('min-diamond-slider');
const minDiamondVal = document.getElementById('min-diamond-val');
const blacklistInput = document.getElementById('blacklist-input');
const btnSaveMod = document.getElementById('btn-save-mod');

// Tab 5: Diagnostic Elements
const diagnosticConsole = document.getElementById('diagnostic-console');
const btnClearConsole = document.getElementById('btn-clear-console');

// Simulator Buttons
const btnSimYtChat = document.getElementById('sim-yt-chat');
const btnSimTtChat = document.getElementById('sim-tt-chat');
const btnSimTtLike = document.getElementById('sim-tt-like');
const btnSimYtSc = document.getElementById('sim-yt-sc');
const btnSimTtGift = document.getElementById('sim-tt-gift');
const btnSimTtRoses = document.getElementById('sim-tt-roses');

// State
let ytConnected = false;
let ttConnected = false;
let isLocked = false;
let messageCount = 0;
let currentSettings = {};

// ================= SESSION UPTIME CLOCK =================
function startSessionClock() {
  if (sessionTimerInterval) return;
  sessionStartTime = Date.now();
  sessionTimerInterval = setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - sessionStartTime) / 1000);
    const hrs = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    sessionTimerDisplay.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function stopSessionClock() {
  if (!ytConnected && !ttConnected) {
    if (sessionTimerInterval) {
      clearInterval(sessionTimerInterval);
      sessionTimerInterval = null;
    }
  }
}

// ================= DIAGNOSTIC CONSOLE LOG =================
function logConsole(text, type = 'info') {
  if (!diagnosticConsole) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const entry = document.createElement('div');
  entry.className = `console-entry ${type}`;
  entry.textContent = `[${time}] ${text}`;
  diagnosticConsole.appendChild(entry);
  diagnosticConsole.scrollTop = diagnosticConsole.scrollHeight;

  // Max 100 logs
  while (diagnosticConsole.children.length > 100) {
    diagnosticConsole.removeChild(diagnosticConsole.firstChild);
  }
}

if (btnClearConsole) {
  btnClearConsole.addEventListener('click', () => {
    diagnosticConsole.innerHTML = '';
    logConsole('Console log dibersihkan.', 'info');
  });
}

// ================= GLOBAL STATUS & BROADCAST =================
function updateGlobalBroadcastStatus() {
  if (ytConnected || ttConnected) {
    globalBroadcastPill.classList.remove('reconnecting');
    globalBroadcastPill.classList.add('active');
    globalBroadcastText.textContent = 'STREAMING LIVE';
    footerActivityText.textContent = `Siaran langsung terhubung: ${ytConnected ? 'YouTube ' : ''}${ttConnected ? 'TikTok' : ''}`;
    startSessionClock();
  } else {
    globalBroadcastPill.classList.remove('active', 'reconnecting');
    globalBroadcastText.textContent = 'STANDBY';
    footerActivityText.textContent = 'Sistem standby, siap menerima koneksi siaran.';
    stopSessionClock();
  }
}

// Update Ghost Mode UI
function updateLockUI(locked) {
  isLocked = locked;
  if (locked) {
    ghostDeckCard.classList.add('locked-mode');
    document.getElementById('ghost-icon-slot').innerHTML = ICONS.unlock;
    ghostPanelTitle.textContent = 'Ghost Mode Aktif (Tembus Klik)';
    ghostPanelDesc.innerHTML = 'Overlay chat <strong>terkunci dan tembus klik mouse</strong>. Kursor tidak akan mengganggu gameplay. Tekan <kbd>F9</kbd> untuk membuka.';
    btnToggleGhost.textContent = 'Buka Kunci (F9)';
    logConsole('Ghost Mode diaktifkan (Tembus Klik F9).', 'info');
  } else {
    ghostDeckCard.classList.remove('locked-mode');
    document.getElementById('ghost-icon-slot').innerHTML = ICONS.lock;
    ghostPanelTitle.textContent = 'Mode Interaktif (Bisa Digeser)';
    ghostPanelDesc.innerHTML = 'Overlay chat <strong>dapat digeser dan diubah ukuran</strong>. Tekan <kbd>F9</kbd> untuk mengunci tembus klik saat main game.';
    btnToggleGhost.textContent = 'Kunci Overlay (F9)';
    logConsole('Ghost Mode dimatikan (Mode Interaktif F9).', 'info');
  }
}

// Format numbers
function formatCompactNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

// Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Mirror chat to Live Feed Monitor & update Session Analytics
function appendMonitorFeed(item) {
  if (emptyFeedPlaceholder) {
    emptyFeedPlaceholder.style.display = 'none';
  }

  messageCount++;
  feedCountBadge.textContent = `${messageCount} pesan`;

  const platform = item.platform || 'youtube';
  if (platform === 'youtube') {
    countYt++;
    statYtCount.textContent = formatCompactNumber(countYt);
  } else {
    countTt++;
    statTtCount.textContent = formatCompactNumber(countTt);
  }

  if (item.type === 'gift' || item.type === 'superchat') {
    countHype++;
    statHypeCount.textContent = formatCompactNumber(countHype);
  }

  const row = document.createElement('div');
  row.className = 'monitor-msg-row';

  const brandIcon = platform === 'youtube' ? ICONS.youtubeInline : ICONS.tiktokInline;
  const authorClass = platform === 'youtube' ? 'yt' : 'tt';
  const authorName = escapeHtml(item.author ? item.author.name : 'User');
  const time = escapeHtml(item.timestamp || '');

  if (item.type === 'gift') {
    const giftName = escapeHtml(item.gift ? item.gift.name : 'Gift');
    const giftCount = item.gift ? item.gift.count : 1;
    row.innerHTML = `
      ${brandIcon} <span class="monitor-time">[${time}]</span>
      <strong class="monitor-author ${authorClass}">${authorName}</strong>
      <span style="color: #fde047; font-weight: 700;">GIFT: ${giftName} x${giftCount}</span>
    `;
  } else if (item.type === 'superchat') {
    const amount = escapeHtml(item.superchat ? item.superchat.amount : '$');
    row.innerHTML = `
      ${brandIcon} <span class="monitor-time">[${time}]</span>
      <strong class="monitor-author ${authorClass}">${authorName}</strong>
      <span style="color: #f87171; font-weight: 700;">SUPERCHAT ${amount}:</span>
      <span class="monitor-text">${escapeHtml(item.message || '')}</span>
    `;
  } else if (item.type === 'transient') {
    row.innerHTML = `
      ${brandIcon} <span class="monitor-time">[${time}]</span>
      <span style="color: #94a3b8;"><em>${authorName} ${escapeHtml(item.message || '')}</em></span>
    `;
  } else {
    row.innerHTML = `
      ${brandIcon} <span class="monitor-time">[${time}]</span>
      <strong class="monitor-author ${authorClass}">${authorName}:</strong>
      <span class="monitor-text">${escapeHtml(item.message || '')}</span>
    `;
  }

  monitorChatList.appendChild(row);
  liveMonitorScreen.scrollTop = liveMonitorScreen.scrollHeight;

  while (monitorChatList.children.length > 100) {
    monitorChatList.removeChild(monitorChatList.firstChild);
  }
}

// Clear Monitor
if (btnClearMonitor) {
  btnClearMonitor.addEventListener('click', () => {
    monitorChatList.innerHTML = '';
    if (emptyFeedPlaceholder) emptyFeedPlaceholder.style.display = 'block';
    messageCount = 0;
    feedCountBadge.textContent = '0 pesan';
    logConsole('Feed monitor lokal dibersihkan.', 'info');
  });
}

// ================= YOUTUBE STATUS HANDLERS =================
function updateYtStatus(status, message) {
  if (status === 'connecting') {
    ytBadge.className = 'badge badge-connecting';
    ytBadge.textContent = 'CONNECTING...';
    ytBtn.disabled = true;
    ytBtn.textContent = 'Menghubungkan...';
    ytInfoTag.textContent = 'Menghubungkan ke siaran langsung YouTube...';
    logConsole(`YouTube: Menghubungkan ke ${ytInput.value.trim()}...`, 'info');
  } else if (status === 'connected') {
    ytConnected = true;
    ytBadge.className = 'badge badge-live';
    ytBadge.textContent = 'LIVE';
    ytBtn.disabled = false;
    ytBtn.textContent = 'Putuskan';
    ytBtn.classList.add('connected');
    ytInput.disabled = true;
    ytInfoTag.textContent = 'Tersambung aktif. Input terkunci demi keamanan.';
    logConsole(`YouTube: Tersambung aktif (${message || 'Siaran LIVE'}).`, 'success');
  } else if (status === 'reconnecting') {
    ytBadge.className = 'badge badge-connecting';
    ytBadge.textContent = 'RECONNECTING';
    ytInfoTag.textContent = message || 'Koneksi terputus, mencoba reconnect otomatis...';
    logConsole(`YouTube: ${message || 'Mencoba reconnect...'}`, 'warn');
  } else {
    ytConnected = false;
    ytBadge.className = status === 'error' ? 'badge badge-error' : 'badge badge-idle';
    ytBadge.textContent = status === 'error' ? 'ERROR' : 'OFFLINE';
    ytBtn.disabled = false;
    ytBtn.textContent = 'Sambungkan';
    ytBtn.classList.remove('connected');
    ytInput.disabled = false;
    ytInfoTag.textContent = message || 'Input otomatis terkunci saat tersambung.';
    logConsole(`YouTube: Terputus / Error: ${message || 'Offline'}`, status === 'error' ? 'error' : 'info');
  }
  updateGlobalBroadcastStatus();
}

// ================= TIKTOK STATUS HANDLERS =================
function updateTtStatus(status, message) {
  if (status === 'connecting') {
    ttBadge.className = 'badge badge-connecting';
    ttBadge.textContent = 'CONNECTING...';
    ttBtn.disabled = true;
    ttBtn.textContent = 'Menghubungkan...';
    ttRoomStatus.textContent = 'Connecting...';
    logConsole(`TikTok: Menghubungkan ke @${ttInput.value.trim()} via WebSocket bootstrap...`, 'info');
  } else if (status === 'connected') {
    ttConnected = true;
    ttBadge.className = 'badge badge-live';
    ttBadge.textContent = 'LIVE';
    ttBtn.disabled = false;
    ttBtn.textContent = 'Putuskan';
    ttBtn.classList.add('connected');
    ttInput.disabled = true;
    ttRoomStatus.textContent = 'Aktif (LIVE)';
    logConsole(`TikTok: Tersambung aktif ke room @${ttInput.value.trim()}!`, 'success');
  } else if (status === 'reconnecting') {
    ttBadge.className = 'badge badge-connecting';
    ttBadge.textContent = 'RECONNECTING';
    ttRoomStatus.textContent = 'Reconnecting...';
    logConsole(`TikTok: ${message || 'Mencoba reconnect otomatis...'}`, 'warn');
  } else {
    ttConnected = false;
    ttBadge.className = status === 'error' ? 'badge badge-error' : 'badge badge-idle';
    ttBadge.textContent = status === 'error' ? 'ERROR' : 'OFFLINE';
    ttBtn.disabled = false;
    ttBtn.textContent = 'Sambungkan';
    ttBtn.classList.remove('connected');
    ttInput.disabled = false;
    ttRoomStatus.textContent = status === 'error' ? 'Error' : 'Standby';
    logConsole(`TikTok: ${message || 'Koneksi terputus / offline.'}`, status === 'error' ? 'error' : 'info');
  }
  updateGlobalBroadcastStatus();
}

// Update Stream Stats
function updateStreamStats(stats) {
  if (stats.platform === 'tiktok') {
    if (stats.viewers !== undefined) ttViewersDisplay.textContent = formatCompactNumber(stats.viewers);
    if (stats.likes !== undefined) ttLikesDisplay.textContent = formatCompactNumber(stats.likes);
  }
}

// Update Latency / Health
function updateStreamHealth(health) {
  if (!healthText || !healthDot) return;
  const ms = health.latencyMs || 0;
  if (health.status === 'excellent' || ms < 200) {
    healthDot.style.backgroundColor = '#10b981';
    healthDot.style.boxShadow = '0 0 6px #10b981';
    healthText.textContent = `⚡ ${ms}ms`;
    healthPill.style.color = '#34d399';
  } else if (health.status === 'good' || ms < 600) {
    healthDot.style.backgroundColor = '#f59e0b';
    healthDot.style.boxShadow = '0 0 6px #f59e0b';
    healthText.textContent = `⚡ ${ms}ms`;
    healthPill.style.color = '#fbbf24';
  } else {
    healthDot.style.backgroundColor = '#f43f5e';
    healthDot.style.boxShadow = '0 0 6px #f43f5e';
    healthText.textContent = `⚡ ${ms}ms`;
    healthPill.style.color = '#fb7185';
  }
}

// ================= CONNECT BUTTON CLICK HANDLERS =================
ytBtn.addEventListener('click', async () => {
  if (ytConnected) {
    await window.api.disconnectYoutube();
  } else {
    const val = ytInput.value.trim();
    if (!val) {
      alert('Masukkan URL Live YouTube, Video ID, atau @ChannelHandle.');
      return;
    }
    updateYtStatus('connecting');
    try {
      await window.api.connectYoutube(val);
    } catch (err) {
      // Error handled via status event
    }
  }
});

ttBtn.addEventListener('click', async () => {
  if (ttConnected) {
    await window.api.disconnectTiktok();
  } else {
    const val = ttInput.value.trim();
    if (!val) {
      alert('Masukkan username TikTok streamer (saat akun sedang LIVE).');
      return;
    }
    updateTtStatus('connecting');
    try {
      await window.api.connectTiktok(val);
    } catch (err) {
      // Error handled via status event
    }
  }
});

// Ghost Mode Toggle
btnToggleGhost.addEventListener('click', () => {
  window.api.toggleOverlayLock();
});

// Quick Tools
btnOpenOverlay.addEventListener('click', () => {
  window.api.showOverlay();
  logConsole('Jendela overlay dibuka / reset posisi.', 'info');
});

btnClearChat.addEventListener('click', () => {
  window.api.clearChat();
  logConsole('Sinyal pembersihan chat dikirim ke overlay.', 'info');
});

btnForceReconnect.addEventListener('click', async () => {
  logConsole('Memicu Force Reconnect pada semua channel aktif...', 'warn');
  if (ytInput.value.trim()) {
    try { await window.api.connectYoutube(ytInput.value.trim()); } catch (e) {}
  }
  if (ttInput.value.trim()) {
    try { await window.api.connectTiktok(ttInput.value.trim()); } catch (e) {}
  }
});

// ================= SLIDERS HANDLERS =================
deckOpacitySlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value) / 100;
  deckOpacityVal.textContent = `${e.target.value}%`;
  window.api.updateSettings({ opacity: val });
});

deckVolumeSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value) / 100;
  deckVolumeVal.textContent = `${e.target.value}%`;
  window.api.updateSettings({ soundVolume: val });
});

// ================= TAB 2: AUDIO SYNTHESIZER SOUNDBOARD =================
function testAudioSynth(profile, volume = 0.8) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (profile === 'arcade') {
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35 * volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    } else if (profile === 'casino') {
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
    console.error('Test audio error:', e);
  }
}

soundCards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-sound-test')) return;
    soundCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const profile = card.getAttribute('data-profile');
    window.api.updateSettings({ soundProfile: profile });
    logConsole(`Sound Profile diubah menjadi: ${profile}`, 'info');
  });

  const testBtn = card.querySelector('.btn-sound-test');
  if (testBtn) {
    testBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const profile = testBtn.getAttribute('data-test');
      const vol = parseFloat(deckVolumeSlider.value) / 100;
      testAudioSynth(profile, vol);
      logConsole(`Pengujian nada soundboard: ${profile}`, 'info');
    });
  }
});

toggleSoundLock.addEventListener('change', (e) => {
  window.api.updateSettings({ soundOnLock: e.target.checked });
});

// ================= TAB 2: TTS (TEXT-TO-SPEECH) ENGINE =================
toggleTts.addEventListener('change', (e) => {
  window.api.updateSettings({ ttsEnabled: e.target.checked });
  logConsole(`In-Game TTS Voice Engine: ${e.target.checked ? 'AKTIF' : 'NONAKTIF'}`, 'info');
});

ttsFilterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    ttsFilterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    window.api.updateSettings({ ttsFilter: filter });
  });
});

ttsRateSlider.addEventListener('input', (e) => {
  const rate = parseFloat(e.target.value) / 100;
  ttsRateVal.textContent = `${rate.toFixed(1)}x`;
  window.api.updateSettings({ ttsRate: rate });
});

ttsVolSlider.addEventListener('input', (e) => {
  const vol = parseFloat(e.target.value) / 100;
  ttsVolVal.textContent = `${e.target.value}%`;
  window.api.updateSettings({ ttsVolume: vol });
});

btnTestTts.addEventListener('click', () => {
  if ('speechSynthesis' in window) {
    const text = 'Halo bang Felix! Donasi Paus dari penonton masuk, semangat live streamingnya!';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = parseFloat(ttsVolSlider.value) / 100;
    utterance.rate = parseFloat(ttsRateSlider.value) / 100;
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);
    logConsole('Pengujian suara Text-To-Speech dijalankan.', 'info');
  }
});

// ================= TAB 3: THEMES STUDIO =================
themeCards.forEach(card => {
  card.addEventListener('click', () => {
    themeCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const theme = card.getAttribute('data-theme');
    window.api.updateSettings({ overlayTheme: theme });
    logConsole(`Tema overlay diubah menjadi: ${theme}`, 'info');
  });
});

bubbleStyleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    bubbleStyleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const style = btn.getAttribute('data-style');
    window.api.updateSettings({ bubbleStyle: style });
  });
});

fontSizeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    fontSizeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const size = btn.getAttribute('data-size');
    window.api.updateSettings({ fontSize: size });
  });
});

fontFamilyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    fontFamilyButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const font = btn.getAttribute('data-font');
    window.api.updateSettings({ fontFamily: font });
  });
});

toggleTimestamp.addEventListener('change', (e) => {
  window.api.updateSettings({ showTimestamp: e.target.checked });
});

toggleAlwaysTop.addEventListener('change', (e) => {
  window.api.updateSettings({ alwaysOnTop: e.target.checked });
});

// ================= TAB 4: MODERATION & FILTERS =================
platformFilterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    platformFilterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const platform = btn.getAttribute('data-platform');
    window.api.updateSettings({ platformFilter: platform });
    logConsole(`Filter platform diubah: ${platform}`, 'info');
  });
});

toggleAntiSpam.addEventListener('change', (e) => {
  window.api.updateSettings({ antiSpam: e.target.checked });
});

toggleTransients.addEventListener('change', (e) => {
  window.api.updateSettings({ showTransients: e.target.checked });
});

toggleAutoReconnect.addEventListener('change', (e) => {
  window.api.updateSettings({ autoReconnect: e.target.checked });
});

minDiamondSlider.addEventListener('input', (e) => {
  const diamonds = parseInt(e.target.value, 10);
  minDiamondVal.textContent = `${diamonds} Diamond`;
  window.api.updateSettings({ minGiftDiamonds: diamonds });
});

btnSaveMod.addEventListener('click', () => {
  const blacklist = blacklistInput.value.trim();
  window.api.updateSettings({ blacklistWords: blacklist });
  logConsole('Daftar kata terlarang (blacklist) berhasil diperbarui.', 'success');
  alert('Pengaturan filter dan kata terlarang berhasil disimpan!');
});

// ================= TAB 5: SIMULATOR BUTTONS =================
btnSimYtChat.addEventListener('click', () => {
  const msgs = ['GG bang mainnya!', 'Keren banget gameplay-nya!', 'Salam dari Surabaya bang!'];
  window.api.simulateEvent({
    id: 'sim_yt_' + Date.now(),
    platform: 'youtube',
    type: 'chat',
    author: { name: 'Daffa Pratama', isMember: true },
    message: msgs[Math.floor(Math.random() * msgs.length)],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now()
  });
});

btnSimTtChat.addEventListener('click', () => {
  const msgs = ['Tap tap layarnya guys! 🔥', 'Followed bang, seru live-nya!', 'Kocak banget wkwk'];
  window.api.simulateEvent({
    id: 'sim_tt_' + Date.now(),
    platform: 'tiktok',
    type: 'chat',
    author: { name: 'Budi Santoso', isModerator: false },
    message: msgs[Math.floor(Math.random() * msgs.length)],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now()
  });
});

btnSimTtLike.addEventListener('click', () => {
  window.api.simulateEvent({
    id: 'sim_tt_like_' + Date.now(),
    platform: 'tiktok',
    type: 'transient',
    subtype: 'like',
    author: { name: 'Gamer_Sejati' },
    message: 'mengirim 5 like',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now()
  });
});

btnSimYtSc.addEventListener('click', () => {
  window.api.simulateEvent({
    id: 'sim_yt_sc_' + Date.now(),
    platform: 'youtube',
    type: 'superchat',
    author: { name: 'Donatur Sultan', isMember: true },
    message: 'Semangat streamingnya bang Felix! Ini buat kopi & cemilan!',
    superchat: { amount: '$10.00' },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now()
  });
});

btnSimTtGift.addEventListener('click', () => {
  window.api.simulateEvent({
    id: 'sim_tt_gift_' + Date.now(),
    platform: 'tiktok',
    type: 'gift',
    author: { name: 'TikTok Supporter' },
    gift: { name: 'Paus Menyelam', count: 1, diamondCount: 2150 },
    message: 'mengirim Paus Menyelam x1',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now()
  });
});

btnSimTtRoses.addEventListener('click', () => {
  window.api.simulateEvent({
    id: 'sim_tt_roses_' + Date.now(),
    platform: 'tiktok',
    type: 'gift',
    author: { name: 'Nadia Putri' },
    gift: { name: 'Mawar', count: 10, diamondCount: 10 },
    message: 'mengirim Mawar x10',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawTimestamp: Date.now()
  });
});

// ================= IPC EVENT LISTENERS =================
window.api.onChatMessage((msg) => {
  appendMonitorFeed(msg);
});

window.api.onStatusUpdate((data) => {
  if (data.platform === 'youtube') {
    updateYtStatus(data.status, data.message);
  } else if (data.platform === 'tiktok') {
    updateTtStatus(data.status, data.message);
  }
});

window.api.onStreamStats((stats) => {
  updateStreamStats(stats);
});

window.api.onStreamHealth((health) => {
  updateStreamHealth(health);
});

window.api.onOverlayLockChanged((locked) => {
  updateLockUI(locked);
});

// ================= APPLY SETTINGS ON INIT =================
function applyInitialSettings(settings) {
  currentSettings = settings;

  if (settings.opacity !== undefined) {
    const pct = Math.round(settings.opacity * 100);
    deckOpacitySlider.value = pct;
    deckOpacityVal.textContent = `${pct}%`;
  }

  if (settings.soundVolume !== undefined) {
    const pct = Math.round(settings.soundVolume * 100);
    deckVolumeSlider.value = pct;
    deckVolumeVal.textContent = `${pct}%`;
  }

  if (settings.lastYoutubeInput) ytInput.value = settings.lastYoutubeInput;
  if (settings.lastTiktokUsername) ttInput.value = settings.lastTiktokUsername;

  // Sound Profile
  if (settings.soundProfile) {
    soundCards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-profile') === settings.soundProfile);
    });
  }
  if (settings.soundOnLock !== undefined) toggleSoundLock.checked = settings.soundOnLock;

  // TTS
  if (settings.ttsEnabled !== undefined) toggleTts.checked = settings.ttsEnabled;
  if (settings.ttsFilter) {
    ttsFilterButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-filter') === settings.ttsFilter);
    });
  }
  if (settings.ttsRate !== undefined) {
    ttsRateSlider.value = Math.round(settings.ttsRate * 100);
    ttsRateVal.textContent = `${settings.ttsRate.toFixed(1)}x`;
  }
  if (settings.ttsVolume !== undefined) {
    ttsVolSlider.value = Math.round(settings.ttsVolume * 100);
    ttsVolVal.textContent = `${Math.round(settings.ttsVolume * 100)}%`;
  }

  // Themes
  if (settings.overlayTheme) {
    themeCards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-theme') === settings.overlayTheme);
    });
  }
  if (settings.bubbleStyle) {
    bubbleStyleButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-style') === settings.bubbleStyle);
    });
  }
  if (settings.fontSize) {
    fontSizeButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-size') === settings.fontSize);
    });
  }
  if (settings.fontFamily) {
    fontFamilyButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-font') === settings.fontFamily);
    });
  }
  if (settings.showTimestamp !== undefined) toggleTimestamp.checked = settings.showTimestamp;
  if (settings.alwaysOnTop !== undefined) toggleAlwaysTop.checked = settings.alwaysOnTop;

  // Moderation
  if (settings.platformFilter) {
    platformFilterButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-platform') === settings.platformFilter);
    });
  }
  if (settings.antiSpam !== undefined) toggleAntiSpam.checked = settings.antiSpam;
  if (settings.showTransients !== undefined) toggleTransients.checked = settings.showTransients;
  if (settings.autoReconnect !== undefined) toggleAutoReconnect.checked = settings.autoReconnect;
  if (settings.minGiftDiamonds !== undefined) {
    minDiamondSlider.value = settings.minGiftDiamonds;
    minDiamondVal.textContent = `${settings.minGiftDiamonds} Diamond`;
  }
  if (settings.blacklistWords !== undefined) {
    blacklistInput.value = settings.blacklistWords;
  }
}

// Initial Boot
window.addEventListener('DOMContentLoaded', async () => {
  const currentLock = await window.api.getOverlayLockState();
  updateLockUI(currentLock);

  const settings = await window.api.getSettings();
  applyInitialSettings(settings);

  logConsole('AnxinityStream v5.0 Mega Studio siap siaga.', 'success');
});
