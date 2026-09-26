/**
 * Biology Dash: Immune Patrol
 * Main Entry Point
 */
console.log('Biology Dash: Immune Patrol initialized');

export function initApp(): void {
  const container = document.getElementById('app-container');
  if (container) {
    console.log('Mounting Biology Dash application container');
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
}
