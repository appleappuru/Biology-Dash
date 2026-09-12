import type { CapacitorConfig } from '@capacitor/cli';
// DEVELOPMENT ONLY. Replace with an owner-approved identifier before store distribution.
const config: CapacitorConfig = {
  appId: 'dev.biologydash.immune',
  appName: 'Biology Dash',
  webDir: 'dist',
  backgroundColor: '#071e29',
  ios: { contentInset: 'automatic', backgroundColor: '#071e29' },
  android: { backgroundColor: '#071e29', allowMixedContent: false },
};
export default config;
