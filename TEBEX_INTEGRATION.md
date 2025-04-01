# Tebex Integration Guide

This document explains how to set up and configure the Tebex integration for the Minecraft store.

## Environment Variables

The Tebex integration relies on environment variables to securely store configuration. These should be set in your deployment platform (Netlify, Vercel, etc.) and in a `.env` file for local development.

Required environment variables:

- `VITE_TEBEX_STORE_ID`: Your Tebex store ID (visible in client-side code)
- `TEBEX_API_KEY`: Your Tebex API key (used only in server-side code)
- `VITE_TEBEX_PACKAGE_IDS`: Comma-separated list of package IDs to include in the store (optional)

Example `.env` file:

```
VITE_TEBEX_STORE_ID=752140
TEBEX_API_KEY=your_tebex_api_key_here
VITE_TEBEX_PACKAGE_IDS=3307111,3307112,3307114,3307115,3307116,3307117,3307118
```

## Getting Your Tebex API Key

1. Log in to your Tebex account at [https://creator.tebex.io/](https://creator.tebex.io/)
2. Go to your server dashboard
3. Navigate to "Settings" > "API Keys"
4. Create a new API key with appropriate permissions (at minimum, read-only access to packages)
5. Copy the API key and store it securely in your environment variables

## Security Considerations

- The Tebex API key is kept secure by only using it in server-side code
- Client-side code only uses the Store ID, which is safe to expose
- API calls to the Tebex API are proxied through serverless functions
- All requests are authenticated with the API key stored securely on the server

## Development Mode

In development mode, the integration will:

1. Skip loading the Tebex SDK to avoid rate limits and enable offline development
2. Use mock package data that resembles real Tebex packages
3. Simulate checkouts with a 3-second delay and automatic success

To test with real Tebex data in development:

1. Create a `.env` file with your real Tebex credentials
2. Run `npm run netlify:dev` to use the Netlify Functions locally
3. The store will connect to the Tebex API through the serverless functions

## API Endpoints

The integration uses the following API endpoints:

- `/.netlify/functions/tebex-packages` (Netlify deployment)
- `/api/tebex/packages` (Vercel deployment and local development proxy)

These endpoints fetch package data from Tebex, cache it for performance, and transform it to match the application's data model.

## Customizing Categories

Packages are organized into categories using the `store-categories.json` file located in the `public` directory. This file can be edited after deployment to reorganize packages without code changes.

### Category JSON Structure

The `store-categories.json` file has the following structure:

```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "Category Name",
      "description": "Description of what this category contains",
      "packages": ["package-id-1", "package-id-2"],
      "order": 1
    }
  ]
}
```

### Category Fields

Each category object requires the following fields:

- `id`: Unique identifier for the category (alphanumeric with hyphens, no spaces)
- `name`: Display name of the category
- `description`: Short description shown on the category header (optional)
- `packages`: Array of package IDs to include in this category
- `order`: Numeric value to sort categories (lower numbers appear first)

### Editing Categories After Deployment

To modify categories after deployment:

1. Edit the `store-categories.json` file
2. Update the categories array with your desired changes
3. Upload the modified file to your server's `/public` directory
4. The store will automatically use the new categories on page refresh

### Dynamic Category System

The store automatically handles various category scenarios:

- If only one category exists, packages are displayed without category headers
- If a package isn't associated with any category, it appears in "Other Packages"
- Empty categories are automatically hidden
- If no categories exist, all packages are displayed in a single grid

## Troubleshooting

If you encounter issues with the Tebex integration:

1. Check that your environment variables are correctly set
2. Verify that your Tebex API key has appropriate permissions
3. Look for errors in the browser console or server logs
4. Ensure your Tebex store is active and properly configured
5. Check that the packages specified in `VITE_TEBEX_PACKAGE_IDS` exist in your store
6. Verify that your `store-categories.json` file has valid JSON format
7. Check that package IDs in the categories match the IDs from your Tebex store

## Support

For issues with the Tebex integration, please contact the development team.
For issues with Tebex itself, contact Tebex support at [https://help.tebex.io/](https://help.tebex.io/) 