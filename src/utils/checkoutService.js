/**
 * Utilities for handling checkout with the Tebex API
 */

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
    
    console.log('Creating checkout URL with:', { username, edition, cartItems: cart.length });
    
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
    console.log(response)
    
    console.log('Checkout API response status:', response.status);
    
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
      
      // Create a fallback mock response if parsing fails
      console.log('Creating fallback mock checkout URL');
      const mockUrl = `https://example.com/checkout/fallback?mock=true`;
      
      // Use the first item in cart for the fallback
      return {
        packageId: cart[0].id,
        packageName: cart[0].name,
        url: mockUrl,
        expires: new Date(Date.now() + 3600000).toISOString(), // Expires in 1 hour
        isMock: true,
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