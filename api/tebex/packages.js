/**
 * Vercel Serverless API Route to securely fetch packages from Tebex API
 * This protects the API key by keeping it server-side only
 */

import fetch from 'node-fetch';

// Cache mechanism to reduce API calls (in-memory, will reset on cold starts)
let packagesCache = {
  data: null,
  timestamp: null,
  expiryTime: 5 * 60 * 1000 // Cache for 5 minutes
};

// Default store ID if environment variable is missing
const DEFAULT_STORE_ID = '752140';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'CORS preflight response' });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variables
    const TEBEX_API_KEY = process.env.TEBEX_API_KEY;
    const TEBEX_STORE_ID = process.env.VITE_TEBEX_STORE_ID || DEFAULT_STORE_ID;
    const TEBEX_PACKAGE_IDS = process.env.VITE_TEBEX_PACKAGE_IDS || '';

    console.log('Using Tebex store ID:', TEBEX_STORE_ID);

    // Check if we have API key
    if (!TEBEX_API_KEY) {
      console.error('TEBEX_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    // Check if we have cached data that's still valid
    if (packagesCache.data && 
        packagesCache.timestamp && 
        (Date.now() - packagesCache.timestamp < packagesCache.expiryTime)) {
      console.log('Returning cached package data');
      return res.status(200).json(packagesCache.data);
    }

    // Fetch packages from Tebex API
    const response = await fetch(`https://plugin.tebex.io/packages`, {
      headers: {
        'X-Tebex-Secret': TEBEX_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tebex API Error (${response.status}): ${errorText}`);
      
      // Handle specific error cases
      if (response.status === 401) {
        return res.status(500).json({ error: 'Invalid Tebex API key' });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'Tebex API rate limit exceeded' });
      }
      
      return res.status(response.status).json({ 
        error: `Error fetching packages from Tebex: ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Filter packages if specific package IDs are provided
    let filteredPackages = data;
    if (TEBEX_PACKAGE_IDS) {
      const packageIds = TEBEX_PACKAGE_IDS.split(',').map(id => id.trim());
      if (packageIds.length > 0) {
        filteredPackages = data.filter(pkg => packageIds.includes(pkg.id.toString()));
      }
    }
    
    // Process the data to match our application's expected format
    const processedData = {
      packages: filteredPackages.map(pkg => ({
        id: pkg.id.toString(),
        name: pkg.name,
        description: pkg.description || 'No description available',
        price: formatPrice(pkg.price, pkg.sale?.active ? pkg.sale.price : null),
        features: extractFeatures(pkg.description),
        popular: Boolean(pkg.sale?.active), // Mark packages on sale as popular
        originalPrice: pkg.sale?.active ? formatPrice(pkg.price) : null,
        image: pkg.image || null,
        category: pkg.category?.name || 'Uncategorized'
      }))
    };

    // Update cache
    packagesCache.data = processedData;
    packagesCache.timestamp = Date.now();

    // Return processed data
    return res.status(200).json(processedData);
  } catch (error) {
    console.error('Error fetching Tebex packages:', error);
    return res.status(500).json({ error: 'Failed to fetch packages' });
  }
}

/**
 * Format price to display format
 * @param {number} price - The price in cents
 * @param {number|null} salePrice - The sale price in cents (if available)
 * @returns {string} Formatted price string
 */
function formatPrice(price, salePrice = null) {
  const priceToFormat = salePrice !== null ? salePrice : price;
  
  // Price is in cents, convert to dollars
  const dollars = priceToFormat / 100;
  
  return `$${dollars.toFixed(2)}`;
}

/**
 * Extract features from package description
 * @param {string} description - The package description
 * @returns {Array} Array of feature strings
 */
function extractFeatures(description = '') {
  // Try to extract bullet points or list items from description
  if (!description) return ['Package details not available'];
  
  // Look for bullet points or numbered lists
  const bulletMatches = description.match(/[•*-]\s+(.*?)(?=\n|$)/g);
  if (bulletMatches && bulletMatches.length > 0) {
    return bulletMatches.map(match => match.replace(/[•*-]\s+/, '').trim());
  }
  
  // If no bullet points, split by line and filter out empty lines
  const lines = description.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.length < 100); // Reasonable length for a feature
  
  if (lines.length > 0) {
    return lines.slice(0, 5); // Return up to 5 lines
  }
  
  // If nothing suitable found, return generic text
  return ['Package includes in-game benefits'];
} 