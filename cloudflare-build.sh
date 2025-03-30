#!/bin/bash

# Cloudflare Pages build script
echo "Starting Cloudflare Pages build process..."

# Remove the package-lock.json file to force a fresh install
if [ -f "package-lock.json" ]; then
  echo "Removing package-lock.json..."
  rm -f package-lock.json
fi

# Install dependencies with legacy-peer-deps flag
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Run the build command
echo "Building the project..."
npm run build

# Done
echo "Build completed successfully!" 