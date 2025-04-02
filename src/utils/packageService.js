/**
 * Service for fetching and managing store packages and categories
 */

/**
 * Fetch package categories from JSON file
 * @returns {Promise<Array>} Array of category objects
 */
export async function fetchCategories() {
  try {
    // Attempt to fetch the JSON file
    const response = await fetch('/store-categories.json');
    
    if (!response.ok) {
      console.error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    // Parse the JSON data
    const data = await response.json();
    
    // Validate the JSON structure
    if (!data || !data.categories || !Array.isArray(data.categories)) {
      console.warn('Invalid categories format in store-categories.json');
      return [];
    }
    
    // Return empty array if no categories exist
    if (data.categories.length === 0) {
      console.info('No categories found in store-categories.json');
      return [];
    }
    
    // Return the categories with validation
    return data.categories.map(category => ({
      // Ensure all required fields exist
      id: category.id || `category-${Math.random().toString(36).substr(2, 9)}`,
      name: category.name || 'Unnamed Category',
      description: category.description || '',
      packages: Array.isArray(category.packages) ? category.packages : [],
      order: typeof category.order === 'number' ? category.order : 0
    })).sort((a, b) => a.order - b.order); // Sort by order if provided
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Sort packages into their respective categories
 * @param {Array|Object} packages - Array of package objects or object with data property
 * @param {Array} categories - Array of category objects
 * @returns {Object} Object with categorized packages
 */
export function categorizePackages(packages = [], categories = []) {
  // Extract packages array from different possible data formats
  let packageArray = [];
  
  if (packages) {
    // Handle API response format with data property
    if (packages.data && Array.isArray(packages.data)) {
      packageArray = packages.data;
    } 
    // Handle direct array
    else if (Array.isArray(packages)) {
      packageArray = packages;
    }
    // Log warning if packages is in an unexpected format
    else {
      console.warn('Unexpected packages format in categorizePackages:', packages);
      packageArray = [];
    }
  }
  
  // If no categories exist, return all packages as uncategorized
  if (!categories || categories.length === 0) {
    return {
      uncategorized: {
        id: 'uncategorized',
        name: 'All Packages',
        description: 'All available packages',
        packages: packageArray
      }
    };
  }
  
  // Initialize result with all categories having empty arrays
  const result = categories.reduce((acc, category) => {
    acc[category.id] = {
      ...category,
      packages: []
    };
    return acc;
  }, {});
  
  // Add uncategorized for packages not in any category
  result.uncategorized = {
    id: 'uncategorized',
    name: 'Other Packages',
    description: 'Additional packages',
    packages: []
  };
  
  // Sort packages into their categories
  packageArray.forEach(pkg => {
    let categorized = false;
    
    // Skip packages without IDs
    if (!pkg.id) {
      console.warn('Package without ID found, skipping categorization');
      return;
    }
    
    for (const category of categories) {
      // Ensure category.packages is an array before checking
      if (Array.isArray(category.packages) && category.packages.includes(pkg.id)) {
        result[category.id].packages.push(pkg);
        categorized = true;
        break;
      }
    }
    
    // If package doesn't belong to any category, put it in uncategorized
    if (!categorized) {
      result.uncategorized.packages.push(pkg);
    }
  });
  
  // Remove empty categories
  Object.keys(result).forEach(key => {
    if (result[key].packages.length === 0) {
      delete result[key];
    }
  });
  
  // If only one category exists, rename it to match the category
  if (Object.keys(result).length === 1) {
    const onlyCategory = Object.values(result)[0];
    if (onlyCategory.id === 'uncategorized') {
      onlyCategory.name = 'All Packages';
      onlyCategory.description = 'All available packages';
    }
  }
  
  return result;
}

/**
 * Get mock packages for development mode
 * Each mock package includes id, name, description, price, features, and popular flag
 * @returns {Array} Array of package objects
 */
export function getMockPackages() {
  return [
    {
      id: '3307111',
      name: 'VIP Membership',
      description: 'Get access to exclusive features and benefits with our VIP membership.',
      price: '$9.99',
      features: [
        'VIP tag in-game and on Discord',
        'Access to VIP-only areas and commands',
        'Priority server access during high traffic',
        '10% discount on future purchases'
      ],
      popular: true,
      category: 'vip-packages'
    },
    {
      id: '3307112',
      name: 'Premium Starter Kit',
      description: 'Get a head start with premium tools, weapons, and resources.',
      price: '$4.99',
      features: [
        'Diamond tools and armor set',
        '64x of various valuable resources',
        '3 exclusive mystery crates',
        'Special particle effects for 7 days'
      ],
      popular: false,
      category: 'vip-packages'
    },
    {
      id: '3307114',
      name: 'Ultimate Bundle',
      description: 'The complete package with all benefits and perks combined.',
      price: '$19.99',
      features: [
        'VIP membership for 30 days',
        'Premium starter kit with double resources',
        'Exclusive cosmetic items and effects',
        '5 vote keys and 3 legendary crates'
      ],
      popular: true,
      category: 'game-boosts'
    },
    {
      id: '3307115',
      name: 'Fly Pass',
      description: 'Enjoy the ability to fly around the map.',
      price: '$7.99',
      features: [
        'Ability to fly in survival mode',
        '7 days of flight time',
        'Auto-renewal option',
        'Works in all non-restricted zones'
      ],
      popular: false,
      category: 'game-boosts'
    },
    {
      id: '3307116',
      name: 'Enchantment Bundle',
      description: 'Access to rare and powerful enchantments.',
      price: '$12.99',
      features: [
        '5 custom enchantment books',
        'Ability to apply higher level enchantments',
        'Access to exclusive enchantment table',
        '1 legendary enchantment scroll'
      ],
      popular: false,
      category: 'game-boosts'
    },
    {
      id: '3307117',
      name: 'Weekly Crate Keys',
      description: 'Get weekly delivery of crate keys for a month.',
      price: '$14.99',
      features: [
        '5 crate keys delivered weekly',
        'Access to special weekly rewards',
        'Chance for rare and exclusive items',
        'Automatic delivery for 4 weeks'
      ],
      popular: false,
      category: 'game-boosts'
    },
    {
      id: '3307118',
      name: 'Economy Booster',
      description: 'Boost your in-game economy with this package.',
      price: '$9.99',
      features: [
        'Starting cash bonus of 10,000 coins',
        'Double earnings from all jobs for 7 days',
        '3 money pouches with random amounts',
        'Access to special merchant with discounted prices'
      ],
      popular: false,
      category: 'game-boosts'
    }
  ];
}

/**
 * Create a default store-categories.json file if it doesn't exist
 * @param {Array} packages - Array of package objects to categorize
 * @returns {Object} Default categories object
 */
export function createDefaultCategories(packages = []) {
  // Extract unique categories from packages
  const categorySet = new Set();
  packages.forEach(pkg => {
    if (pkg.category && typeof pkg.category === 'string') {
      categorySet.add(pkg.category);
    }
  });
  
  // Convert to array of category objects
  const categories = Array.from(categorySet).map((categoryName, index) => {
    // Generate a slug-style ID from the category name
    const id = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Get all package IDs for this category
    const packageIds = packages
      .filter(pkg => pkg.category === categoryName)
      .map(pkg => pkg.id);
    
    return {
      id: id || `category-${index}`,
      name: categoryName,
      description: `${categoryName} for the Minecraft server`,
      packages: packageIds,
      order: index
    };
  });
  
  return {
    categories
  };
}

/**
 * Refresh categories from server after a change
 * @returns {Promise<Array>} Array of category objects
 */
export async function refreshCategories() {
  // Clear browser cache for the file to ensure we get the latest version
  const cacheBuster = `?cb=${Date.now()}`;
  try {
    const response = await fetch(`/store-categories.json${cacheBuster}`);
    
    if (!response.ok) {
      throw new Error(`Failed to refresh categories: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.categories) {
      return [];
    }
    
    return data.categories;
  } catch (error) {
    console.error('Error refreshing categories:', error);
    return [];
  }
} 