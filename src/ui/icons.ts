/**
 * Biology Dash: Immune Patrol
 * Volumetric 2.5D UI Icons
 * Replaces all native Unicode emojis with crisp, tactile, resolution-independent 3D icons.
 */

export function iconHeart3D(size: number = 22): string {
  return `
    <svg class="icon-3d icon-3d-heart" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heartGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ff9999" />
          <stop offset="55%" stop-color="#ff4757" />
          <stop offset="100%" stop-color="#b31224" />
        </radialGradient>
        <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(179,18,36,0.5)" />
        </filter>
      </defs>
      <path filter="url(#heartShadow)" d="M16 28C16 28 3 20 3 11.5C3 6.8 6.8 3 11.5 3C13.8 3 15.2 4.2 16 5.2C16.8 4.2 18.2 3 20.5 3C25.2 3 29 6.8 29 11.5C29 20 16 28 16 28Z" fill="url(#heartGrad)" />
      <!-- Specular gloss highlights -->
      <ellipse cx="10" cy="9" rx="3.5" ry="2" transform="rotate(-30 10 9)" fill="white" fill-opacity="0.75" />
      <circle cx="21" cy="8" r="1.8" fill="white" fill-opacity="0.6" />
    </svg>
  `.trim();
}

export function iconCoin3D(size: number = 20): string {
  return `
    <svg class="icon-3d icon-3d-coin" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coinRim" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fff3bf" />
          <stop offset="45%" stop-color="#fcc419" />
          <stop offset="100%" stop-color="#d9480f" />
        </linearGradient>
        <linearGradient id="coinFace" x1="32" y1="32" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#e67700" />
          <stop offset="60%" stop-color="#fab005" />
          <stop offset="100%" stop-color="#ffe066" />
        </linearGradient>
        <filter id="coinShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(217,72,15,0.4)" />
        </filter>
      </defs>
      <!-- Rim -->
      <circle filter="url(#coinShadow)" cx="16" cy="16" r="14" fill="url(#coinRim)" />
      <!-- Recessed Face -->
      <circle cx="16" cy="16" r="10.5" fill="url(#coinFace)" stroke="#f59f00" stroke-width="1.2" />
      <!-- Center Emblem C -->
      <path d="M19 11.5C18.2 10.6 17.1 10 15.8 10C12.8 10 10.8 12.6 10.8 16C10.8 19.4 12.8 22 15.8 22C17.1 22 18.2 21.4 19 20.5" stroke="#fff9db" stroke-width="2.6" stroke-linecap="round" />
      <!-- Rim highlight -->
      <path d="M6 10C8.5 6 12.5 4 16 4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.8" />
    </svg>
  `.trim();
}

export function iconSurge3D(size: number = 22): string {
  return `
    <svg class="icon-3d icon-3d-surge" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="surgeGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fff9db" />
          <stop offset="35%" stop-color="#ffd43b" />
          <stop offset="100%" stop-color="#f59f00" />
        </linearGradient>
        <filter id="surgeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ffd43b" flood-opacity="0.8" />
        </filter>
      </defs>
      <path filter="url(#surgeGlow)" d="M18 2L5 17H16L13 30L27 14H16L18 2Z" fill="url(#surgeGrad)" stroke="#ffe066" stroke-width="1.5" stroke-linejoin="round" />
      <!-- Inner core highlight -->
      <path d="M17 5L8 16H15L13.5 24L22 14H15L17 5Z" fill="#ffffff" fill-opacity="0.65" />
    </svg>
  `.trim();
}

export function iconCapsule3D(topColor: string = '#55efc4', bottomColor: string = '#dfe6e9', size: number = 22): string {
  return `
    <svg class="icon-3d icon-3d-capsule" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="capTop_${topColor.replace('#', '')}" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
          <stop offset="30%" stop-color="${topColor}" />
          <stop offset="100%" stop-color="${topColor}" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="capBot_${bottomColor.replace('#', '')}" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="60%" stop-color="${bottomColor}" />
          <stop offset="100%" stop-color="#b2bec3" />
        </linearGradient>
        <filter id="capShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)" />
        </filter>
      </defs>
      <g filter="url(#capShadow)" transform="rotate(-45 16 16)">
        <!-- Top Half -->
        <path d="M11 6C11 3.2 13.2 1 16 1C18.8 1 21 3.2 21 6V15H11V6Z" fill="url(#capTop_${topColor.replace('#', '')})" />
        <!-- Bottom Half -->
        <path d="M11 15H21V26C21 28.8 18.8 31 16 31C13.2 31 11 28.8 11 26V15Z" fill="url(#capBot_${bottomColor.replace('#', '')})" />
        <!-- Seam line -->
        <line x1="11" y1="15" x2="21" y2="15" stroke="rgba(0,0,0,0.25)" stroke-width="1" />
        <!-- Specular reflection streak -->
        <path d="M13 5C13 3.5 14.5 2.5 16 2.5V29.5C14.5 29.5 13 28.5 13 27V5Z" fill="white" fill-opacity="0.4" />
      </g>
    </svg>
  `.trim();
}

export function iconKit3D(size: number = 22): string {
  return `
    <svg class="icon-3d icon-3d-kit" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kitBody" x1="0" y1="8" x2="0" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff7675" />
          <stop offset="100%" stop-color="#d63031" />
        </linearGradient>
        <filter id="kitShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(214,48,49,0.4)" />
        </filter>
      </defs>
      <!-- Handle -->
      <path d="M11 8V5C11 3.9 11.9 3 13 3H19C20.1 3 21 3.9 21 5V8" stroke="#dfe6e9" stroke-width="2.5" stroke-linecap="round" />
      <!-- Body -->
      <rect filter="url(#kitShadow)" x="3" y="8" width="26" height="20" rx="5" fill="url(#kitBody)" stroke="#ff9f43" stroke-width="1.2" />
      <!-- Beveled Cross -->
      <rect x="13.5" y="12" width="5" height="12" rx="1.5" fill="#ffffff" />
      <rect x="10" y="15.5" width="12" height="5" rx="1.5" fill="#ffffff" />
      <!-- Glint -->
      <circle cx="6" cy="11" r="1.5" fill="white" fill-opacity="0.8" />
    </svg>
  `.trim();
}

export function iconPause3D(size: number = 18): string {
  return `
    <svg class="icon-3d icon-3d-pause" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pauseGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#81ecec" />
          <stop offset="100%" stop-color="#00cec9" />
        </linearGradient>
      </defs>
      <rect x="5" y="4" width="5" height="16" rx="2.5" fill="url(#pauseGrad)" />
      <rect x="14" y="4" width="5" height="16" rx="2.5" fill="url(#pauseGrad)" />
      <!-- Top highlight glints -->
      <ellipse cx="7.5" cy="6" rx="1.5" ry="1" fill="white" fill-opacity="0.7" />
      <ellipse cx="16.5" cy="6" rx="1.5" ry="1" fill="white" fill-opacity="0.7" />
    </svg>
  `.trim();
}

export function iconPlay3D(size: number = 18): string {
  return `
    <svg class="icon-3d icon-3d-play" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="playGrad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#55efc4" />
          <stop offset="100%" stop-color="#00b894" />
        </linearGradient>
        <filter id="playShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="rgba(0,184,148,0.4)" />
        </filter>
      </defs>
      <path filter="url(#playShadow)" d="M6 4.5C6 3.6 7 3.1 7.8 3.6L20.2 11.1C20.9 11.5 20.9 12.5 20.2 12.9L7.8 20.4C7 20.9 6 20.4 6 19.5V4.5Z" fill="url(#playGrad)" stroke="#a8ffeb" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Highlight -->
      <path d="M8 7L16 12L8 14V7Z" fill="white" fill-opacity="0.35" />
    </svg>
  `.trim();
}

export function iconStar3D(filled: boolean = true, size: number = 18): string {
  if (!filled) {
    return `
      <svg class="icon-3d icon-3d-star empty" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-linejoin="round" fill="rgba(255,255,255,0.05)" />
      </svg>
    `.trim();
  }

  return `
    <svg class="icon-3d icon-3d-star" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="starGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fff9db" />
          <stop offset="50%" stop-color="#ffd43b" />
          <stop offset="100%" stop-color="#f59f00" />
        </linearGradient>
        <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(245,159,0,0.55)" />
        </filter>
      </defs>
      <path filter="url(#starGlow)" d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGrad)" stroke="#ffe066" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Facet shading for 3D effect -->
      <path d="M12 2V17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" fill-opacity="0.25" />
    </svg>
  `.trim();
}

export function iconLock3D(size: number = 18): string {
  return `
    <svg class="icon-3d icon-3d-lock" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lockBody" x1="0" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffd43b" />
          <stop offset="100%" stop-color="#f59f00" />
        </linearGradient>
      </defs>
      <!-- Shackle -->
      <path d="M7 9V6C7 3.2 9.2 1 12 1C14.8 1 17 3.2 17 6V9" stroke="#dfe6e9" stroke-width="3" stroke-linecap="round" />
      <!-- Body -->
      <rect x="4" y="9" width="16" height="13" rx="3.5" fill="url(#lockBody)" stroke="#fcc419" stroke-width="1" />
      <!-- Keyhole -->
      <circle cx="12" cy="14" r="2" fill="#0f172a" />
      <path d="M11 14H13L13.5 18H10.5L11 14Z" fill="#0f172a" />
    </svg>
  `.trim();
}

export function iconRetry3D(size: number = 18): string {
  return `
    <svg class="icon-3d icon-3d-retry" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="retryGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#74b9ff" />
          <stop offset="100%" stop-color="#0984e3" />
        </linearGradient>
      </defs>
      <path d="M4 12C4 7.6 7.6 4 12 4C15.5 4 18.5 6.2 19.5 9.5" stroke="url(#retryGrad)" stroke-width="3" stroke-linecap="round" />
      <path d="M20 12C20 16.4 16.4 20 12 20C8.5 20 5.5 17.8 4.5 14.5" stroke="url(#retryGrad)" stroke-width="3" stroke-linecap="round" />
      <path d="M20 4V10H14" stroke="url(#retryGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M4 20V14H10" stroke="url(#retryGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `.trim();
}

export function iconRocket3D(size: number = 20): string {
  return `
    <svg class="icon-3d icon-3d-rocket" width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rockBody" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#dfe6e9" />
        </linearGradient>
        <linearGradient id="rockFin" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff7675" />
          <stop offset="100%" stop-color="#d63031" />
        </linearGradient>
      </defs>
      <!-- Fins -->
      <path d="M8 18L4 22V16L8 14V18Z" fill="url(#rockFin)" />
      <path d="M20 18L24 22V16L20 14V18Z" fill="url(#rockFin)" />
      <!-- Body -->
      <path d="M14 2C9 6 8 13 8 20H20C20 13 19 6 14 2Z" fill="url(#rockBody)" />
      <!-- Nosecone -->
      <path d="M14 2C11.5 4 10 7.5 10 10H18C18 7.5 16.5 4 14 2Z" fill="url(#rockFin)" />
      <!-- Port window -->
      <circle cx="14" cy="14" r="3" fill="#81ecec" stroke="#00cec9" stroke-width="1.5" />
      <!-- Flame Exhaust -->
      <path d="M11 20L14 26L17 20H11Z" fill="#ff9f43" />
      <path d="M12.5 20L14 24L15.5 20H12.5Z" fill="#ffd43b" />
    </svg>
  `.trim();
}

export function iconLightbulb3D(size: number = 18): string {
  return `
    <svg class="icon-3d icon-3d-bulb" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bulbGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fff9db" />
          <stop offset="50%" stop-color="#ffd43b" />
          <stop offset="100%" stop-color="#f59f00" />
        </radialGradient>
      </defs>
      <!-- Glass bulb -->
      <path d="M12 2C7.6 2 4 5.6 4 10C4 13.1 5.8 15.8 8.4 17.1L9 19H15L15.6 17.1C18.2 15.8 20 13.1 20 10C20 5.6 16.4 2 12 2Z" fill="url(#bulbGrad)" stroke="#ffe066" stroke-width="1" />
      <!-- Base screw -->
      <rect x="9.5" y="19" width="5" height="3" rx="1" fill="#b2bec3" />
      <path d="M10.5 22H13.5L12 23.5L10.5 22Z" fill="#636e72" />
    </svg>
  `.trim();
}

export function iconParty3D(size: number = 20): string {
  return `
    <svg class="icon-3d icon-3d-party" width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 3D Ribbon rosette -->
      <circle cx="14" cy="12" r="9" fill="#ff7675" stroke="#ffeaa7" stroke-width="2" />
      <polygon points="14,6 16,10 20,11 17,14 18,18 14,16 10,18 11,14 8,11 12,10" fill="#ffd43b" />
      <path d="M10 20L7 26L12 24L14 26L16 24L21 26L18 20" fill="#fdcb6e" />
    </svg>
  `.trim();
}

export function iconSleep3D(size: number = 20): string {
  return `
    <svg class="icon-3d icon-3d-sleep" width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="moonGrad" x1="4" y1="2" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fff9db" />
          <stop offset="70%" stop-color="#ffd43b" />
          <stop offset="100%" stop-color="#fab005" />
        </linearGradient>
      </defs>
      <!-- Crescent moon -->
      <path d="M18 4C11.4 4 6 9.4 6 16C6 21.5 9.7 26.1 14.8 27.5C13 25.1 12 22.2 12 19C12 11.8 17.8 6 25 6C23.1 4.7 20.6 4 18 4Z" fill="url(#moonGrad)" />
      <!-- Star twinkle -->
      <circle cx="21" cy="14" r="1.5" fill="#ffeaa7" />
      <circle cx="17" cy="22" r="1.2" fill="#ffeaa7" />
    </svg>
  `.trim();
}

export function iconInfo3D(size: number = 18): string {
  return `
    <svg class="icon-3d icon-3d-info" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="infoGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#81ecec" />
          <stop offset="100%" stop-color="#00cec9" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#infoGrad)" />
      <circle cx="12" cy="7.5" r="1.5" fill="#0f172a" />
      <rect x="10.5" y="10.5" width="3" height="7" rx="1.5" fill="#0f172a" />
    </svg>
  `.trim();
}

export function iconMap3D(size: number = 18): string {
  return `
    <svg class="icon-3d icon-3d-map" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#74b9ff" />
          <stop offset="100%" stop-color="#0984e3" />
        </linearGradient>
      </defs>
      <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" fill="url(#mapGrad)" stroke="#a0c4ff" stroke-width="1.2" stroke-linejoin="round" />
      <line x1="9" y1="3" x2="9" y2="18" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
      <line x1="15" y1="6" x2="15" y2="21" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
    </svg>
  `.trim();
}

export function iconUpgradeCategory3D(key: string, size: number = 32): string {
  switch (key) {
    case 'speed':
      return `
        <svg class="icon-3d icon-cat-speed" width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="rgba(255,234,167,0.15)" stroke="#ffeaa7" stroke-width="2" />
          <path d="M21 4L7 19H18L15 32L29 17H18L21 4Z" fill="url(#surgeGrad)" stroke="#ffe066" stroke-width="1.2" />
        </svg>
      `.trim();
    case 'reach':
      return `
        <svg class="icon-3d icon-cat-reach" width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="rgba(85,239,196,0.15)" stroke="#55efc4" stroke-width="2" />
          <!-- Pseudopod engulfing arms -->
          <path d="M8 20C8 13.4 13.4 8 20 8C23.5 8 26.6 9.5 28.8 11.9C29.6 12.7 29.3 14 28.2 14.3C25 15.2 22 17.5 21 21C20.3 23.5 21 26 22 28C22.5 29 21.8 30 20.7 29.8C13.6 28.8 8 24.8 8 20Z" fill="#55efc4" />
          <circle cx="20" cy="16" r="3.5" fill="#ffeaa7" />
        </svg>
      `.trim();
    case 'initialSquad':
      return `
        <svg class="icon-3d icon-cat-squad" width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="rgba(255,118,117,0.15)" stroke="#ff7675" stroke-width="2" />
          <circle cx="14" cy="15" r="5" fill="#ffffff" stroke="#ff7675" stroke-width="1.5" />
          <circle cx="22" cy="15" r="5" fill="#ffffff" stroke="#ff7675" stroke-width="1.5" />
          <circle cx="18" cy="23" r="6" fill="#ffffff" stroke="#ff7675" stroke-width="1.5" />
          <!-- Cute faces -->
          <circle cx="13" cy="14" r="0.8" fill="#1e293b" /><circle cx="15" cy="14" r="0.8" fill="#1e293b" />
          <circle cx="21" cy="14" r="0.8" fill="#1e293b" /><circle cx="23" cy="14" r="0.8" fill="#1e293b" />
          <circle cx="16.5" cy="22" r="1" fill="#1e293b" /><circle cx="19.5" cy="22" r="1" fill="#1e293b" />
        </svg>
      `.trim();
    case 'cytokineRate':
    default:
      return `
        <svg class="icon-3d icon-cat-flask" width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="rgba(162,155,254,0.15)" stroke="#a29bfe" stroke-width="2" />
          <!-- Erlenmeyer Flask -->
          <path d="M16 6V13L10 25C9 27 10.5 29 12.8 29H23.2C25.5 29 27 27 26 25L20 13V6H16Z" fill="#a29bfe" stroke="#dcdde1" stroke-width="1.5" stroke-linejoin="round" />
          <!-- Glowing Liquid -->
          <path d="M12.5 22L11 25C10.5 26 11.2 27.5 12.5 27.5H23.5C24.8 27.5 25.5 26 25 25L23.5 22H12.5Z" fill="#55efc4" />
          <circle cx="16" cy="24" r="1.5" fill="#ffffff" fill-opacity="0.8" />
          <circle cx="20" cy="25" r="1" fill="#ffffff" fill-opacity="0.8" />
        </svg>
      `.trim();
  }
}
