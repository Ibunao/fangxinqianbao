const fs = require('fs');

const cssFilePath = 'C:\\Users\\86182\\.gemini\\antigravity\\brain\\b3c64507-9f09-4f0b-8b9c-39d26474b8c7\\.system_generated\\steps\\42\\content.md';

try {
  const content = fs.readFileSync(cssFilePath, 'utf8');
  // Match around base64 image
  const index = content.indexOf('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABWCAM');
  if (index !== -1) {
    const start = Math.max(0, index - 200);
    const end = Math.min(content.length, index + 300);
    console.log('--- CONTEXT ---');
    console.log(content.substring(start, end));
    console.log('---------------');
  } else {
    console.log('Base64 string not found.');
  }
} catch (err) {
  console.error('Error:', err.message);
}
