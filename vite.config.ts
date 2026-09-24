import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8'));
export default defineConfig({
 base:'./',define:{__APP_VERSION__:JSON.stringify(version)},
 plugins:[{name:'release-version',generateBundle(){this.emitFile({type:'asset',fileName:'version.json',source:JSON.stringify({version})+'\n'});}}],
 build:{chunkSizeWarningLimit:1600},test:{include:['tests/**/*.test.ts']}
});
