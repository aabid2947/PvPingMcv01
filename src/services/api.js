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
    const apiKey = import.meta.env.VITE_TEBEX_API_KEY;
    
    if (!apiKey) {
      console.error('Tebex API key not found in environment variables');
      return getMockStoreProducts();
    }
    
    try {
      // Fetch all categories with packages included
      const response = await fetch(`https://headless.tebex.io/api/accounts/${apiKey}/categories?includePackages=1`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract packages from all categories
      let allPackages = [];
      
      if (data && Array.isArray(data)) {
        data.forEach(category => {
          if (category.packages && Array.isArray(category.packages)) {
            // Add category info to each package
            const packagesWithCategory = category.packages.map(pkg => ({
              ...pkg,
              category: category.name.toLowerCase(),
              category_id: category.id
            }));
            
            allPackages = [...allPackages, ...packagesWithCategory];
          }
        });
      }
      
      if (allPackages.length > 0) {
        // Transform API response to our application format
        return allPackages.map(item => ({
          id: item.id,
          name: item.name,
          price: (item.price.amount / 100).toFixed(2), // Convert cents to dollars
          description: item.description || 'No description available',
          category: item.category || 'other',
          category_id: item.category_id || null,
          image: item.image || null,
          url: item.url || '#',
          bestseller: item.sales_count > 10 // Mark as bestseller if it has more than 10 sales
        }));
      }
      
      console.warn('No packages found in Tebex API response, using mock data');
      return getMockStoreProducts();
    } catch (apiError) {
      console.error('Tebex API call failed:', apiError);
      return getMockStoreProducts();
    }
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
    
    const response = await fetch(`https://headless.tebex.io/api/accounts/${apiKey}/categories`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      return data.map(category => ({
        id: category.id,
        name: category.name,
        order: category.order || 0,
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
    
    const response = await fetch(`https://headless.tebex.io/api/accounts/${apiKey}/packages/${packageId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching package details for ID ${packageId}:`, error);
    return null;
  }
};

export const processPayment = async (productId, paymentData) => {
  // Implement Tebex payment processing
};