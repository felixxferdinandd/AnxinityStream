const { WebcastPushConnection } = require('tiktok-connector');
const EventEmitter = require('events');

class TiktokService extends EventEmitter {
  constructor() {
    super();
    this.connection = null;
    this.isConnected = false;
    this.currentUsername = null;
    this.pollInterval = null;
  }

  static cleanUsername(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let str = raw.trim();

    // If full URL e.g. https://www.tiktok.com/@mooniyelle/live
    const urlMatch = str.match(/tiktok\.com\/@([a-zA-Z0-9_\-\.]+)/i);
    if (urlMatch) {
      return urlMatch[1];
    }

    // Remove leading @
    if (str.startsWith('@')) {
      str = str.substring(1);
    }

    return str;
  }

  async connect(rawUsername) {
    const username = TiktokService.cleanUsername(rawUsername);
    if (!username) {
      throw new Error('Masukkan username TikTok yang valid.');
    }

    if (this.isConnected) {
      await this.disconnect();
    }

    this.currentUsername = username;
    this.emit('status', { status: 'connecting', platform: 'tiktok', target: username });

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

      // Event: Chat Message
      this.connection.on('chat', (data) => {
        const msg = this.formatChatMessage(data);
        this.emit('message', msg);
      });

      // Event: Gift (HYPE ALERT)
      this.connection.on('gift', (data) => {
        const giftMsg = this.formatGiftMessage(data);
        this.emit('message', giftMsg);
      });

      // Event: Likes (Transient - Auto disappears)
      this.connection.on('like', (data) => {
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

      // Event: Member / Join (Transient - Auto disappears)
      this.connection.on('member', (data) => {
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

      // Event: Social / Follow / Share (Transient - Auto disappears)
      this.connection.on('social', (data) => {
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

      this.connection.on('streamEnd', () => {
        this.stopStatsPolling();
        this.isConnected = false;
        this.emit('status', {
          status: 'disconnected',
          platform: 'tiktok',
          message: 'Live stream TikTok telah selesai'
        });
      });

      this.connection.on('disconnected', () => {
        this.stopStatsPolling();
        this.isConnected = false;
        this.emit('status', {
          status: 'disconnected',
          platform: 'tiktok',
          message: 'Koneksi TikTok terputus'
        });
      });

      this.connection.on('error', (err) => {
        console.error('TikTok socket notice:', err && err.message ? err.message : err);
      });

      // Connect directly to live stream
      const state = await this.connection.connect();
      this.isConnected = true;

      // Extract initial room stats
      if (state && state.roomInfo) {
        const viewers = state.roomInfo.user_count || (state.roomInfo.stats && state.roomInfo.stats.user_count) || 0;
        const likes = (state.roomInfo.stats && state.roomInfo.stats.like_count) || 0;
        this.emit('stats', { platform: 'tiktok', viewers, likes });
      }

      this.emit('status', {
        status: 'connected',
        platform: 'tiktok',
        roomId: state.roomId,
        message: `Terhubung langsung ke TikTok Live (@${username})`
      });

      // Poll room info every 12 seconds for viewer count updates
      this.startStatsPolling();

      return state;
    } catch (err) {
      this.stopStatsPolling();
      this.isConnected = false;
      let errorMsg = err.message || 'Gagal tersambung ke TikTok Live';
      if (errorMsg.includes('UserOffline') || errorMsg.includes('offline') || errorMsg.includes('status: 4')) {
        errorMsg = `User @${username} saat ini sedang TIDAK LIVE di TikTok.`;
      }
      this.emit('status', {
        status: 'error',
        platform: 'tiktok',
        message: errorMsg
      });
      throw new Error(errorMsg);
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
        // ignore polling hiccups
      }
    }, 12000);
  }

  stopStatsPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
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

  async disconnect() {
    this.stopStatsPolling();
    if (this.connection) {
      try {
        await this.connection.disconnect();
      } catch (e) {
        // ignore
      }
      this.connection = null;
    }
    this.isConnected = false;
    this.emit('status', {
      status: 'disconnected',
      platform: 'tiktok',
      message: 'Koneksi TikTok terputus'
    });
  }
}

module.exports = TiktokService;
