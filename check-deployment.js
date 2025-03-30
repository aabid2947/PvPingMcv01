/**
 * Deployment check script
 * Run this before deploying to check for common issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running pre-deployment checks...');

// Check for required files
const requiredFiles = [
  'package.json',
  '.npmrc',
  'public/_redirects',
  'public/_headers',
  'public/admin/config.yml',
  'public/admin/index.html',
  'content/blog'
];

let hasErrors = false;

console.log('\nChecking for required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${file}`);
  }
});

// Check package.json
console.log('\nChecking package.json configuration:');
try {
  const packageJsonRaw = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  const packageJson = JSON.parse(packageJsonRaw);
  
  // Check React version
  if (packageJson.dependencies.react?.startsWith('^17')) {
    console.log('✅ React version is compatible with Netlify CMS');
  } else {
    console.error(`❌ React version issue: ${packageJson.dependencies.react}`);
    hasErrors = true;
  }
  
  // Check for required scripts
  if (packageJson.scripts.build) {
    console.log('✅ Build script exists');
  } else {
    console.error('❌ Missing build script in package.json');
    hasErrors = true;
  }
  
  // Check for engines field
  if (packageJson.engines?.node) {
    console.log(`✅ Node.js version specified: ${packageJson.engines.node}`);
  } else {
    console.warn('⚠️ No Node.js version specified in package.json engines field');
  }
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  hasErrors = true;
}

// Check for blog content
console.log('\nChecking for blog content:');
try {
  const blogDir = path.join(__dirname, 'content', 'blog');
  const blogFiles = fs.readdirSync(blogDir);
  
  if (blogFiles.length > 0) {
    console.log(`✅ Found ${blogFiles.length} blog posts`);
  } else {
    console.warn('⚠️ No blog posts found in content/blog');
  }
} catch (error) {
  console.error('❌ Error checking blog content:', error.message);
  hasErrors = true;
}

// Final result
console.log('\n==================================');
if (hasErrors) {
  console.error('❌ Pre-deployment checks failed. Please fix the issues above before deploying.');
  process.exit(1);
} else {
  console.log('✅ All pre-deployment checks passed! Ready to deploy.');
} 