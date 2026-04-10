const fs = require('fs');
const path = require('path');
const root = 'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js';
const target = "import { confirmDelete } from '@/Utils/confirmDelete';";

function walk(dir, out=[]) { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const f=path.join(dir,e.name); if(e.isDirectory()) walk(f,out); else if(e.isFile() && f.endsWith('.jsx')) out.push(f);} return out; }

let changed=0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file,'utf8');
  const lines = text.split(/\r?\n/);
  let modified = false;

  // remove bad inline import inside import block
  for (let i=1; i<lines.length; i++) {
    if (lines[i].trim() === target && lines[i-1].trim() === 'import {') {
      lines.splice(i,1);
      modified = true;
      i--;
    }
  }

  const uses = lines.join('\n').includes('confirmDelete(');
  const hasImport = lines.some(l => l.trim() === target);
  if (uses && !hasImport) {
    let insertAt = 0;
    for (let i=0;i<lines.length;i++) if (lines[i].startsWith('import ')) insertAt = i+1;
    lines.splice(insertAt,0,target);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, lines.join('\n'),'utf8');
    changed++;
  }
}
console.log('changed_files=' + changed);
