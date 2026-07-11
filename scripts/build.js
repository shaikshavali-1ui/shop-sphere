const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Installing frontend dependencies...');
  execSync('npm install --prefix frontend', { stdio: 'inherit' });

  console.log('Building frontend application...');
  execSync('npm run build --prefix frontend', { stdio: 'inherit' });

  const srcDir = path.join(__dirname, '../frontend/.next');
  const destDir = path.join(__dirname, '../.next');

  // Clean up existing root .next directory if it exists
  if (fs.existsSync(destDir)) {
    console.log('Cleaning up existing .next directory...');
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  console.log('Moving .next build output to the root...');
  fs.renameSync(srcDir, destDir);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
