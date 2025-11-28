import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const configFile = path.join(__dirname, '../src/config/models.ts');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  console.error('Public directory not found!');
  process.exit(1);
}

// Get all FBX files
const files = fs.readdirSync(publicDir).filter(file => file.endsWith('.fbx'));

// Sort files: X-Bot.fbx must be first, others alphabetically
const sortedFiles = files.sort((a, b) => {
  if (a === 'X-Bot.fbx') return -1;
  if (b === 'X-Bot.fbx') return 1;
  return a.localeCompare(b);
});

// Format content
const fileContent = `export const MODEL_FILES = [
${sortedFiles.map(file => `  '/${file}',`).join('\n')}
] as const
`;

// Write to config file
fs.writeFileSync(configFile, fileContent);

console.log(`Updated models.ts with ${sortedFiles.length} models.`);
console.log('Files:', sortedFiles);
