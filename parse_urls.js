const fs = require('fs');

const cssFilePath = 'C:\\Users\\86182\\.gemini\\antigravity\\brain\\b3c64507-9f09-4f0b-8b9c-39d26474b8c7\\.system_generated\\steps\\42\\content.md';
const outputFilePath = 'extracted_urls.txt';

try {
  const content = fs.readFileSync(cssFilePath, 'utf8');
  const regex = /url\(['"]?([^'")]+)['"]?\)/g;
  let match;
  const urls = new Set();
  
  while ((match = regex.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  const outputData = Array.from(urls).join('\n');
  fs.writeFileSync(outputFilePath, outputData, 'utf8');
  console.log(`Successfully wrote ${urls.size} URLs to ${outputFilePath}`);
} catch (err) {
  console.error('Error:', err);
}
