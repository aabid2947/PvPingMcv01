/**
 * Utilities for handling checkout with the Tebex API
 */

// The Tebex Store ID from environment (or fallback)
const STORE_ID = import.meta.env.VITE_TEBEX_STORE_ID || '752140';

/**
 * Create a checkout URL for a cart of items
 * @param {string} username - Minecraft username
 * @param {string} edition - 'java' or 'bedrock'
 * @param {Array} cart - Array of cart items
 * @returns {Promise} - Promise that resolves to checkout URL data
 */
export const createCheckoutUrl = async (username, edition, cart) => {
  try {
    // First, validate parameters
    if (!username) {
      throw new Error('Username is required');
    }
    
    if (!edition || (edition !== 'java' && edition !== 'bedrock')) {
      throw new Error('Valid edition (java or bedrock) is required');
    }
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      throw new Error('Cart must contain at least one item');
    }
    
    // Format the username based on the edition (same as server-side)
    const formattedUsername = edition === 'bedrock' ? `.${username}` : username;
    
    console.log('Creating checkout URL with:', { username, edition, cartItems: cart.length });
    
    // Check if we're on a Cloudflare Pages deployment
    const isCloudflarePages = window.location.hostname.includes('.pages.dev');
    console.log('Deployment type:', isCloudflarePages ? 'Cloudflare Pages' : 'Other');
    
    // For Cloudflare Pages deployments, use direct Tebex checkout URL
    // This bypasses the serverless function which may not be properly configured
    if (isCloudflarePages && cart.length > 0) {
      console.log('Using direct Tebex checkout URL for Cloudflare Pages deployment');
      
      // Get the first item from the cart for direct checkout
      const firstItem = cart[0];
      
      // Format the URL according to Tebex docs
      const directCheckoutUrl = `https://checkout.tebex.io/checkout/${STORE_ID}/${firstItem.id}?username=${encodeURIComponent(formattedUsername)}`;
      
      return {
        packageId: firstItem.id,
        packageName: firstItem.name,
        url: directCheckoutUrl,
        expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
        isDirectCheckout: true
      };
    }
    
    // Call our server API to generate checkout URL
    const response = await fetch('/api/tebex/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        edition,
        cart
      }),
    });
    console.log('Response URL:', response.url);
    console.log('Response status:', response.status);
    
    // If we get a 500 error from Cloudflare or any deployment, fallback to direct checkout
    if (response.status === 500) {
      console.log('Server returned 500 error, using direct checkout fallback');
      
      // Get the first item from the cart for direct checkout
      const firstItem = cart[0];
      
      // Format the URL according to Tebex docs
      const directCheckoutUrl = `https://checkout.tebex.io/checkout/${STORE_ID}/${firstItem.id}?username=${encodeURIComponent(formattedUsername)}`;
      
      return {
        packageId: firstItem.id,
        packageName: firstItem.name,
        url: directCheckoutUrl,
        expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
        isDirectCheckout: true
      };
    }
    
    // Handle non-OK responses with detailed errors
    if (!response.ok) {
      let errorMessage = 'Failed to create checkout URL';
      
      try {
        // Try to parse error from response
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If we can't parse JSON, use the status text
        console.error('Could not parse error response:', parseError);
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Safely parse JSON response
    let data = null;
    try {
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing checkout response:', parseError);
      
      // Fallback to direct checkout on parsing error
      console.log('Parsing error, using direct checkout fallback');
      
      // Get the first item from the cart for direct checkout
      const firstItem = cart[0];
      
      // Format the URL according to Tebex docs
      const directCheckoutUrl = `https://checkout.tebex.io/checkout/${STORE_ID}/${firstItem.id}?username=${encodeURIComponent(formattedUsername)}`;
      
      return {
        packageId: firstItem.id,
        packageName: firstItem.name,
        url: directCheckoutUrl,
        expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
        isDirectCheckout: true,
        isClientFallback: true
      };
    }
    
    // If we got a valid response, return it
    return data;
  } catch (error) {
    console.error('Error creating checkout URL:', error);
    throw error;
  }
};

/**
 * Format a price string into a number
 * @param {string} priceString - Price string (e.g. "$9.99")
 * @returns {number} - Price as a number
 */
export const formatPriceToNumber = (priceString) => {
  if (!priceString) return 0;
  
  // Remove currency symbols and non-numeric characters except decimal point
  const numericString = priceString.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
};

/**
 * Format a number as a price string
 * @param {number} price - Price as a number
 * @returns {string} - Formatted price string (e.g. "$9.99")
 */
export const formatNumberToPrice = (price) => {
  if (typeof price !== 'number') return '$0.00';
  return `$${price.toFixed(2)}`;
}; 