const https = require('https');
const fs = require('fs');

const url = 'https://fxqb.kdbank.cn/bg-web/js/logo-51f13b06-1779882338117.js';
const outputJsPath = 'live_logo.js';
const resultsPath = 'extracted_logo_assets.txt';

console.log('Downloading live logo JS file...');

const file = fs.createWriteStream(outputJsPath);
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Download completed. Processing file...');
      try {
        const content = fs.readFileSync(outputJsPath, 'utf8');
        console.log('File size:', content.length, 'bytes');
        
        // Find URLs, base64 strings
        const regexes = [
          /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g,
          /["'](https?:\/\/[^"']+|[^"']+\.(?:png|jpg|jpeg|gif|svg|webp)[^"']*)["']/ig
        ];
        
        const resources = new Set();
        let base64Count = 0;
        
        // Match base64
        let match;
        const base64Regex = /data:image\/([a-zA-Z+]+);base64,([A-Za-z0-9+/=]+)/g;
        while ((match = base64Regex.exec(content)) !== null) {
          base64Count++;
          const format = match[1];
          const data = match[2];
          resources.add(`[Base64 #${base64Count}] Format: ${format}, Size: ${data.length} bytes`);
          
          // Save base64 image to local file
          const filename = `logo_img_${base64Count}.${format}`;
          fs.writeFileSync(filename, Buffer.from(data, 'base64'));
          console.log(`Saved local image: ${filename}`);
        }
        
        // Match regular links
        const urlRegex = /["'](https?:\/\/[^"']+|[^"']+\.(?:png|jpg|jpeg|gif|svg|webp)[^"']*)["']/ig;
        while ((match = urlRegex.exec(content)) !== null) {
          resources.add(`[URL] ${match[1]}`);
        }
        
        const outputData = Array.from(resources).join('\n');
        fs.writeFileSync(resultsPath, outputData, 'utf8');
        console.log(`Successfully found ${resources.size} resources. Details written to ${resultsPath}`);
      } catch (err) {
        console.error('Error reading file:', err);
      }
    });
  });
}).on('error', (err) => {
  fs.unlink(outputJsPath, () => {});
  console.error('Error downloading logo JS:', err.message);
});
