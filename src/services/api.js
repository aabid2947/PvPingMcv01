import axios from 'axios';

// Blog service
export const getBlogPosts = async () => {
  // Used for compatibility, actual implementation in utils/markdown.js
};

export const getBlogPostById = async (id) => {
  // Used for compatibility, actual implementation in utils/markdown.js
};

// Store service (Tebex integration)
export const getStoreProducts = async () => {
  try {
    let response;
    const apiKey = import.meta.env.VITE_TEBEX_API_KEY;
    
    if (!apiKey) {
      console.error('Tebex API key not found in environment variables');
      return getMockStoreProducts();
    }
    
    try {
      // First try the direct API call
      response = await axios.get('https://plugin.tebex.io/packages', {
        headers: {
          'X-Authorization': apiKey
        }
      });
    } catch (apiError) {
      console.error('Direct Tebex API call failed, trying fallback:', apiError);
      
      // If that fails (likely due to CORS), use a fallback with mock data
      // In a real application, this would be a server-side proxy
      return getMockStoreProducts();
    }
    
    if (response.data && Array.isArray(response.data)) {
      // Transform API response to our application format
      return response.data.map(item => ({
        id: item.id,
        name: item.name,
        price: (item.price.amount / 100).toFixed(2), // Convert cents to dollars
        description: item.description || 'No description available',
        category: item.category?.name?.toLowerCase() || 'other',
        image: item.image || null,
        url: item.url || '#',
        bestseller: item.sales > 10 // Mark as bestseller if it has more than 10 sales
      }));
    }
    return getMockStoreProducts();
  } catch (error) {
    console.error('Error fetching store products:', error);
    return getMockStoreProducts();
  }
};

export const getMockStoreProducts = () => {
  // Mock data for development or when the API fails
  return [
    {
      id: 1,
      name: "VIP Rank",
      price: "9.99",
      description: "Get VIP status with special perks and privileges on the server.",
      category: "ranks",
      url: "#",
      bestseller: true
    },
    {
      id: 2,
      name: "MVP Rank",
      price: "19.99",
      description: "Upgrade to MVP for premium features and exclusive access.",
      category: "ranks",
      url: "#",
      bestseller: false
    },
    {
      id: 3,
      name: "Legendary Crate",
      price: "14.99",
      description: "Unlock rare items and special rewards with this legendary crate.",
      category: "crates",
      url: "#",
      bestseller: true
    },
    {
      id: 4,
      name: "Mystery Crate",
      price: "7.99",
      description: "Try your luck with our mystery crate filled with random goodies.",
      category: "crates",
      url: "#",
      bestseller: false
    },
    {
      id: 5,
      name: "Warrior Kit",
      price: "12.99",
      description: "Start with full warrior gear and powerful weapons and armor.",
      category: "kits",
      url: "#",
      bestseller: false
    },
    {
      id: 6,
      name: "Miner Kit",
      price: "9.99",
      description: "Get all the mining tools and resources you need to build and craft.",
      category: "kits",
      url: "#",
      bestseller: false
    },
    {
      id: 7,
      name: "Enchanted Sword",
      price: "8.99",
      description: "A powerful enchanted sword with special abilities.",
      category: "tools",
      url: "#",
      bestseller: false
    },
    {
      id: 8,
      name: "Dragon Bow",
      price: "11.99",
      description: "A mighty bow with fire and knockback enchantments.",
      category: "tools",
      url: "#",
      bestseller: true
    }
  ];
};

// Get listing of all categories
export const getStoreCategories = async (products) => {
  if (!products || products.length === 0) return [];
  
  // Extract unique category values
  const categories = [...new Set(products.map(product => product.category))];
  
  // Return formatted categories
  return categories.map(category => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1),
  }));
};

// Get detailed Tebex category information
export const getTebexCategories = async () => {
  try {
    const apiKey = import.meta.env.VITE_TEBEX_API_KEY;
    
    if (!apiKey) {
      console.error('Tebex API key not found in environment variables');
      return [];
    }
    
    const response = await axios.get('https://plugin.tebex.io/categories', {
      headers: {
        'X-Authorization': apiKey
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(category => ({
        id: category.id,
        name: category.name,
        order: category.order,
        subcategories: category.subcategories || []
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Tebex categories:', error);
    return [];
  }
};

// Get more detailed information about a specific package
export const getPackageDetails = async (packageId) => {
  try {
    const apiKey = import.meta.env.VITE_TEBEX_API_KEY;
    
    if (!apiKey || !packageId) {
      return null;
    }
    
    const response = await axios.get(`https://plugin.tebex.io/package/${packageId}`, {
      headers: {
        'X-Authorization': apiKey
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching package details for ID ${packageId}:`, error);
    return null;
  }
};

export const processPayment = async (productId, paymentData) => {
  // Implement Tebex payment processing
};