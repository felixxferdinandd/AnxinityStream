const { WebcastPushConnection } = require('tiktok-connector');
const EventEmitter = require('events');

class TiktokService extends EventEmitter {
  constructor() {
    super();
    this.connection = null;
    this.isConnected = false;
    this.isManualDisconnect = false;
    this.currentUsername = null;
    this.pollInterval = null;
    this.healthInterval = null;
    
    // Auto-reconnect configuration
    this.autoReconnect = true;
    this.reconnectAttempt = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimer = null;
    this.packetsReceived = 0;
    this.lastPingMs = 0;
  }

  static cleanUsername(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let str = raw.trim();

    // Remove query params
    if (str.includes('?')) {
      str = str.split('?')[0];
    }

    // Match URL e.g. https://www.tiktok.com/@username/live or tiktok.com/@username
    const urlMatch = str.match(/tiktok\.com\/@([a-zA-Z0-9_\-\.]+)/i);
    if (urlMatch) {
      return urlMatch[1].replace(/\/live$/i, '');
    }

    // Remove leading @
    if (str.startsWith('@')) {
      str = str.substring(1);
    }

    // Remove trailing slashes
    str = str.replace(/\/+$/, '');

    return str;
  }

  async connect(rawUsername) {
    const username = TiktokService.cleanUsername(rawUsername);
    if (!username) {
      throw new Error('Masukkan username TikTok yang valid.');
    }

    // Cancel any active reconnect attempt
    this.clearReconnectTimer();
    this.isManualDisconnect = false;

    if (this.isConnected) {
      await this.disconnect(true);
    }

    this.currentUsername = username;
    this.emit('status', { 
      status: 'connecting', 
      platform: 'tiktok', 
      target: username,
      attempt: this.reconnectAttempt > 0 ? this.reconnectAttempt : undefined
    });

    try {
      this.connection = new WebcastPushConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 1000,
        clientParams: {
          app_language: 'id-ID',
          device_platform: 'web'
        }
      });

      // Bind events
      this.bindSocketEvents(username);

      // Timeout race: if connection hangs for > 14 seconds
      const connectPromise = this.connection.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Koneksi TikTok time out (14 detik). Server tidak merespons.')), 14000);
      });

      const state = await Promise.race([connectPromise, timeoutPromise]);
      this.isConnected = true;
      this.reconnectAttempt = 0; // Reset on success

      // Extract initial room stats
      if (state && state.roomInfo) {
        const viewers = state.roomInfo.user_count || (state.roomInfo.stats && state.roomInfo.stats.user_count) || 0;
        const likes = (state.roomInfo.stats && state.roomInfo.stats.like_count) || 0;
        this.emit('stats', { platform: 'tiktok', viewers, likes });
      }

      this.emit('status', {
        status: 'connected',
        platform: 'tiktok',
        roomId: state ? state.roomId : null,
        message: `Terhubung langsung ke TikTok Live (@${username})`
      });

      // Start background pollers
      this.startStatsPolling();
      this.startHealthMonitor();

      return state;
    } catch (err) {
      this.stopStatsPolling();
      this.stopHealthMonitor();
      this.isConnected = false;

      let errorMsg = err.message || 'Gagal tersambung ke TikTok Live';
      const isOffline = errorMsg.includes('UserOffline') || errorMsg.includes('offline') || errorMsg.includes('status: 4');
      if (isOffline) {
        errorMsg = `User @${username} saat ini sedang TIDAK LIVE di TikTok.`;
      }

      this.emit('status', {
        status: 'error',
        platform: 'tiktok',
        message: errorMsg,
        isOffline
      });

      // Trigger auto-reconnect if not offline and allowed
      if (!isOffline && !this.isManualDisconnect && this.autoReconnect) {
        this.scheduleReconnect();
      }

      throw new Error(errorMsg);
    }
  }

  bindSocketEvents(username) {
    if (!this.connection) return;

    // Chat Message
    this.connection.on('chat', (data) => {
      this.packetsReceived++;
      const msg = this.formatChatMessage(data);
      this.emit('message', msg);
    });

    // Gift Message (Hype Alert)
    this.connection.on('gift', (data) => {
      this.packetsReceived++;
      const giftMsg = this.formatGiftMessage(data);
      this.emit('message', giftMsg);
    });

    // Likes
    this.connection.on('like', (data) => {
      this.packetsReceived++;
      const count = data.likeCount || 1;
      const total = data.totalLikeCount || 0;
      
      if (total > 0) {
        this.emit('stats', { platform: 'tiktok', likes: total });
      }

      const avatar = data.profilePictureUrl || (data.user && (data.user.profilePictureUrl || (data.user.avatarThumb && data.user.avatarThumb.urlList && data.user.avatarThumb.urlList[0]))) || '';

      const likeMsg = {
        id: 'tt_like_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        platform: 'tiktok',
        type: 'transient',
        subtype: 'like',
        isTransient: true,
        author: {
          name: data.nickname || data.uniqueId || 'Penonton',
          avatar: avatar
        },
        message: `mengirim ${count} like`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rawTimestamp: Date.now()
      };
      this.emit('message', likeMsg);
    });

    // Member Join
    this.connection.on('member', (data) => {
      this.packetsReceived++;
      const avatar = data.profilePictureUrl || (data.user && (data.user.profilePictureUrl || (data.user.avatarThumb && data.user.avatarThumb.urlList && data.user.avatarThumb.urlList[0]))) || '';

      const joinMsg = {
        id: 'tt_join_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        platform: 'tiktok',
        type: 'transient',
        subtype: 'join',
        isTransient: true,
        author: {
          name: data.nickname || data.uniqueId || 'Penonton',
          avatar: avatar
        },
        message: 'bergabung ke live',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rawTimestamp: Date.now()
      };
      this.emit('message', joinMsg);
    });

    // Social / Share / Follow
    this.connection.on('social', (data) => {
      this.packetsReceived++;
      const isFollow = data.displayType && data.displayType.includes('follow');
      const text = isFollow ? 'mulai mengikuti streamer' : 'membagikan siaran live';
      const avatar = data.profilePictureUrl || (data.user && (data.user.profilePictureUrl || (data.user.avatarThumb && data.user.avatarThumb.urlList && data.user.avatarThumb.urlList[0]))) || '';

      const socialMsg = {
        id: 'tt_social_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        platform: 'tiktok',
        type: 'transient',
        subtype: isFollow ? 'follow' : 'share',
        isTransient: true,
        author: {
          name: data.nickname || data.uniqueId || 'Penonton',
          avatar: avatar
        },
        message: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rawTimestamp: Date.now()
      };
      this.emit('message', socialMsg);
    });

    // Stream ended by host
    this.connection.on('streamEnd', () => {
      this.stopStatsPolling();
      this.stopHealthMonitor();
      this.isConnected = false;
      this.emit('status', {
        status: 'disconnected',
        platform: 'tiktok',
        message: `Live stream @${username} telah berakhir`
      });
    });

    // Unexpected disconnection (network glitch)
    this.connection.on('disconnected', () => {
      this.stopStatsPolling();
      this.stopHealthMonitor();
      this.isConnected = false;

      if (!this.isManualDisconnect && this.autoReconnect) {
        this.scheduleReconnect();
      } else {
        this.emit('status', {
          status: 'disconnected',
          platform: 'tiktok',
          message: 'Koneksi TikTok terputus'
        });
      }
    });

    this.connection.on('error', (err) => {
      console.warn('TikTok socket event error:', err && err.message ? err.message : err);
    });
  }

  scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this.emit('status', {
        status: 'error',
        platform: 'tiktok',
        message: `Gagal menyambung ulang setelah ${this.maxReconnectAttempts} percobaan. Silakan klik Sambungkan manual.`
      });
      return;
    }

    this.reconnectAttempt++;
    const delays = [3000, 5000, 8000, 12000, 15000];
    const delay = delays[this.reconnectAttempt - 1] || 10000;

    this.emit('status', {
      status: 'reconnecting',
      platform: 'tiktok',
      attempt: this.reconnectAttempt,
      maxAttempts: this.maxReconnectAttempts,
      nextRetryMs: delay,
      message: `Koneksi terputus. Mencoba reconnect otomatis (${this.reconnectAttempt}/${this.maxReconnectAttempts}) dalam ${delay / 1000}d...`
    });

    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(async () => {
      if (this.currentUsername && !this.isManualDisconnect) {
        try {
          await this.connect(this.currentUsername);
        } catch (e) {
          // Failure will trigger scheduleReconnect if attempts remain
        }
      }
    }, delay);
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  startStatsPolling() {
    this.stopStatsPolling();
    this.pollInterval = setInterval(async () => {
      if (!this.connection || !this.isConnected) return;
      try {
        const info = await this.connection.getRoomInfo();
        if (info) {
          const viewers = info.user_count || (info.stats && info.stats.user_count) || 0;
          const likes = (info.stats && info.stats.like_count) || 0;
          this.emit('stats', { platform: 'tiktok', viewers, likes });
        }
      } catch (e) {
        // Suppress temporary poll hiccups
      }
    }, 10000);
  }

  stopStatsPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  startHealthMonitor() {
    this.stopHealthMonitor();
    this.healthInterval = setInterval(async () => {
      if (!this.isConnected || !this.connection) return;
      const startTime = Date.now();
      try {
        await this.connection.getRoomInfo();
        this.lastPingMs = Date.now() - startTime;
        this.emit('health', {
          platform: 'tiktok',
          latencyMs: this.lastPingMs,
          status: this.lastPingMs < 200 ? 'excellent' : (this.lastPingMs < 600 ? 'good' : 'fair'),
          packets: this.packetsReceived
        });
      } catch (e) {
        this.emit('health', {
          platform: 'tiktok',
          latencyMs: 999,
          status: 'degraded',
          packets: this.packetsReceived
        });
      }
    }, 15000);
  }

  stopHealthMonitor() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
  }

  formatChatMessage(data) {
    const timestamp = data.createTime ? new Date(parseInt(data.createTime, 10)) : new Date();
    const avatar = data.profilePictureUrl || (data.user && (data.user.profilePictureUrl || (data.user.avatarThumb && data.user.avatarThumb.urlList && data.user.avatarThumb.urlList[0]))) || '';

    return {
      id: 'tt_' + (data.msgId || Date.now()) + '_' + Math.random().toString(36).substr(2, 5),
      platform: 'tiktok',
      type: 'chat',
      author: {
        name: data.nickname || data.uniqueId || 'TikTok User',
        username: data.uniqueId || '',
        avatar: avatar,
        badge: data.isModerator ? 'MOD' : (data.isSubscriber ? 'SUB' : ''),
        isModerator: !!data.isModerator,
        isSubscriber: !!data.isSubscriber
      },
      message: data.comment || '',
      timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawTimestamp: timestamp.getTime()
    };
  }

  formatGiftMessage(data) {
    const timestamp = new Date();
    const avatar = data.profilePictureUrl || (data.user && (data.user.profilePictureUrl || (data.user.avatarThumb && data.user.avatarThumb.urlList && data.user.avatarThumb.urlList[0]))) || '';

    return {
      id: 'tt_gift_' + (data.msgId || Date.now()) + '_' + Math.random().toString(36).substr(2, 5),
      platform: 'tiktok',
      type: 'gift',
      author: {
        name: data.nickname || data.uniqueId || 'TikTok User',
        username: data.uniqueId || '',
        avatar: avatar
      },
      gift: {
        id: data.giftId,
        name: data.giftName || 'Gift',
        count: data.repeatCount || 1,
        diamondCount: (data.diamondCount || 0) * (data.repeatCount || 1),
        icon: data.giftPictureUrl || ''
      },
      message: `mengirim ${data.giftName || 'Gift'} x${data.repeatCount || 1}`,
      timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawTimestamp: timestamp.getTime()
    };
  }

  async disconnect(isSilent = false) {
    this.isManualDisconnect = true;
    this.clearReconnectTimer();
    this.stopStatsPolling();
    this.stopHealthMonitor();

    if (this.connection) {
      try {
        await this.connection.disconnect();
      } catch (e) {
        // Suppress
      }
      this.connection = null;
    }

    this.isConnected = false;
    this.reconnectAttempt = 0;

    if (!isSilent) {
      this.emit('status', {
        status: 'disconnected',
        platform: 'tiktok',
        message: 'Koneksi TikTok telah diputuskan'
      });
    }
  }
}

module.exports = TiktokService;
