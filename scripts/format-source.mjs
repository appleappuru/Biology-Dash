import ts from 'typescript';
import {readdir,readFile,writeFile} from 'node:fs/promises';
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});
for(const dir of ['src','tests'])for(const file of await readdir(dir)){if(!file.endsWith('.ts')||file.endsWith('.d.ts'))continue;const path=dir+'/'+file;const source=ts.createSourceFile(path,await readFile(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);await writeFile(path,printer.printFile(source));}
