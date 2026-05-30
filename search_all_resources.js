const fs = require('fs');

const jsFilePath = 'live_index.js';
const outputFilePath = 'js_deep_search_results.txt';

try {
  const content = fs.readFileSync(jsFilePath, 'utf8');
  
  // Find strings with double/single quotes that might contain references to assets, png, jpg, etc.
  const regex = /["']([^"'\s]+)["']/g;
  let match;
  const matches = new Set();
  
  while ((match = regex.exec(content)) !== null) {
    const val = match[1];
    if (
      val.includes('assets') ||
      val.includes('img') ||
      val.includes('image') ||
      val.includes('logo') ||
      val.includes('icon') ||
      val.includes('png') ||
      val.includes('jpg') ||
      val.includes('svg') ||
      val.includes('kdbank.cn') ||
      val.startsWith('/bg-web') ||
      val.includes('din-')
    ) {
      if (val.length < 200) {
        matches.add(val);
      }
    }
  }
  
  fs.writeFileSync(outputFilePath, Array.from(matches).join('\n'), 'utf8');
  console.log(`Found ${matches.size} matches. Written to ${outputFilePath}`);
} catch (err) {
  console.error('Error:', err.message);
}
