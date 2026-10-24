const { LiveChat } = require('youtube-chat');
const EventEmitter = require('events');

class YoutubeService extends EventEmitter {
  constructor() {
    super();
    this.liveChat = null;
    this.isConnected = false;
    this.isManualDisconnect = false;
    this.currentInput = null;
    this.parsedTarget = null;
    
    // Auto-reconnect
    this.autoReconnect = true;
    this.reconnectAttempt = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimer = null;
    this.packetsReceived = 0;
  }

  /**
   * Parse various YouTube URL formats or IDs into an object accepted by LiveChat
   */
  static parseInput(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return null;
    let str = rawInput.trim();

    // Remove tracking queries like &ab_channel=..., &feature=..., etc.
    // but preserve ?v=...
    const urlObj = str.match(/^https?:\/\/[^\s]+/i);
    if (urlObj) {
      try {
        const parsed = new URL(str);
        // If it's a watch URL
        if (parsed.searchParams.has('v')) {
          return { liveId: parsed.searchParams.get('v') };
        }
        // If it's /live/VIDEO_ID or /@handle
        const pathname = parsed.pathname;
        if (pathname.startsWith('/live/')) {
          const id = pathname.replace('/live/', '').split('/')[0];
          if (id) return { liveId: id };
        }
        if (pathname.startsWith('/@')) {
          return { handle: pathname.split('/')[1] || pathname };
        }
        if (pathname.startsWith('/channel/')) {
          return { channelId: pathname.replace('/channel/', '').split('/')[0] };
        }
      } catch (e) {
        // Fall back to regex
      }
    }

    // 1. Direct handle: @Channel
    if (str.startsWith('@')) {
      return { handle: str };
    }

    // 2. URL with handle: youtube.com/@handle
    const handleMatch = str.match(/youtube\.com\/@([a-zA-Z0-9_\-\.]+)/i);
    if (handleMatch) {
      return { handle: '@' + handleMatch[1] };
    }

    // 3. Channel URL: youtube.com/channel/UC...
    const channelMatch = str.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_\-]{22})/i);
    if (channelMatch) {
      return { channelId: channelMatch[1] };
    }

    // 4. Direct Channel ID: starts with UC and is 24 characters
    if (/^UC[a-zA-Z0-9_\-]{22}$/.test(str)) {
      return { channelId: str };
    }

    // 5. Watch URL: ?v=VIDEO_ID
    const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_\-]{11})/i);
    if (watchMatch) {
      return { liveId: watchMatch[1] };
    }

    // 6. youtu.be/VIDEO_ID or youtube.com/live/VIDEO_ID
    const shortMatch = str.match(/(?:youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_\-]{11})/i);
    if (shortMatch) {
      return { liveId: shortMatch[1] };
    }

    // 7. Direct 11-char Video ID
    if (/^[a-zA-Z0-9_\-]{11}$/.test(str)) {
      return { liveId: str };
    }

    // Default fallback: assume it is a channel handle
    return { handle: str.startsWith('@') ? str : '@' + str };
  }

  async connect(rawInput) {
    const target = YoutubeService.parseInput(rawInput);
    if (!target) {
      throw new Error('Link atau ID YouTube tidak valid. Masukkan URL Video Live, Video ID, atau Handle @Channel.');
    }

    this.clearReconnectTimer();
    this.isManualDisconnect = false;

    if (this.isConnected) {
      await this.disconnect(true);
    }

    this.currentInput = rawInput;
    this.parsedTarget = target;
    this.emit('status', { 
      status: 'connecting', 
      platform: 'youtube', 
      target,
      attempt: this.reconnectAttempt > 0 ? this.reconnectAttempt : undefined
    });

    try {
      this.liveChat = new LiveChat(target);

      this.liveChat.on('start', (liveId) => {
        this.isConnected = true;
        this.reconnectAttempt = 0;
        this.emit('status', {
          status: 'connected',
          platform: 'youtube',
          liveId,
          message: `Terhubung langsung ke YouTube Live (${liveId})`
        });
      });

      this.liveChat.on('end', (reason) => {
        this.isConnected = false;
        if (!this.isManualDisconnect && this.autoReconnect) {
          this.scheduleReconnect();
        } else {
          this.emit('status', {
            status: 'disconnected',
            platform: 'youtube',
            message: reason || 'Live stream YouTube telah berakhir'
          });
        }
      });

      this.liveChat.on('error', (err) => {
        const errorMsg = err && err.message ? err.message : String(err);
        this.isConnected = false;
        
        if (!this.isManualDisconnect && this.autoReconnect) {
          this.scheduleReconnect();
        } else {
          this.emit('status', {
            status: 'error',
            platform: 'youtube',
            message: `Error YouTube: ${errorMsg}`
          });
        }
      });

      this.liveChat.on('chat', (chatItem) => {
        this.packetsReceived++;
        const parsed = this.formatChatMessage(chatItem);
        this.emit('message', parsed);
      });

      // Timeout race: 14s max
      const startPromise = this.liveChat.start();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Koneksi YouTube time out (14 detik). Pastikan channel sedang LIVE.')), 14000);
      });

      const started = await Promise.race([startPromise, timeoutPromise]);
      if (!started) {
        throw new Error('Gagal memulai koneksi YouTube Live. Pastikan channel sedang aktif siaran.');
      }

      return true;
    } catch (err) {
      this.isConnected = false;
      const errorMsg = err.message || 'Gagal tersambung ke YouTube Live';
      this.emit('status', {
        status: 'error',
        platform: 'youtube',
        message: errorMsg
      });

      if (!this.isManualDisconnect && this.autoReconnect && !errorMsg.includes('tidak valid')) {
        this.scheduleReconnect();
      }

      throw new Error(errorMsg);
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this.emit('status', {
        status: 'error',
        platform: 'youtube',
        message: `Gagal menyambung ulang YouTube setelah ${this.maxReconnectAttempts} percobaan.`
      });
      return;
    }

    this.reconnectAttempt++;
    const delays = [3000, 5000, 8000, 12000, 15000];
    const delay = delays[this.reconnectAttempt - 1] || 10000;

    this.emit('status', {
      status: 'reconnecting',
      platform: 'youtube',
      attempt: this.reconnectAttempt,
      maxAttempts: this.maxReconnectAttempts,
      nextRetryMs: delay,
      message: `Koneksi YouTube terputus. Mencoba reconnect otomatis (${this.reconnectAttempt}/${this.maxReconnectAttempts}) dalam ${delay / 1000}d...`
    });

    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(async () => {
      if (this.currentInput && !this.isManualDisconnect) {
        try {
          await this.connect(this.currentInput);
        } catch (e) {
          // Failure handled in catch
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

  formatChatMessage(chatItem) {
    let messageText = '';
    if (Array.isArray(chatItem.message)) {
      messageText = chatItem.message
        .map((part) => {
          if (part.text) return part.text;
          if (part.emojiText) return part.emojiText;
          return '';
        })
        .join('');
    } else if (typeof chatItem.message === 'string') {
      messageText = chatItem.message;
    }

    const timestamp = chatItem.timestamp ? new Date(chatItem.timestamp) : new Date();

    const result = {
      id: chatItem.id || 'yt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      platform: 'youtube',
      type: 'chat',
      author: {
        name: chatItem.author ? chatItem.author.name : 'YouTube User',
        channelId: chatItem.author ? chatItem.author.channelId : '',
        avatar: chatItem.author && chatItem.author.thumbnail ? chatItem.author.thumbnail.url : '',
        badge: chatItem.author && chatItem.author.badge ? chatItem.author.badge.label : '',
        isOwner: !!chatItem.isOwner,
        isModerator: !!chatItem.isModerator,
        isMember: !!chatItem.isMembership
      },
      message: messageText,
      timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawTimestamp: timestamp.getTime()
    };

    if (chatItem.superchat) {
      result.type = 'superchat';
      result.superchat = {
        amount: chatItem.superchat.amount,
        color: chatItem.superchat.color || '#E62117',
        sticker: chatItem.superchat.sticker ? chatItem.superchat.sticker.url : null
      };
    }

    return result;
  }

  async disconnect(isSilent = false) {
    this.isManualDisconnect = true;
    this.clearReconnectTimer();

    if (this.liveChat) {
      try {
        await this.liveChat.stop();
      } catch (e) {
        // Suppress
      }
      this.liveChat = null;
    }

    this.isConnected = false;
    this.reconnectAttempt = 0;

    if (!isSilent) {
      this.emit('status', {
        status: 'disconnected',
        platform: 'youtube',
        message: 'Koneksi YouTube telah diputuskan'
      });
    }
  }
}

module.exports = YoutubeService;
