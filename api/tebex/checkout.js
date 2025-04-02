/**
 * API Route to create a Tebex checkout URL
 * This allows us to securely use the Tebex API without exposing the API key to the client
 */

import fetch from 'node-fetch';

// Check if in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Create a mock checkout URL (for development or when Tebex API is unavailable)
 */
const createMockCheckoutUrl = (packageId, packageName) => {
  const mockUrl = `https://example.com/checkout/${packageId}?mock=true`;
  const expiresDate = new Date();
  expiresDate.setHours(expiresDate.getHours() + 1); // Expires in 1 hour
  
  return {
    packageId,
    packageName,
    url: mockUrl,
    expires: expiresDate.toISOString(),
    isMock: true
  };
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'CORS preflight response' });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Get API key from environment variables
    const TEBEX_API_KEY = process.env.TEBEX_API_KEY;
    
    // Log environment variables for debugging
    console.log(`Development mode: ${isDevelopment}`);
    console.log(`TEBEX_API_KEY exists: ${Boolean(TEBEX_API_KEY)}`);
    
    // If in development mode, return mock data
    if (isDevelopment || !TEBEX_API_KEY) {
      console.log('Using mock checkout data for development');
      
      // Get request body
      const { username, edition, cart } = req.body;
      const formattedUsername = edition === 'bedrock' ? `.${username}` : username;
      
      // Create mock checkout URLs for each item in cart
      const mockResults = cart.map(item => createMockCheckoutUrl(item.id, item.name));
      
      // Return based on cart size
      if (mockResults.length === 1) {
        return res.status(201).json(mockResults[0]);
      } else {
        return res.status(201).json({
          checkouts: mockResults,
          message: 'Multiple mock checkout URLs created. The first URL will be used for redirection.'
        });
      }
    }
    
    // In production, validate the request body
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is required' });
    }
    
    // Parse the request body
    const { username, edition, cart } = req.body;
    
    console.log('Request body:', { username, edition, cartSize: cart?.length });
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one package' });
    }
    
    // Format the username based on the edition
    const formattedUsername = edition === 'bedrock' ? `.${username}` : username;
    
    // Create an array of checkout URL promises for each package
    const checkoutPromises = cart.map(async (item) => {
      try {
        console.log(`Creating checkout for package ${item.id} for user ${formattedUsername}`);
        
        const requestBody = JSON.stringify({
          package_id: item.id,
          username: formattedUsername
        });
        
        console.log('Request payload:', requestBody);
        
        const response = await fetch('https://plugin.tebex.io/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tebex-Secret': TEBEX_API_KEY
          },
          body: requestBody
        });
        
        const responseText = await response.text();
        console.log(`Response status: ${response.status}, body:`, responseText);
        
        if (!response.ok) {
          console.error(`Tebex API Error (${response.status}): ${responseText}`);
          
          // Fall back to mock data if API request fails
          console.log('Falling back to mock checkout URL due to API error');
          return createMockCheckoutUrl(item.id, item.name || 'Unknown Package');
        }
        
        let data;
        try {
          // Parse JSON response if possible
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          
          // Fall back to mock data if parsing fails
          console.log('Falling back to mock checkout URL due to JSON parsing error');
          return createMockCheckoutUrl(item.id, item.name || 'Unknown Package');
        }
        
        return { 
          packageId: item.id,
          packageName: item.name,
          url: data.url,
          expires: data.expires
        };
      } catch (error) {
        console.error(`Error creating checkout for package ${item.id}:`, error);
        
        // Fall back to mock data if any error occurs
        return createMockCheckoutUrl(item.id, item.name || 'Unknown Package');
      }
    });
    
    // Wait for all checkout URLs to be created
    const results = await Promise.all(checkoutPromises);
    
    // If there's only one item in the cart, return just that URL
    if (results.length === 1) {
      return res.status(201).json(results[0]);
    }
    
    // For multiple items, we'd ideally have a way to create a "basket" in Tebex
    // Since that's not directly supported in the API docs you provided, we're returning
    // all URLs and the client will need to handle this
    return res.status(201).json({
      checkouts: results,
      message: 'Multiple checkout URLs created. The first URL will be used for redirection.'
    });
    
  } catch (error) {
    console.error('Error creating checkout URL:', error);
    return res.status(500).json({ error: 'Failed to create checkout URL: ' + error.message });
  }
} 