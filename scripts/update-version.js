const fs = require('fs');
const path = require('path');

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Read current version file
const versionPath = path.join(__dirname, '..', 'js', 'version.js');
const versionContent = fs.readFileSync(versionPath, 'utf8');

// Parse current version
const versionMatch = versionContent.match(/number: ['"](.+?)['"]/);
const currentVersion = versionMatch ? versionMatch[1] : '1.0.0';

// Increment patch version
const [major, minor, patch] = currentVersion.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

// Update version.js content
const updatedContent = versionContent
    .replace(/number: ['"].+?['"]/, `number: '${newVersion}'`)
    .replace(/lastUpdate: ['"].+?['"]/, `lastUpdate: '${today}'`);

// Write back to file
fs.writeFileSync(versionPath, updatedContent);

console.log(`Updated version to ${newVersion} (${today})`);
