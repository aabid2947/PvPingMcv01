// Serverless function for handling Tebex Headless API requests
export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Get Tebex API key from environment variables
  const TEBEX_API_KEY = process.env.TEBEX_API_KEY;
  
  // Check if API key is available
  if (!TEBEX_API_KEY) {
    console.error('TEBEX_API_KEY is not set in environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error',
        detail: 'API key not configured' 
      })
    };
  }

  try {
    // Parse the path and parameters
    const path = event.path.replace('/api/tebex-headless', '').replace(/^\/?/, '/');
    const params = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};
    
    // Base URL for Tebex API
    const baseUrl = 'https://headless.tebex.io/api';
    
    // Handle different API endpoints
    switch (path) {
      case '/packages':
        return await handleGetPackages(headers, TEBEX_API_KEY, baseUrl);
      
      case '/categories':
        return await handleGetCategories(headers, TEBEX_API_KEY, baseUrl);
      
      case '/basket/create':
        return await handleCreateBasket(headers, TEBEX_API_KEY, baseUrl, body);
      
      case '/basket/info':
        return await handleGetBasket(headers, TEBEX_API_KEY, baseUrl, params);
      
      case '/basket/add':
        return await handleAddToBasket(headers, TEBEX_API_KEY, baseUrl, body);
      
      case '/basket/checkout':
        return await handleCheckout(headers, TEBEX_API_KEY, baseUrl, body);
      
      case '/basket/coupon':
        return await handleApplyCoupon(headers, TEBEX_API_KEY, baseUrl, body);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not found' })
        };
    }
  } catch (error) {
    console.error('Error handling Tebex API request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
}

// Handler to get all categories
async function handleGetCategories(headers, apiKey, baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/categories`, {
      method: 'GET',
      headers: {
        'X-Tebex-Secret': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Tebex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch categories',
        message: error.message 
      })
    };
  }
}

// Handler to get all packages
async function handleGetPackages(headers, apiKey, baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/packages`, {
      method: 'GET',
      headers: {
        'X-Tebex-Secret': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Tebex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error fetching packages:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch packages',
        message: error.message 
      })
    };
  }
}

// Handler to create a new basket
async function handleCreateBasket(headers, apiKey, baseUrl, body) {
  try {
    const { completeUrl, cancelUrl } = body;
    
    if (!completeUrl || !cancelUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters',
          detail: 'completeUrl and cancelUrl are required' 
        })
      };
    }
    
    const response = await fetch(`${baseUrl}/baskets`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        return_url: completeUrl,
        cancel_url: cancelUrl
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tebex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error creating basket:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create basket',
        message: error.message 
      })
    };
  }
}

// Handler to get basket information
async function handleGetBasket(headers, apiKey, baseUrl, params) {
  try {
    const { basketIdent } = params;
    
    if (!basketIdent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameter',
          detail: 'basketIdent is required' 
        })
      };
    }
    
    const response = await fetch(`${baseUrl}/baskets/${basketIdent}`, {
      method: 'GET',
      headers: {
        'X-Tebex-Secret': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Tebex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error fetching basket:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch basket',
        message: error.message 
      })
    };
  }
}

// Handler to add an item to a basket
async function handleAddToBasket(headers, apiKey, baseUrl, body) {
  try {
    const { basketIdent, packageId, quantity } = body;
    
    if (!basketIdent || !packageId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters',
          detail: 'basketIdent and packageId are required' 
        })
      };
    }
    
    const response = await fetch(`${baseUrl}/baskets/${basketIdent}/packages`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package_id: packageId,
        quantity: quantity || 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tebex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error adding item to basket:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to add item to basket',
        message: error.message 
      })
    };
  }
}

// Handler to apply a coupon to a basket
async function handleApplyCoupon(headers, apiKey, baseUrl, body) {
  try {
    const { basketIdent, couponCode } = body;
    
    if (!basketIdent || !couponCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters',
          detail: 'basketIdent and couponCode are required' 
        })
      };
    }
    
    const response = await fetch(`${baseUrl}/baskets/${basketIdent}/coupons`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: couponCode
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tebex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error applying coupon:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to apply coupon',
        message: error.message 
      })
    };
  }
}

// Handler to process a checkout
async function handleCheckout(headers, apiKey, baseUrl, body) {
  try {
    const { basketIdent, username, edition } = body;
    
    if (!basketIdent || !username || !edition) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters',
          detail: 'basketIdent, username, and edition are required' 
        })
      };
    }
    
    // First, get the basket to verify it has items
    const basketResponse = await fetch(`${baseUrl}/baskets/${basketIdent}`, {
      method: 'GET',
      headers: {
        'X-Tebex-Secret': apiKey
      }
    });
    
    if (!basketResponse.ok) {
      throw new Error(`Tebex API error: ${basketResponse.status} ${basketResponse.statusText}`);
    }
    
    const basketData = await basketResponse.json();
    
    if (!basketData.data || !basketData.data.packages || basketData.data.packages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Empty basket',
          detail: 'The basket is empty and cannot be checked out' 
        })
      };
    }
    
    // Process checkout with username and edition
    const checkoutResponse = await fetch(`${baseUrl}/baskets/${basketIdent}/checkout`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        // Include edition as a custom field
        custom_fields: {
          minecraft_edition: edition
        }
      })
    });
    
    if (!checkoutResponse.ok) {
      throw new Error(`Tebex API error: ${checkoutResponse.status} ${checkoutResponse.statusText}`);
    }
    
    const checkoutData = await checkoutResponse.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkoutUrl: checkoutData.data.url
      })
    };
  } catch (error) {
    console.error('Error processing checkout:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process checkout',
        message: error.message 
      })
    };
  }
} 