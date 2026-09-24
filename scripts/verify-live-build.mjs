import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const outputDir=process.env.BUILD_DIR||'dist';
const base='https://biology-dash-public-demo.vercel.app';
const html=await readFile(outputDir+'/index.html','utf8');const files=['index.html','sw.js','version.json',...Array.from(html.matchAll(/(?:src|href)="(?:\.\/|\/)(assets\/[^"]+)"/g),m=>m[1]),'assets/defenders-v2.png'];
for(const file of files){const response=await fetch(base+'/'+file);if(!response.ok)throw Error(file+' '+response.status);const remote=Buffer.from(await response.arrayBuffer()),local=await readFile(outputDir+'/'+file);if(!remote.equals(local))throw Error('Mismatch: '+file);console.log('Verified',file,createHash('sha256').update(remote).digest('hex').slice(0,12));}
const root=await fetch(base);if(!root.headers.get('x-robots-tag')?.includes('noindex'))throw Error('No-index header missing');const robots=await(await fetch(base+'/robots.txt')).text();if(!robots.includes('Disallow: /'))throw Error('robots missing');console.log('PASS compiled assets, cache revision, public URL and no-index headers');
