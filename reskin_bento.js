const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replacements = [
  // 1. Base Backgrounds (From Pitch Black to Oatmeal/Bone)
  { regex: /bg-\[#000000\]/g, replace: 'bg-[#F4F2EC]' },
  { regex: /bg-\[#0F0F0F\]/g, replace: 'bg-[#F4F2EC]' },
  
  // 2. Bento Box Cards (From dark greys to Pure White and Pale Sage)
  { regex: /bg-\[#141414\]/g, replace: 'bg-white shadow-sm' },
  { regex: /bg-\[#1A1A1A\]/g, replace: 'bg-white shadow-sm' },
  { regex: /bg-neutral-800/g, replace: 'bg-[#EAF0EA]' }, // Pale Sage
  { regex: /bg-neutral-900/g, replace: 'bg-[#EAF0EA]' },
  { regex: /bg-white\/5/g, replace: 'bg-white' },
  { regex: /bg-black\/40/g, replace: 'bg-white' },

  // 3. Borders (From stark white/grey to warm bone/stone)
  { regex: /border-neutral-700/g, replace: 'border-[#E6E4DD]' },
  { regex: /border-neutral-800/g, replace: 'border-[#E6E4DD]' },
  { regex: /border-white\/10/g, replace: 'border-[#E6E4DD]' },
  { regex: /border-white\/5/g, replace: 'border-[#E6E4DD]' },

  // 4. Text & Typography (From stark white to Deep Sage/Charcoal)
  { regex: /text-white/g, replace: 'text-[#2D332F]' },
  { regex: /text-neutral-200/g, replace: 'text-[#4A5C4F]' }, // Deep Sage
  { regex: /text-neutral-300/g, replace: 'text-[#4A5C4F]' },
  { regex: /text-neutral-400/g, replace: 'text-[#7A8277]' }, // Muted Earth
  { regex: /text-neutral-500/g, replace: 'text-[#7A8277]' },
  
  // 5. Buttons & Accents (Warm Terracotta & Deep Sage)
  { regex: /bg-white text-black/g, replace: 'bg-[#C27359] text-white shadow-md' }, // Terracotta Primary
  
  // 6. Rounding & Styling (Extreme Bento Rounding)
  { regex: /rounded-xl/g, replace: 'rounded-2xl' },
  { regex: /rounded-2xl/g, replace: 'rounded-3xl' },
  { regex: /rounded-3xl/g, replace: 'rounded-[32px]' },
  
  // 7. Typography softening
  { regex: /font-black/g, replace: 'font-bold tracking-tight' },

  // 8. Fix inverted inputs (inputs should be light)
  { regex: /bg-zinc-\d+/g, replace: 'bg-white border-[#E6E4DD]' }
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
console.log('Bento Reskin complete!');
