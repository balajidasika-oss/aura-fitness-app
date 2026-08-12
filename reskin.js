const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replacements = [
  // 1. Remove Neon Greens and Teals (Replace with Minimalist Neutral/Monochrome)
  { regex: /bg-emerald-\d{3}(\/\d+)?/g, replace: 'bg-neutral-800' },
  { regex: /text-emerald-\d{3}/g, replace: 'text-neutral-200' },
  { regex: /border-emerald-\d{3}(\/\d+)?/g, replace: 'border-neutral-700' },
  
  { regex: /bg-teal-\d{3}(\/\d+)?/g, replace: 'bg-neutral-800' },
  { regex: /text-teal-\d{3}/g, replace: 'text-neutral-300' },
  { regex: /border-teal-\d{3}(\/\d+)?/g, replace: 'border-neutral-700' },

  { regex: /bg-purple-\d{3}(\/\d+)?/g, replace: 'bg-neutral-800' },
  { regex: /text-purple-\d{3}/g, replace: 'text-neutral-300' },
  { regex: /border-purple-\d{3}(\/\d+)?/g, replace: 'border-neutral-700' },

  { regex: /bg-indigo-\d{3}(\/\d+)?/g, replace: 'bg-neutral-800' },
  { regex: /text-indigo-\d{3}/g, replace: 'text-neutral-300' },
  { regex: /border-indigo-\d{3}(\/\d+)?/g, replace: 'border-neutral-700' },

  { regex: /bg-amber-\d{3}(\/\d+)?/g, replace: 'bg-neutral-800' },
  { regex: /text-amber-\d{3}/g, replace: 'text-neutral-300' },
  { regex: /border-amber-\d{3}(\/\d+)?/g, replace: 'border-neutral-700' },

  // 2. Remove heavy "AI" glassmorphism and replace with flat, clean minimalist panels
  { regex: /bg-black\/[0-9]+/g, replace: 'bg-[#0F0F0F]' },
  { regex: /bg-white\/5/g, replace: 'bg-[#141414]' },
  { regex: /bg-white\/10/g, replace: 'bg-[#1A1A1A]' },
  { regex: /bg-zinc-\d{3}(\/\d+)?/g, replace: 'bg-[#141414]' },
  { regex: /backdrop-blur-[a-z]+/g, replace: '' }, // Remove blurs for flat design
  { regex: /border-white\/[0-9]+/g, replace: 'border-neutral-800' },
  { regex: /border-zinc-\d{3}(\/\d+)?/g, replace: 'border-neutral-800' },

  // 3. Typography & Text
  { regex: /text-zinc-400/g, replace: 'text-neutral-400' },
  { regex: /text-zinc-500/g, replace: 'text-neutral-500' },
  { regex: /text-slate-400/g, replace: 'text-neutral-400' },
  { regex: /text-slate-100/g, replace: 'text-white' },

  // 4. Remove Glows and heavy shadows
  { regex: /shadow-\[.*?\]/g, replace: 'shadow-none' },
  { regex: /shadow-xl/g, replace: 'shadow-none' },
  { regex: /shadow-2xl/g, replace: 'shadow-none' },
  { regex: /ring-1 ring-[a-z]+-\d+\/\d+/g, replace: 'ring-1 ring-neutral-700' },

  // 5. App/Global Backgrounds
  { regex: /bg-\[#07090e\]/g, replace: 'bg-[#000000]' }, // True minimalist pitch black background
  { regex: /bg-\[#050505\]/g, replace: 'bg-[#000000]' }
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
console.log('Reskin complete!');
