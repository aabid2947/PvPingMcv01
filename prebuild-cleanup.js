// Support both ESM and CommonJS
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable the prebuild script in Cloudflare Pages environment
// as it's not needed and can cause issues
if (process.env.CF_PAGES === '1') {
  console.log('Running in Cloudflare Pages environment, skipping prebuild cleanup');
  process.exit(0);
}

// Clean package-lock if it exists
const packageLockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  try {
    fs.unlinkSync(packageLockPath);
    console.log('Removed package-lock.json to regenerate it with correct dependencies');
  } catch (error) {
    console.error('Error removing package-lock.json:', error);
  }
}

// Function to fix package.json
function fixPackageJson() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Make sure React and React DOM versions are compatible with Netlify CMS
    packageJson.dependencies.react = '^17.0.2';
    packageJson.dependencies['react-dom'] = '^17.0.2';
    
    // Update devDependencies if needed
    if (packageJson.devDependencies) {
      if (packageJson.devDependencies['@types/react']) {
        packageJson.devDependencies['@types/react'] = '^17.0.53';
      }
      if (packageJson.devDependencies['@types/react-dom']) {
        packageJson.devDependencies['@types/react-dom'] = '^17.0.19';
      }
    }
    
    // Write the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with compatible React versions');
    
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
}

// Function to ensure content directories exist
function ensureDirectories() {
  const directories = [
    path.join(__dirname, 'content'),
    path.join(__dirname, 'content', 'blog'),
    path.join(__dirname, 'public', 'admin'),
    path.join(__dirname, 'public', 'images'),
    path.join(__dirname, 'public', 'images', 'uploads')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Function to create example blog post if none exist
function createExamplePost() {
  const blogDir = path.join(__dirname, 'content', 'blog');
  const files = fs.readdirSync(blogDir);
  
  if (files.length === 0) {
    const examplePost = `---
title: Welcome to OriginMC
date: ${new Date().toISOString().split('T')[0]}
thumbnail: /images/uploads/welcome.jpg
tags:
  - welcome
  - news
excerpt: Welcome to our new website! We're excited to share the latest news and updates about OriginMC with you.
---

# Welcome to OriginMC

This is an example blog post. You can create and edit posts like this one from the admin panel at [/admin](/admin).

## Features

- Play with friends
- Explore unique worlds
- Join special events
- Win amazing prizes

We're excited to have you join our community!
`;
    
    fs.writeFileSync(path.join(blogDir, '2023-01-01-welcome.md'), examplePost);
    console.log('Created example blog post');
  }
}

// Run the cleanup functions
try {
  fixPackageJson();
  ensureDirectories();
  createExamplePost();
  console.log('Prebuild cleanup completed successfully!');
} catch (error) {
  console.error('Error during prebuild cleanup:', error);
  // Don't fail the build if cleanup fails
  process.exit(0);
} 