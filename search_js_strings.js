const fs = require('fs');

const jsFilePath = 'live_index.js';
const outputFilePath = 'js_search_results.txt';

try {
  const content = fs.readFileSync(jsFilePath, 'utf8');
  
  // Find all matches of strings that look like CDN URLs or image names
  // We can look for strings matching quotes containing http/https, or files ending in png/jpg/jpeg/svg
  const urls = [];
  const regex = /["'](https?:\/\/[^"']+|[^"']+\.(?:png|jpg|jpeg|gif|svg|webp|ttf|woff2?)[^"']*)["']/ig;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  
  fs.writeFileSync(outputFilePath, urls.join('\n'), 'utf8');
  console.log(`Found ${urls.length} matches. Results written to ${outputFilePath}`);
} catch (err) {
  console.error('Error:', err.message);
}
