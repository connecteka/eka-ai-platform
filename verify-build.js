const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('🔍 Verifying build...');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist/ folder does not exist!');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html does not exist!');
  process.exit(1);
}

const stats = fs.statSync(indexPath);
const content = fs.readFileSync(indexPath, 'utf-8');

console.log('✅ dist/ folder exists');
console.log('✅ dist/index.html exists');
console.log(`📄 index.html size: ${stats.size} bytes`);
console.log(`🕐 Last modified: ${stats.mtime}`);

// Check for key content indicators
if (content.includes('EKA-AI')) {
  console.log('✅ EKA-AI branding found in build');
} else {
  console.log('⚠️  EKA-AI branding NOT found - possible stale build');
}

// Check for cache control headers
if (content.includes('Cache-Control') || content.includes('no-cache')) {
  console.log('✅ Cache control headers found');
} else {
  console.log('⚠️  Cache control headers NOT found');
}

// List assets folder
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  console.log(`📦 Assets folder contains ${assets.length} files`);
  assets.slice(0, 5).forEach(file => console.log(`   - ${file}`));
  if (assets.length > 5) console.log(`   ... and ${assets.length - 5} more`);
} else {
  console.log('⚠️  No assets folder found');
}

console.log('\n🎉 Build verification complete!');
