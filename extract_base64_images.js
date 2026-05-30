const fs = require('fs');

const cssFilePath = 'C:\\Users\\86182\\.gemini\\antigravity\\brain\\b3c64507-9f09-4f0b-8b9c-39d26474b8c7\\.system_generated\\steps\\42\\content.md';
const jsFilePath = 'live_index.js';
const outputFilePath = 'extracted_base64.txt';

const results = [];

function extractFrom(filePath, label) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Match data:image/... base64
    const regex = /data:image\/([a-zA-Z+]+);base64,([A-Za-z0-9+/=]+)/g;
    let match;
    let count = 0;
    while ((match = regex.exec(content)) !== null) {
      count++;
      const format = match[1];
      const data = match[2];
      results.push({
        label: `${label} #${count}`,
        format: format,
        length: data.length,
        prefix: data.substring(0, 100)
      });
      
      // Save it to a file
      const filename = `extracted_image_${label.toLowerCase()}_${count}.${format}`;
      fs.writeFileSync(filename, Buffer.from(data, 'base64'));
      console.log(`Saved ${filename} (${data.length} chars base64)`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

extractFrom(cssFilePath, 'CSS');
extractFrom(jsFilePath, 'JS');

fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf8');
console.log(`Summary written to ${outputFilePath}. Total images extracted: ${results.length}`);
