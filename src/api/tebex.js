import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// Validate Tebex configuration
const validateTebexConfig = () => {
  const storeId = process.env.TEBEX_STORE_ID;
  const apiKey = process.env.TEBEX_API_KEY;

  if (!storeId || !apiKey) {
    throw new Error('Tebex configuration is missing');
  }

  return { storeId, apiKey };
};

// Tebex API base URL
const TEBEX_API_URL = 'https://plugin.tebex.io';

// Helper function to make authenticated requests to Tebex
const makeTebexRequest = async (endpoint, options = {}) => {
  const { apiKey } = validateTebexConfig();

  const response = await fetch(`${TEBEX_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-Tebex-Secret': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Tebex API error: ${response.statusText}`);
  }

  return response.json();
};

// Get Tebex configuration (store ID only)
app.get('/api/tebex/config', async (c) => {
  try {
    const { storeId } = validateTebexConfig();
    return c.json({ storeId });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Create a basket
app.post('/api/tebex/basket', async (c) => {
  try {
    const { username } = await c.req.json();
    
    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }

    const basket = await makeTebexRequest('/baskets', {
      method: 'POST',
      body: JSON.stringify({
        username,
        items: []
      })
    });

    return c.json(basket);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Add package to basket
app.post('/api/tebex/basket/:basketId/packages', async (c) => {
  try {
    const { basketId } = c.req.param();
    const { packageId } = await c.req.json();

    if (!packageId) {
      return c.json({ error: 'Package ID is required' }, 400);
    }

    const result = await makeTebexRequest(`/baskets/${basketId}/packages`, {
      method: 'POST',
      body: JSON.stringify({
        packageId
      })
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Create checkout
app.post('/api/tebex/checkout', async (c) => {
  try {
    const { basketId } = await c.req.json();

    if (!basketId) {
      return c.json({ error: 'Basket ID is required' }, 400);
    }

    const checkout = await makeTebexRequest('/checkout', {
      method: 'POST',
      body: JSON.stringify({
        basketId
      })
    });

    return c.json(checkout);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get package information
app.get('/api/tebex/packages', async (c) => {
  try {
    const packages = await makeTebexRequest('/packages');
    return c.json(packages);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default app; 