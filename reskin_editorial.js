const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replacements = [
  // 1. Base Backgrounds to Pure White
  { regex: /bg-\[#F4F2EC\]/g, replace: 'bg-[#FFFFFF]' },
  
  // 2. Cards to crisp very light grey
  { regex: /bg-white shadow-sm/g, replace: 'bg-white border border-[#EAEAEE] shadow-sm' },
  { regex: /bg-\[#EAF0EA\]/g, replace: 'bg-[#F5F5F7]' }, // Replace sage with Apple-style light grey
  
  // 3. Borders to ultra-light grey
  { regex: /border-\[#E6E4DD\]/g, replace: 'border-[#EAEAEE]' },
  
  // 4. Text to pure black and neutral greys (Zero Green!)
  { regex: /text-\[#2D332F\]/g, replace: 'text-black' },
  { regex: /text-\[#4A5C4F\]/g, replace: 'text-[#1C1C1E]' },
  { regex: /text-\[#7A8277\]/g, replace: 'text-[#8E8E93]' },
  
  // 5. The Accent Color: Striking Vermilion (Orange/Red) - absolutely no green.
  { regex: /bg-\[#C27359\] text-white shadow-md/g, replace: 'bg-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/20' },
  { regex: /bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400/g, replace: 'bg-[#FF3B30]' },
  { regex: /bg-emerald-500/g, replace: 'bg-[#FF3B30]' },
  { regex: /text-emerald-500/g, replace: 'text-[#FF3B30]' },
  { regex: /border-emerald-500/g, replace: 'border-[#FF3B30]' },
  { regex: /shadow-emerald-500/g, replace: 'shadow-[#FF3B30]' },
  
  // 6. Fix Rounding (dial back from extreme bento to sleek modern)
  { regex: /rounded-\[32px\]/g, replace: 'rounded-2xl' },
  { regex: /rounded-3xl/g, replace: 'rounded-2xl' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Editorial Reskin complete!');
