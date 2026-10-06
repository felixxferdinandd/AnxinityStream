// Inject Brand & Official SVGs
document.getElementById('brand-logo-slot').innerHTML = ICONS.anxinity;
document.getElementById('yt-logo-slot').innerHTML = ICONS.youtube;
document.getElementById('tt-logo-slot').innerHTML = ICONS.tiktok;
document.getElementById('trash-icon-slot').innerHTML = ICONS.trash;
document.getElementById('ghost-icon-slot').innerHTML = ICONS.lock;

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
const ytInfoBar = document.getElementById('yt-info-bar');

const ttInput = document.getElementById('tt-input');
const ttBtn = document.getElementById('tt-connect-btn');
const ttBadge = document.getElementById('tt-status-badge');
const ttViewersDisplay = document.getElementById('tt-viewers-display');
const ttLikesDisplay = document.getElementById('tt-likes-display');
const ttRoomStatus = document.getElementById('tt-room-status');

// Global Status Elements
const globalBroadcastPill = document.getElementById('global-broadcast-pill');
const globalBroadcastText = document.getElementById('global-broadcast-text');
const footerActivityText = document.getElementById('footer-activity-text');

// Ghost Mode Elements
const ghostDeckCard = document.getElementById('ghost-deck-card');
const ghostPanelTitle = document.getElementById('ghost-panel-title');
const ghostPanelDesc = document.getElementById('ghost-panel-desc');
const btnToggleGhost = document.getElementById('btn-toggle-ghost');

const btnOpenOverlay = document.getElementById('btn-open-overlay');
const btnClearChat = document.getElementById('btn-clear-chat');

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

// Overlay Settings Tab
const fontSizeControl = document.getElementById('font-size-control');
const toggleTimestamp = document.getElementById('toggle-timestamp');
const toggleTransients = document.getElementById('toggle-transients');
const toggleAlwaysTop = document.getElementById('toggle-always-top');
const toggleSound = document.getElementById('toggle-sound');

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

function updateGlobalBroadcastStatus() {
  if (ytConnected || ttConnected) {
    globalBroadcastPill.classList.add('active');
    globalBroadcastText.textContent = 'STREAMING ACTIVE';
    footerActivityText.textContent = `Siaran langsung terhubung: ${ytConnected ? 'YouTube ' : ''}${ttConnected ? 'TikTok' : ''}`;
  } else {
    globalBroadcastPill.classList.remove('active');
    globalBroadcastText.textContent = 'STANDBY';
    footerActivityText.textContent = 'Sistem standby, siap menerima koneksi siaran.';
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
  } else {
    ghostDeckCard.classList.remove('locked-mode');
    document.getElementById('ghost-icon-slot').innerHTML = ICONS.lock;
    ghostPanelTitle.textContent = 'Mode Interaktif (Bisa Digeser)';
    ghostPanelDesc.innerHTML = 'Overlay chat <strong>dapat digeser dan diubah ukuran</strong>. Tekan <kbd>F9</kbd> untuk mengunci tembus klik saat main game.';
    btnToggleGhost.textContent = 'Kunci Overlay (F9)';
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

// Mirror chat to Live Feed Monitor
function appendMonitorFeed(item) {
  if (emptyFeedPlaceholder) {
    emptyFeedPlaceholder.style.display = 'none';
  }

  messageCount++;
  feedCountBadge.textContent = `${messageCount} pesan`;

  const row = document.createElement('div');
  row.className = 'monitor-msg-row';

  const platform = item.platform || 'youtube';
  const brandIcon = platform === 'youtube' ? ICONS.youtube : ICONS.tiktok;
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

  while (monitorChatList.children.length > 100) {
    monitorChatList.removeChild(monitorChatList.firstChild);
  }

  liveMonitorScreen.scrollTop = liveMonitorScreen.scrollHeight;
}

// Clear Monitor Screen
btnClearMonitor.addEventListener('click', () => {
  monitorChatList.innerHTML = '';
  messageCount = 0;
  feedCountBadge.textContent = '0 pesan';
  emptyFeedPlaceholder.style.display = 'flex';
});

// Update YouTube Status
function updateYtStatus(status, message) {
  ytBadge.className = 'badge';
  if (status === 'connected') {
    ytConnected = true;
    ytBadge.classList.add('badge-live');
    ytBadge.textContent = 'ONLINE (LIVE)';
    ytBtn.textContent = 'Putuskan';
    ytBtn.classList.add('connected');
    ytInput.disabled = true;
    ytInfoBar.innerHTML = `<span class="info-tag" style="color:#4ade80;">Terhubung ke YouTube Live stream.</span>`;
  } else if (status === 'connecting') {
    ytBadge.classList.add('badge-connecting');
    ytBadge.textContent = 'CONNECTING...';
    ytBtn.textContent = 'Batal';
    ytInput.disabled = true;
    ytInfoBar.innerHTML = `<span class="info-tag">Menghubungkan ke server YouTube Live...</span>`;
  } else if (status === 'error') {
    ytConnected = false;
    ytBadge.classList.add('badge-error');
    ytBadge.textContent = 'ERROR';
    ytBtn.textContent = 'Sambungkan';
    ytBtn.classList.remove('connected');
    ytInput.disabled = false;
    ytInfoBar.innerHTML = `<span class="info-tag" style="color:#f87171;">Gagal: ${escapeHtml(message || 'Periksa link/channel Anda.')}</span>`;
  } else {
    ytConnected = false;
    ytBadge.classList.add('badge-idle');
    ytBadge.textContent = 'OFFLINE';
    ytBtn.textContent = 'Sambungkan';
    ytBtn.classList.remove('connected');
    ytInput.disabled = false;
    ytInfoBar.innerHTML = `<span class="info-tag">Input otomatis terkunci saat tersambung.</span>`;
  }
  updateGlobalBroadcastStatus();
}

// Update TikTok Status
function updateTtStatus(status, message) {
  ttBadge.className = 'badge';
  if (status === 'connected') {
    ttConnected = true;
    ttBadge.classList.add('badge-live');
    ttBadge.textContent = 'ONLINE (LIVE)';
    ttBtn.textContent = 'Putuskan';
    ttBtn.classList.add('connected');
    ttInput.disabled = true;
    ttRoomStatus.textContent = 'Streaming Live';
    ttRoomStatus.style.color = '#34d399';
  } else if (status === 'connecting') {
    ttBadge.classList.add('badge-connecting');
    ttBadge.textContent = 'CONNECTING...';
    ttBtn.textContent = 'Batal';
    ttInput.disabled = true;
    ttRoomStatus.textContent = 'Menyambungkan...';
    ttRoomStatus.style.color = '#fbbf24';
  } else if (status === 'error') {
    ttConnected = false;
    ttBadge.classList.add('badge-error');
    ttBadge.textContent = 'ERROR';
    ttBtn.textContent = 'Sambungkan';
    ttBtn.classList.remove('connected');
    ttInput.disabled = false;
    ttRoomStatus.textContent = 'Koneksi Gagal';
    ttRoomStatus.style.color = '#f87171';
    footerActivityText.textContent = `Error TikTok: ${message || 'Gagal koneksi'}`;
  } else {
    ttConnected = false;
    ttBadge.classList.add('badge-idle');
    ttBadge.textContent = 'OFFLINE';
    ttBtn.textContent = 'Sambungkan';
    ttBtn.classList.remove('connected');
    ttInput.disabled = false;
    ttRoomStatus.textContent = 'Standby';
    ttRoomStatus.style.color = '#94a3b8';
  }
  updateGlobalBroadcastStatus();
}

// Update TikTok Live Stats
function updateStreamStats(stats) {
  if (stats.viewers !== undefined) {
    ttViewersDisplay.textContent = formatCompactNumber(stats.viewers);
  }
  if (stats.likes !== undefined) {
    ttLikesDisplay.textContent = formatCompactNumber(stats.likes);
  }
}

// Load Settings from Storage
async function init() {
  try {
    const settings = await window.api.getSettings();
    if (settings) {
      if (settings.lastYoutubeInput) ytInput.value = settings.lastYoutubeInput;
      if (settings.lastTiktokUsername) ttInput.value = settings.lastTiktokUsername;

      if (settings.opacity !== undefined) {
        const pct = Math.round(settings.opacity * 100);
        deckOpacitySlider.value = pct;
        deckOpacityVal.textContent = `${pct}%`;
      }

      if (settings.soundVolume !== undefined) {
        const volPct = Math.round(settings.soundVolume * 100);
        deckVolumeSlider.value = volPct;
        deckVolumeVal.textContent = `${volPct}%`;
      }

      if (settings.fontSize) {
        document.querySelectorAll('#font-size-control .pill-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.size === settings.fontSize);
        });
      }

      if (settings.showTimestamp !== undefined) {
        toggleTimestamp.checked = !!settings.showTimestamp;
      }
      if (settings.showTransients !== undefined) {
        toggleTransients.checked = !!settings.showTransients;
      }
      if (settings.alwaysOnTop !== undefined) {
        toggleAlwaysTop.checked = !!settings.alwaysOnTop;
      }
      if (settings.soundAlerts !== undefined) {
        toggleSound.checked = !!settings.soundAlerts;
      }
    }

    const currentLock = await window.api.getOverlayLockState();
    updateLockUI(currentLock);
  } catch (err) {
    console.error('Init error:', err);
  }
}

// User Actions
ytBtn.addEventListener('click', async () => {
  if (ytConnected) {
    await window.api.disconnectYoutube();
    updateYtStatus('disconnected');
  } else {
    const val = ytInput.value.trim();
    if (!val) {
      alert('Masukkan link Live Stream atau handle YouTube terlebih dahulu!');
      ytInput.focus();
      return;
    }
    updateYtStatus('connecting');
    try {
      await window.api.connectYoutube(val);
    } catch (err) {
      updateYtStatus('error', err.message);
    }
  }
});

ttBtn.addEventListener('click', async () => {
  if (ttConnected) {
    await window.api.disconnectTiktok();
    updateTtStatus('disconnected');
  } else {
    const val = ttInput.value.trim();
    if (!val) {
      alert('Masukkan username TikTok terlebih dahulu!');
      ttInput.focus();
      return;
    }
    updateTtStatus('connecting');
    try {
      await window.api.connectTiktok(val);
    } catch (err) {
      updateTtStatus('error', err.message);
    }
  }
});

btnToggleGhost.addEventListener('click', async () => {
  const nextLock = !isLocked;
  await window.api.toggleOverlayLock(nextLock);
});

btnOpenOverlay.addEventListener('click', () => {
  window.api.showOverlay();
});

btnClearChat.addEventListener('click', () => {
  window.api.clearChat();
});

// Slider updates
deckOpacitySlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  deckOpacityVal.textContent = `${val}%`;
  window.api.updateSettings({ opacity: val / 100 });
});

deckVolumeSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  deckVolumeVal.textContent = `${val}%`;
  window.api.updateSettings({ soundVolume: val / 100 });
});

// Settings tab listeners
fontSizeControl.addEventListener('click', (e) => {
  const btn = e.target.closest('.pill-btn');
  if (!btn) return;
  document.querySelectorAll('#font-size-control .pill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window.api.updateSettings({ fontSize: btn.dataset.size });
});

toggleTimestamp.addEventListener('change', (e) => {
  window.api.updateSettings({ showTimestamp: e.target.checked });
});

toggleTransients.addEventListener('change', (e) => {
  window.api.updateSettings({ showTransients: e.target.checked });
});

toggleAlwaysTop.addEventListener('change', (e) => {
  window.api.updateSettings({ alwaysOnTop: e.target.checked });
});

toggleSound.addEventListener('change', (e) => {
  window.api.updateSettings({ soundAlerts: e.target.checked });
});

// Simulators
btnSimYtChat.addEventListener('click', () => {
  const msgs = ['Gameplay tadi GG banget bang!', 'Salam kenal dari Surabaya!', 'Next game main apa nih?'];
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

// IPC Event Listeners
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

window.api.onOverlayLockChanged((locked) => {
  updateLockUI(locked);
});

window.api.onSettingsChanged((settings) => {
  if (settings.opacity !== undefined) {
    const pct = Math.round(settings.opacity * 100);
    deckOpacitySlider.value = pct;
    deckOpacityVal.textContent = `${pct}%`;
  }
  if (settings.soundVolume !== undefined) {
    const volPct = Math.round(settings.soundVolume * 100);
    deckVolumeSlider.value = volPct;
    deckVolumeVal.textContent = `${volPct}%`;
  }
});

init();
