# Netlify Deployment Guide

This document provides instructions for deploying the OriginMC website with Netlify CMS to Netlify.

## Prerequisites

1. A GitHub repository containing your website code
2. A Netlify account (https://netlify.com)

## Deployment Steps

### 1. Connect your repository to Netlify

1. Go to [Netlify](https://app.netlify.com/) and log in to your account
2. Click "New site from Git"
3. Select GitHub as your Git provider and authorize Netlify
4. Select your repository from the list
5. Configure the build settings:
   - Build command: `npm install --legacy-peer-deps && npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### 2. Enable Netlify Identity

1. Once your site is deployed, go to the site settings in Netlify
2. Navigate to "Identity" in the left sidebar
3. Click "Enable Identity"
4. Under "Registration preferences", select "Invite only"
5. Scroll down to "Services" and click "Enable Git Gateway"

### 3. Configure External Providers (Optional)

If you want to allow users to log in with GitHub, GitLab, or other providers:

1. In the Identity section, scroll to "External providers"
2. Click "Add provider" and select the desired provider
3. Follow the instructions to set up the OAuth application

### 4. Invite Admin Users

1. Go to the "Identity" tab in your site dashboard
2. Click "Invite users"
3. Enter the email addresses of users you want to invite
4. Select the admin role for these users
5. Click "Send" to send the invitations

### 5. Access the CMS

Once deployed, you can access the CMS at:

```
https://your-netlify-site.netlify.app/admin/
```

Users will need to accept the invitation and set up their password to log in.

## Troubleshooting

### Resolving React Version Conflicts

If you encounter issues with React version conflicts during build:

1. Update your package.json to use React 17.x:
   ```json
   "react": "^17.0.2",
   "react-dom": "^17.0.2"
   ```

2. Add the `--legacy-peer-deps` flag to your build command in netlify.toml:
   ```toml
   [build]
     command = "npm install --legacy-peer-deps && npm run build"
   ```

### Media Uploads

If media uploads aren't working:

1. Make sure Git Gateway is enabled
2. Check that the media_folder path in your config.yml is set correctly
3. Verify that the user has permission to upload files

## Continuous Deployment

Once set up, any changes pushed to your main branch will trigger a new build and deployment on Netlify.

When content editors publish new posts through the CMS, Netlify will automatically rebuild the site with the new content. 