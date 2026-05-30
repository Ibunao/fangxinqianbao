const fs = require('fs');

const outputJsPath = 'live_index.js';
const resultsPath = 'extracted_js_urls.txt';

try {
  const content = fs.readFileSync(outputJsPath, 'utf8');
  console.log('File size:', content.length, 'bytes');
  
  // Find base64 images or asset paths
  const regexes = [
    /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g,
    /["']([^"']+\/(?:assets|img|image|images|pic|pics)\/[^"']+)["']/g,
    /["']([^"']+\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?[^"']+)?)["']/ig,
    /http[s]?:\/\/[^"']+\.(?:png|jpg|jpeg|gif|svg|webp)/ig
  ];
  
  const resources = new Set();
  
  regexes.forEach((regex, idx) => {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      // If it's a full match group or first capture group
      const val = match[1] || match[0];
      if (val.length < 500) { // filter out huge base64 blocks unless they are short
        resources.add(`[Regex ${idx}] ${val}`);
      } else {
        resources.add(`[Regex ${idx}] Base64 image (Length: ${val.length}, starts with: ${val.substring(0, 50)})`);
      }
    }
  });
  
  const outputData = Array.from(resources).join('\n');
  fs.writeFileSync(resultsPath, outputData, 'utf8');
  console.log(`Successfully found ${resources.size} matches. Written to ${resultsPath}`);
} catch (err) {
  console.error('Error reading JS file:', err);
}
