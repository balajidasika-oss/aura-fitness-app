const fs = require('fs');
const path = require('path');

const clientSrcDir = path.join(__dirname, 'client', 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir(clientSrcDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Replace hardcoded whites and blacks
  content = content.replace(/bg-white/g, 'bg-[var(--surface)]');
  content = content.replace(/bg-\[#FFFFFF\]/g, 'bg-transparent');
  content = content.replace(/bg-\[#F5F5F7\]/g, 'bg-[var(--surface)]');
  content = content.replace(/bg-\[#FAFAFA\]/g, 'bg-transparent');
  
  content = content.replace(/text-black/g, 'text-white');
  content = content.replace(/text-slate-950/g, 'text-white');
  content = content.replace(/text-\[#1C1C1E\]/g, 'text-gray-200');
  
  content = content.replace(/border-\[#EAEAEE\]/g, 'border-[var(--border)]');
  
  // Update glass panels to have better glow in dark mode
  content = content.replace(/shadow-sm/g, 'shadow-[0_4px_20px_rgba(0,0,0,0.2)]');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedCount++;
    console.log(`Updated: ${path.relative(clientSrcDir, filePath)}`);
  }
});

console.log(`\nAurora Dark Theme reskin complete! Modified ${modifiedCount} files.`);
