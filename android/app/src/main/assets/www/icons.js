// Official brand SVG icons and clean UI icons for AnxinityStream Mobile
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

  // YouTube Inline Small Badge (14x14)
  youtubeInline: `<svg class="brand-inline-icon yt-inline" viewBox="0 0 24 24" width="14" height="14" fill="none">
    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
    <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>`,

  // TikTok Inline Small Badge (14x14)
  tiktokInline: `<svg class="brand-inline-icon tt-inline" viewBox="0 0 24 24" width="14" height="14" fill="none">
    <path fill="#00F2FE" d="M16.6 5.82s.51.5 1.5 1.05a6.04 6.04 0 0 0 3.9 1.13V4.2a8.86 8.86 0 0 1-2.9-1.02A6.62 6.62 0 0 1 16.6.6v5.22z"/>
    <path fill="#FE2C55" d="M12.4 12.87a3.55 3.55 0 0 1-3.55-3.55c0-.98.4-1.87 1.04-2.51l-3.32-3.32a8.23 8.23 0 0 0-2.4 5.83c0 4.56 3.7 8.26 8.26 8.26 3.84 0 7.07-2.63 7.97-6.21l-4.73-1.03a3.56 3.56 0 0 1-3.27 2.53z"/>
    <path fill="#FFFFFF" d="M16.6 5.82V.6h-4.2v14.18a3.55 3.55 0 1 1-3.55-3.55c.42 0 .82.08 1.19.22V6.67a8.25 8.25 0 0 0-1.19-.09 8.26 8.26 0 0 0-8.26 8.26c0 4.56 3.7 8.26 8.26 8.26 4.3 0 7.84-3.29 8.21-7.48V8c1.37.99 3.07 1.57 4.9 1.57V5.37c-1.92 0-3.64-.81-4.86-2.1a5.88 5.88 0 0 1-.5-1.45z"/>
  </svg>`,

  // Viewers Icon
  viewers: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,

  // Like / Heart Icon
  heart: `<svg viewBox="0 0 24 24" width="14" height="14" fill="#FE2C55" stroke="#FE2C55" stroke-width="1.5">
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

  // Clock / Timer
  clock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>`,

  // Settings Gear Icon
  settings: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>`,

  // WiFi / Connect Icon
  wifi: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>`,

  // Clear / Trash Icon
  trash: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`
};
