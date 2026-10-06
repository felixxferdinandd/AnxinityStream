const { LiveChat } = require('youtube-chat');
const EventEmitter = require('events');

class YoutubeService extends EventEmitter {
  constructor() {
    super();
    this.liveChat = null;
    this.isConnected = false;
    this.currentInput = null;
  }

  /**
   * Parse various YouTube URL formats or IDs into an object accepted by LiveChat
   * Accepted:
   * - https://www.youtube.com/watch?v=VIDEO_ID
   * - https://youtu.be/VIDEO_ID
   * - https://www.youtube.com/live/VIDEO_ID
   * - https://www.youtube.com/@ChannelHandle
   * - @ChannelHandle
   * - https://www.youtube.com/channel/UCxxxxxx
   * - UCxxxxxx (24 chars)
   * - VIDEO_ID (11 chars)
   */
  static parseInput(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return null;
    const str = rawInput.trim();

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

    if (this.isConnected) {
      await this.disconnect();
    }

    this.currentInput = rawInput;
    this.emit('status', { status: 'connecting', platform: 'youtube', target });

    try {
      this.liveChat = new LiveChat(target);

      this.liveChat.on('start', (liveId) => {
        this.isConnected = true;
        this.emit('status', {
          status: 'connected',
          platform: 'youtube',
          liveId,
          message: `Terhubung ke YouTube Live (${liveId})`
        });
      });

      this.liveChat.on('end', (reason) => {
        this.isConnected = false;
        this.emit('status', {
          status: 'disconnected',
          platform: 'youtube',
          message: reason || 'Live stream YouTube telah berakhir'
        });
      });

      this.liveChat.on('error', (err) => {
        const errorMsg = err && err.message ? err.message : String(err);
        this.emit('status', {
          status: 'error',
          platform: 'youtube',
          message: `Error YouTube: ${errorMsg}`
        });
      });

      this.liveChat.on('chat', (chatItem) => {
        const parsed = this.formatChatMessage(chatItem);
        this.emit('message', parsed);
      });

      const started = await this.liveChat.start();
      if (!started) {
        throw new Error('Gagal memulai koneksi YouTube Live. Pastikan channel sedang LIVE.');
      }

      return true;
    } catch (err) {
      this.isConnected = false;
      this.emit('status', {
        status: 'error',
        platform: 'youtube',
        message: err.message || 'Gagal tersambung ke YouTube Live'
      });
      throw err;
    }
  }

  formatChatMessage(chatItem) {
    // Extract message text / emojis
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

    // Check for SuperChat / SuperSticker
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

  async disconnect() {
    if (this.liveChat) {
      try {
        this.liveChat.stop('User disconnected');
      } catch (e) {
        // ignore
      }
      this.liveChat = null;
    }
    this.isConnected = false;
    this.emit('status', {
      status: 'disconnected',
      platform: 'youtube',
      message: 'Koneksi YouTube terputus'
    });
  }
}

module.exports = YoutubeService;
