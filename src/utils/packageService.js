/**
 * Service for fetching and managing store packages and categories
 */

/**
 * Fetch package categories from JSON file
 * @returns {Promise<Array>} Array of category objects
 */
export async function fetchCategories() {
  try {
    const response = await fetch('/store-categories.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If the file is empty or has no categories, return an empty array
    if (!data || !data.categories || data.categories.length === 0) {
      return [];
    }
    
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Sort packages into their respective categories
 * @param {Array} packages - Array of package objects
 * @param {Array} categories - Array of category objects
 * @returns {Object} Object with categorized packages
 */
export function categorizePackages(packages, categories) {
  // If no categories exist, return all packages under a null category
  if (!categories || categories.length === 0) {
    return {
      uncategorized: packages
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
  packages.forEach(pkg => {
    let categorized = false;
    
    for (const category of categories) {
      if (category.packages && category.packages.includes(pkg.id)) {
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
  
  return result;
}

/**
 * Get mock packages for development mode
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
      popular: true
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
      popular: false
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
      popular: true
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
      popular: false
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
      popular: false
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
      popular: false
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
      popular: false
    }
  ];
} 