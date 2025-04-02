# Tebex Integration Guide

This document explains how to set up and configure the Tebex integration for the Minecraft store.

## Tebex Integrations

This application supports two methods of integrating with Tebex:

1. **Legacy Web SDK Integration** - Uses the Tebex JavaScript SDK for direct checkout
2. **Headless API Integration** - Uses the Tebex Headless API for a custom cart and checkout experience

## Environment Variables

To set up the Tebex integration, configure these environment variables in a `.env` file:

### Common Variables

- `NODE_ENV`: Set to "development" for local testing, "production" for live environment

### Headless API Integration (Recommended)

- `TEBEX_HEADLESS_API_KEY`: Your Tebex Headless API key (server-side only)
- `VITE_API_BASE_URL`: Base URL for API requests (e.g., "/api" or "https://your-api.example.com/api")

### Legacy Web SDK Integration

- `VITE_TEBEX_STORE_ID`: Your Tebex store ID (visible in client-side code)
- `TEBEX_API_KEY`: Your Tebex API key (server-side only)
- `VITE_TEBEX_PACKAGE_IDS`: Comma-separated list of package IDs to include in the store

Example `.env` file:

```
# Development Mode
NODE_ENV=development

# Headless API Integration
TEBEX_HEADLESS_API_KEY=your_tebex_headless_api_key_here
VITE_API_BASE_URL=/api

# Legacy SDK Integration
VITE_TEBEX_STORE_ID=your_tebex_store_id_here
TEBEX_API_KEY=your_tebex_api_key_here
VITE_TEBEX_PACKAGE_IDS=package_id_1,package_id_2,package_id_3
```

## Getting Your Tebex API Keys

### Headless API Key

1. Log in to your Tebex account at [https://creator.tebex.io/](https://creator.tebex.io/)
2. Go to your server dashboard
3. Navigate to "Settings" > "API Keys"
4. Create a new API key with appropriate permissions (recommend "Full Access" for the Headless API)
5. Use this key as your `TEBEX_HEADLESS_API_KEY`

### Legacy API Key

1. Log in to your Tebex account at [https://creator.tebex.io/](https://creator.tebex.io/)
2. Go to your server dashboard
3. Navigate to "Settings" > "API Keys"
4. Create a new API key with appropriate permissions (at minimum, read-only access to packages)
5. Use this key as your `TEBEX_API_KEY`

## Security Considerations

To ensure the security of your Tebex integration:

- API keys should never be exposed to client-side code (never prefix with `VITE_`)
- All API calls to Tebex should be proxied through your own serverless functions or backend
- The Headless API integration uses a secure basket identifier that is stored in localStorage
- User data (Minecraft username and edition) should be handled according to privacy regulations

## Shopping Cart Implementation

The application uses a shopping cart system with the following features:

1. **Client-side Cart**: Items are stored in the `CartContext` and persisted in localStorage
2. **Basket Management**: When proceeding to checkout, items are transferred to a Tebex basket
3. **User Information**: During checkout, the user provides their Minecraft username and edition

### Cart Flow

1. User adds items to their cart using "Add to Cart" buttons on the Store page
2. The cart contents are managed by the `CartContext` and displayed in the `CartModal`
3. When the user clicks "Checkout", the `CheckoutModal` is displayed
4. The user enters their Minecraft username and selects their edition (Java or Bedrock)
5. Items are transferred from the client-side cart to a Tebex basket
6. The user is redirected to the Tebex checkout page to complete their purchase

## Development Mode

When running in development mode (`NODE_ENV=development`):

1. The Headless API integration will use mock data if it cannot connect to a real API
2. Package data is provided with placeholder images and descriptions
3. The checkout process is simulated but does not create real transactions

To test with real Tebex data while in development:

1. Set up a local API endpoint that proxies requests to the Tebex Headless API
2. Configure the `VITE_API_BASE_URL` to point to your local API
3. Provide your real `TEBEX_HEADLESS_API_KEY` to the API endpoint

## API Endpoints

The application uses the following API endpoints for the Headless integration:

- `GET /api/tebex-headless/packages`: Fetch all packages
- `GET /api/tebex-headless/categories`: Fetch all categories
- `POST /api/tebex-headless/basket/create`: Create a new basket
- `GET /api/tebex-headless/basket/info`: Get basket information
- `POST /api/tebex-headless/basket/add`: Add a package to a basket
- `POST /api/tebex-headless/basket/checkout`: Process checkout with username and edition
- `POST /api/tebex-headless/basket/coupon`: Apply a coupon code to a basket

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

### Dynamic Category System

The store automatically handles various category scenarios:

- If only one category exists, packages are displayed without category headers
- If a package isn't associated with any category, it appears in "Other Packages"
- Empty categories are automatically hidden
- If no categories exist, all packages are displayed in a single grid

## Troubleshooting

If you encounter issues with the store:

1. **Missing Package Data**: Verify that your Tebex store has packages available for purchase
2. **API Connection Issues**: Check that your API key has the correct permissions
3. **Basket Creation Fails**: Ensure the API has the necessary scopes to create baskets
4. **Checkout Errors**: Verify that you're providing the proper username and edition format
5. **CORS Errors**: Configure your API to allow requests from your application domain

Debug steps:

1. Check your browser console for JavaScript errors
2. Examine the Network tab in Developer Tools to see API responses
3. Verify that your environment variables are correctly set
4. Check server logs for any API errors on the backend

## Support

- For issues with Tebex itself, contact Tebex support at [https://help.tebex.io/](https://help.tebex.io/)
- For issues with the integration code, check the repository issues or contact the development team 