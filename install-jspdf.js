const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add jsPDF to dependencies
packageJson.dependencies = {
  ...packageJson.dependencies,
  'jspdf': '^2.5.1'
};

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Install the dependency
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('jsPDF installed successfully');
} catch (error) {
  console.error('Error installing jsPDF:', error.message);
}
