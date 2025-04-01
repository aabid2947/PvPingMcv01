# Tebex Integration Guide

This document explains how to set up and configure the Tebex integration for the Minecraft store.

## Mock Implementation

This implementation uses mock data for store packages and checkout. In a real production environment, you would need to create a backend service to securely interact with the Tebex API.

## Environment Variables

For a real Tebex integration, you would need to configure these environment variables in a .env file for local development:

- `VITE_TEBEX_STORE_ID`: Your Tebex store ID (visible in client-side code)

Example `.env` file:

```
VITE_TEBEX_STORE_ID=752140
```

## Getting Your Tebex API Key

For a real Tebex integration, you would need to:

1. Log in to your Tebex account at [https://creator.tebex.io/](https://creator.tebex.io/)
2. Go to your server dashboard
3. Navigate to "Settings" > "API Keys"
4. Create a new API key with appropriate permissions (at minimum, read-only access to packages)

## Security Considerations

In a real production environment:

- Your Tebex API key should never be exposed to client-side code
- API calls to the Tebex API should be proxied through a secure backend
- User data should be handled securely according to privacy regulations

## Development Mode

The current implementation:

1. Uses mock package data that resembles real Tebex packages
2. Simulates checkouts with a delay and automatic success
3. Stores purchase information in localStorage for testing

## Customizing Categories

Packages are organized into categories using the `store-categories.json` file located in the `public` directory. This file can be edited to reorganize packages without code changes.

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

### Editing Categories

To modify categories:

1. Edit the `store-categories.json` file
2. Update the categories array with your desired changes
3. Save the file to the `public` directory

### Dynamic Category System

The store automatically handles various category scenarios:

- If only one category exists, packages are displayed without category headers
- If a package isn't associated with any category, it appears in "Other Packages"
- Empty categories are automatically hidden
- If no categories exist, all packages are displayed in a single grid

## Troubleshooting

If you encounter issues with the store:

1. Check that the `public/store-categories.json` file exists and has valid JSON format
2. Verify that the mock package IDs in the code match those in your categories
3. Check browser console for any JavaScript errors
4. Make sure the application has properly loaded the mock data

## Real Implementation

To implement a real Tebex store:

1. Create a secure backend API to handle Tebex API requests
2. Store your Tebex API key securely in server environment variables
3. Update the `tebexService.js` file to use your real API instead of mock data
4. Implement proper error handling and security measures

## Support

For issues with Tebex itself, contact Tebex support at [https://help.tebex.io/](https://help.tebex.io/) 