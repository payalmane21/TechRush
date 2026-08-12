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
} catch (err) {
  console.error('Copy script warning:', err);
}
