import fs from 'fs';
import path from 'path';

const src = path.resolve('artifacts/eventhub/dist');
const dest = path.resolve('public');

try {
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
    console.log('Successfully copied artifacts/eventhub/dist to public/');
  } else {
    console.warn('Source artifacts/eventhub/dist directory not found.');
  }

  const apiSrc = path.resolve('api/index.js');
  const apiDest = path.resolve('artifacts/eventhub/api/index.js');
  if (fs.existsSync(apiSrc)) {
    fs.mkdirSync(path.dirname(apiDest), { recursive: true });
    fs.copyFileSync(apiSrc, apiDest);
    console.log('Successfully synced api/index.js to artifacts/eventhub/api/index.js');
  }
} catch (err) {
  console.error('Copy script warning:', err);
}
