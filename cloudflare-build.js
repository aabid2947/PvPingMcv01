/**
 * Cloudflare Pages build script (JavaScript version)
 * This is used as a fallback if the bash script cannot be run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current file's directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting Cloudflare Pages build process...");

// Remove the package-lock.json file to force a fresh install
const packageLockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  console.log("Removing package-lock.json...");
  try {
    fs.unlinkSync(packageLockPath);
  } catch (error) {
    console.error("Error removing package-lock.json:", error.message);
  }
}

// Install dependencies with legacy-peer-deps flag
console.log("Installing dependencies...");
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
} catch (error) {
  console.error("Error installing dependencies:", error.message);
  process.exit(1);
}

// Run the build command
console.log("Building the project...");
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error("Error building the project:", error.message);
  process.exit(1);
}

// Done
console.log("Build completed successfully!"); 