# Cloudflare Pages Deployment Guide

This document provides instructions for deploying the OriginMC website with Netlify CMS to Cloudflare Pages.

## Prerequisites

1. A GitHub repository containing your website code
2. A Cloudflare account (https://cloudflare.com)

## Deployment Steps

### 1. Connect your repository to Cloudflare Pages

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages) and log in to your account
2. Click "Create a project"
3. Select "Connect to Git"
4. Connect your GitHub account and select your repository
5. Configure the build settings:
   - Project name: `originmc-website` (or your preferred name)
   - Production branch: `main` (or your main branch)
   - Framework preset: `None` (we're using custom build commands)
   - Build command: `chmod +x ./cloudflare-build.sh && ./cloudflare-build.sh`
   - Build output directory: `dist`
6. Click "Save and Deploy"

### 2. Environment Variables

Add the following environment variables in your Cloudflare Pages settings:

1. From the Pages dashboard, select your project
2. Go to "Settings" > "Environment variables"
3. Add the following variables:
   - `NODE_VERSION`: `18.17.0`
   - `NPM_FLAGS`: `--legacy-peer-deps`

### 3. Deploy Hooks (Optional)

If you want to trigger builds manually:

1. Go to "Settings" > "Builds & deployments"
2. Under "Deploy hooks," click "Create hook"
3. Name your hook (e.g., "Manual Deploy") and select your production branch
4. Save the generated URL to trigger builds via webhook

## Troubleshooting

### Common Issues and Solutions

#### Issue: Dependencies installation fails with package-lock.json mismatches

**Solution:** 
The project uses React 17 for Netlify CMS compatibility, but sometimes your package-lock.json might reference React 19. The build process addresses this by:

1. Removing package-lock.json at the beginning of the build
2. Performing a fresh npm install with --legacy-peer-deps flag
3. Building the project with the correct dependencies

If you're building locally and encounter this issue:
```bash
# Remove the package-lock.json
rm package-lock.json

# Install dependencies with the legacy-peer-deps flag
npm install --legacy-peer-deps

# Build the project
npm run build
```

#### Issue: Dependencies installation fails

**Solution:** 
1. Check that `.npmrc` exists with the following content:
   ```
   legacy-peer-deps=true
   auto-install-peers=true
   ```

2. Make sure `NODE_VERSION` is set to `18.17.0` or compatible version in environment variables

#### Issue: Build fails with React version conflicts

**Solution:**
1. Ensure package.json has React 17.x:
   ```json
   "react": "^17.0.2",
   "react-dom": "^17.0.2"
   ```

2. Run the deployment check before deploying:
   ```
   npm run check
   ```

#### Issue: CMS admin interface not loading

**Solution:**
1. Verify that the public/admin directory includes all necessary files
2. Check the browser console for errors
3. Ensure that _headers and _redirects files are correctly formatted

#### Issue: Markdown content not rendering

**Solution:**
1. Check that the content/blog directory exists and contains markdown files
2. Verify that the markdown utility functions are properly importing files
3. Check the Vite configuration for proper markdown importing

## Deploying New Blog Posts

While Netlify CMS is integrated, note that Cloudflare Pages doesn't provide Git Gateway functionality out of the box. To add new blog posts:

1. Create markdown files in the `content/blog` directory
2. Commit and push changes to your repository
3. Cloudflare Pages will automatically rebuild and deploy

For content editors without Git access, consider using:
- A GitHub workflow for content management
- A headless CMS with API access to Cloudflare Pages
- Cloudflare Pages Deploy Hooks to trigger rebuilds

## Running Pre-Deployment Checks

Before pushing changes to your repository, run:

```bash
npm run check
```

This will verify that all required files exist and configurations are correct.

## Custom Deployment Configuration

If you need to customize your Cloudflare Pages build further, you can use:

- `cloudflare-pages.toml` - For build-specific settings
- `cloudflare-build.sh` - Custom build script for Cloudflare Pages
- `_redirects` - For custom redirect rules
- `_headers` - For custom HTTP headers 