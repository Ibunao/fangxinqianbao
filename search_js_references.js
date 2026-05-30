const fs = require('fs');

const jsFilePath = 'live_index.js';
const outputFilePath = 'js_chunk_references.txt';

try {
  const content = fs.readFileSync(jsFilePath, 'utf8');
  
  // Look for patterns like "js/xxxx.js" or chunks mapping
  const regex = /["'](js\/[a-zA-Z0-9_-]+\.js)["']/g;
  let match;
  const chunks = new Set();
  
  while ((match = regex.exec(content)) !== null) {
    chunks.add(match[1]);
  }
  
  // Also look for vite chunk loading patterns, e.g. keys of assets map
  // Vite often lists dynamic chunks like "assets/xxxx.js" or maps like: { "logo": "js/logo-xxx.js" }
  const regex2 = /"([a-zA-Z0-9_-]+)":\s*"js\/([a-zA-Z0-9_-]+)\.js"/g;
  while ((match = regex2.exec(content)) !== null) {
    chunks.add(`js/${match[1]}-${match[2]}.js`);
  }
  
  fs.writeFileSync(outputFilePath, Array.from(chunks).join('\n'), 'utf8');
  console.log(`Found ${chunks.size} chunk files. Written to ${outputFilePath}`);
} catch (err) {
  console.error('Error:', err.message);
}
