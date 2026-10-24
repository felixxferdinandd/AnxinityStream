// Official brand SVG icons and clean UI icons for AnxinityStream
const ICONS = {
  // AnxinityStream Brand Glyph
  anxinity: `<svg class="brand-glyph" viewBox="0 0 28 28" width="22" height="22" fill="none">
    <rect width="28" height="28" rx="8" fill="url(#anxinity-grad)" />
    <path d="M7 19L11.5 9L15 15.5L18.5 11L21 19" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="11.5" cy="9" r="1.5" fill="#38bdf8"/>
    <circle cx="18.5" cy="11" r="1.5" fill="#fe2c55"/>
    <defs>
      <linearGradient id="anxinity-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0f172a"/>
        <stop offset="0.5" stop-color="#1e1b4b"/>
        <stop offset="1" stop-color="#090d16"/>
      </linearGradient>
    </defs>
  </svg>`,

  // Official YouTube Logo Icon
  youtube: `<svg class="brand-icon yt-icon" viewBox="0 0 24 24" width="16" height="16" fill="none">
    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
    <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>`,

  // YouTube Inline Small Badge (12x12)
  youtubeInline: `<svg class="brand-inline-icon yt-inline" viewBox="0 0 24 24" width="12" height="12" fill="none">
    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
    <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>`,

  // Official TikTok Logo Icon
  tiktok: `<svg class="brand-icon tt-icon" viewBox="0 0 24 24" width="16" height="16" fill="none">
    <path fill="#00F2FE" d="M16.6 5.82s.51.5 1.5 1.05a6.04 6.04 0 0 0 3.9 1.13V4.2a8.86 8.86 0 0 1-2.9-1.02A6.62 6.62 0 0 1 16.6.6v5.22z"/>
    <path fill="#FE2C55" d="M12.4 12.87a3.55 3.55 0 0 1-3.55-3.55c0-.98.4-1.87 1.04-2.51l-3.32-3.32a8.23 8.23 0 0 0-2.4 5.83c0 4.56 3.7 8.26 8.26 8.26 3.84 0 7.07-2.63 7.97-6.21l-4.73-1.03a3.56 3.56 0 0 1-3.27 2.53z"/>
    <path fill="#FFFFFF" d="M16.6 5.82V.6h-4.2v14.18a3.55 3.55 0 1 1-3.55-3.55c.42 0 .82.08 1.19.22V6.67a8.25 8.25 0 0 0-1.19-.09 8.26 8.26 0 0 0-8.26 8.26c0 4.56 3.7 8.26 8.26 8.26 4.3 0 7.84-3.29 8.21-7.48V8c1.37.99 3.07 1.57 4.9 1.57V5.37c-1.92 0-3.64-.81-4.86-2.1a5.88 5.88 0 0 1-.5-1.45z"/>
  </svg>`,

  // TikTok Inline Small Badge (12x12)
  tiktokInline: `<svg class="brand-inline-icon tt-inline" viewBox="0 0 24 24" width="12" height="12" fill="none">
    <path fill="#00F2FE" d="M16.6 5.82s.51.5 1.5 1.05a6.04 6.04 0 0 0 3.9 1.13V4.2a8.86 8.86 0 0 1-2.9-1.02A6.62 6.62 0 0 1 16.6.6v5.22z"/>
    <path fill="#FE2C55" d="M12.4 12.87a3.55 3.55 0 0 1-3.55-3.55c0-.98.4-1.87 1.04-2.51l-3.32-3.32a8.23 8.23 0 0 0-2.4 5.83c0 4.56 3.7 8.26 8.26 8.26 3.84 0 7.07-2.63 7.97-6.21l-4.73-1.03a3.56 3.56 0 0 1-3.27 2.53z"/>
    <path fill="#FFFFFF" d="M16.6 5.82V.6h-4.2v14.18a3.55 3.55 0 1 1-3.55-3.55c.42 0 .82.08 1.19.22V6.67a8.25 8.25 0 0 0-1.19-.09 8.26 8.26 0 0 0-8.26 8.26c0 4.56 3.7 8.26 8.26 8.26 4.3 0 7.84-3.29 8.21-7.48V8c1.37.99 3.07 1.57 4.9 1.57V5.37c-1.92 0-3.64-.81-4.86-2.1a5.88 5.88 0 0 1-.5-1.45z"/>
  </svg>`,

  // Ghost Mode / Lock Icons
  lock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>`,

  unlock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
  </svg>`,

  // Viewers Icon
  viewers: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,

  // Like / Heart Icon
  heart: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#FE2C55" stroke="#FE2C55" stroke-width="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>`,

  // Gift Box Icon
  gift: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>`,

  // Opacity / Sliders Icon
  sliders: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>`,

  // Tutorial / Info Icon
  info: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>`,

  // Close Icon
  close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`,

  // Volume Icon
  volume: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>`,

  // Trash / Clear Icon
  trash: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`,

  // External / Expand Icon
  external: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>`,

  // Voice / TTS Icon
  voice: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>`,

  // Palette / Theme Studio Icon
  palette: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>
  </svg>`,

  // Shield / Moderation Icon
  shield: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>`,

  // Activity / Pulse Icon
  pulse: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>`,

  // Terminal / Diagnostic Icon
  terminal: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>`,

  // Refresh / Reconnect Icon
  refresh: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>`,

  // Clock / Session Timer Icon
  clock: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>`,

  // Sparks / Diamond Icon
  diamond: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 3h12l4 6-10 12L2 9z"></path>
  </svg>`
};

if (typeof module !== 'undefined') {
  module.exports = ICONS;
}
