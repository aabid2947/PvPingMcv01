# Deployment Guide for OriginMC Website

This guide provides specific instructions for deploying this project to Cloudflare Pages.

## Prerequisites

1. A GitHub repository containing your website code
2. A Cloudflare account (https://cloudflare.com)

## Deployment Options

### Option 1: Direct Cloudflare Pages Deployment

1. Log in to your Cloudflare account and go to Pages
2. Click "Create a project" and select "Connect to Git"
3. Connect your GitHub repository
4. Configure deployment settings:
   - Project name: `originmc-website` (or your preferred name)
   - Production branch: `main`
   - Build command: `node cloudflare-build.js`
   - Build output directory: `dist`
   - Environment variables:
     - `NODE_VERSION`: `18.17.0`
     - `NPM_FLAGS`: `--legacy-peer-deps`
5. Click "Save and Deploy"

### Option 2: GitHub Actions Deployment (Recommended)

This repository includes a GitHub Actions workflow file that automates the deployment to Cloudflare Pages.

1. Set up the following secrets in your GitHub repository settings:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages permissions
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. Push your changes to the main branch, and GitHub Actions will handle the deployment

## React Version Notice

This project uses React 17 for compatibility with Netlify CMS. Do not upgrade to React 18 without careful consideration, as it may break the CMS integration.

## Local Development

For local development:

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Before deploying, run checks**:
   ```bash
   node check-deployment.js
   ```

## Common Issues and Solutions

### React Version Conflicts

This project intentionally uses React 17.0.2 for Netlify CMS compatibility. If you encounter errors related to React version mismatches:

1. Delete package-lock.json (already handled by the build script)
2. Install dependencies with the legacy flag:
   ```bash
   npm install --legacy-peer-deps
   ```

### react-dom/client Error

If you encounter errors related to `react-dom/client`, ensure you're using the React 17 rendering method:

```jsx
// Don't use this (React 18):
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(<App />);

// Use this instead (React 17):
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));
```

### Build Errors

If you encounter build errors:

1. Run the cleanup script:
   ```bash
   node prebuild-cleanup.js
   ```

2. Verify your configuration:
   ```bash
   node check-deployment.js
   ```

## CMS Access

Once deployed, you can access the CMS at `/admin`. This provides an interface to manage blog posts without needing to edit code directly. 