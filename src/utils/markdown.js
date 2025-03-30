import { marked } from 'marked';
import matter from 'gray-matter';

/**
 * Helper function to parse markdown content
 * @param {string} markdown - Raw markdown content
 * @returns {string} HTML content
 */
export function parseMarkdown(markdown) {
  return marked(markdown);
}

// Static blog posts for fallback when import.meta.glob doesn't work
const staticBlogPosts = [
  {
    id: '2024-04-06-skyblock-guide',
    title: 'Ultimate Beginner\'s Guide to Skyblock',
    date: '2024-04-06',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/skyblock.jpg',
    tags: ['guide', 'skyblock', 'tutorial'],
    excerpt: 'Everything new players need to know about playing Skyblock on our server.',
    content: '# Ultimate Beginner\'s Guide to Skyblock\n\nWelcome to our comprehensive guide to Skyblock!',
    contentHtml: '<h1>Ultimate Beginner\'s Guide to Skyblock</h1><p>Welcome to our comprehensive guide to Skyblock!</p>'
  },
  {
    id: '2024-04-05-anniversary-celebration',
    title: '3rd Anniversary Celebration - Join Us for Epic Festivities!',
    date: '2024-04-05',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/anniversary.jpg',
    tags: ['event', 'celebration', 'news'],
    excerpt: 'It\'s our 3rd anniversary! Join us for a week of special events.',
    content: '# 3rd Anniversary Celebration\n\nCan you believe it? OriginMC is turning 3 years old this month!',
    contentHtml: '<h1>3rd Anniversary Celebration</h1><p>Can you believe it? OriginMC is turning 3 years old this month!</p>'
  },
  {
    id: '2024-04-04-new-survival-map',
    title: 'The Frontier: New Survival Map Launching Next Week',
    date: '2024-04-04',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/survival-map.jpg',
    tags: ['update', 'survival', 'map'],
    excerpt: 'Prepare for The Frontier - our most ambitious survival map yet!',
    content: '# The Frontier: New Survival Map\n\nWe\'re thrilled to announce our new survival map.',
    contentHtml: '<h1>The Frontier: New Survival Map</h1><p>We\'re thrilled to announce our new survival map.</p>'
  }
];

/**
 * Loads blog posts from the content directory
 * @returns {Promise<Array>} Array of blog posts with metadata
 */
export async function getAllPosts() {
  try {
    console.log('Fetching all posts...');
    
    // Use require.context equivalent in Vite to get all markdown files
    let posts = [];
    
    try {
      // Try using import.meta.glob first
      const postFiles = import.meta.glob('/content/blog/*.md', { eager: true });
      console.log('Found post files:', Object.keys(postFiles).length);
      
      if (Object.keys(postFiles).length > 0) {
        // Process each file
        posts = Object.entries(postFiles).map(([path, module]) => {
          try {
            // Extract the filename (slug) from the path
            const slug = path.replace('/content/blog/', '').replace('.md', '');
            
            // Get frontmatter and content based on the module format
            let frontMatter, content;
            
            if (module.frontMatter && module.content) {
              // If it's already processed by our Vite plugin
              frontMatter = module.frontMatter;
              content = module.content;
            } else if (module.default && module.default.frontMatter) {
              // If export is in default property with frontMatter
              frontMatter = module.default.frontMatter;
              content = module.default.content;
            } else if (typeof module.default === 'string') {
              // If default export is a string, parse it
              const parsed = matter(module.default);
              frontMatter = parsed.data;
              content = parsed.content;
            } else {
              console.error('Unexpected module format:', slug, typeof module, module);
              return null;
            }
            
            // Basic validation
            if (!frontMatter || !frontMatter.title || !frontMatter.date) {
              console.error('Missing required frontmatter for post:', slug);
              return null;
            }
            
            // Convert markdown content to HTML
            const contentHtml = marked(content);
            
            return {
              id: slug,
              title: frontMatter.title,
              date: frontMatter.date,
              thumbnail: frontMatter.thumbnail,
              tags: frontMatter.tags || [],
              excerpt: frontMatter.excerpt || '',
              contentHtml,
              content
            };
          } catch (error) {
            console.error('Error processing post file:', path, error);
            return null;
          }
        }).filter(Boolean); // Remove null entries
      } else {
        console.warn('No blog post files found using import.meta.glob, using static fallback posts');
      }
    } catch (importError) {
      console.error('Error using import.meta.glob:', importError);
    }
    
    // If no posts were loaded, use the static fallback
    if (posts.length === 0) {
      console.warn('Using static fallback posts');
      posts = staticBlogPosts;
    }
    
    console.log('Successfully processed posts:', posts.length);
    
    // Sort by date (newest first)
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error getting all posts:', error);
    // If all else fails, return the static posts
    return staticBlogPosts;
  }
}

/**
 * Get a specific post by its id
 * @param {string} id - The post ID
 * @returns {Promise<Object>} The post data including HTML content
 */
export async function getPostById(id) {
  try {
    const allPosts = await getAllPosts();
    const post = allPosts.find(post => post.id === id);
    
    if (!post) {
      console.error(`Post with ID ${id} not found`);
    }
    
    return post;
  } catch (error) {
    console.error(`Error getting post with ID ${id}:`, error);
    // Try to find the post in static fallback
    return staticBlogPosts.find(post => post.id === id) || null;
  }
}

/**
 * Get all post IDs
 * @returns {Promise<Array>} Array of post IDs
 */
export async function getAllPostIds() {
  try {
    const posts = await getAllPosts();
    return posts.map(post => post.id);
  } catch (error) {
    console.error('Error getting all post IDs:', error);
    return staticBlogPosts.map(post => post.id);
  }
}

/**
 * Get posts by tag
 * @param {string} tag - The tag to filter posts by
 * @returns {Promise<Array>} Array of posts with the specified tag
 */
export async function getPostsByTag(tag) {
  try {
    const allPosts = await getAllPosts();
    return allPosts.filter(post => post.tags && post.tags.includes(tag));
  } catch (error) {
    console.error(`Error getting posts with tag ${tag}:`, error);
    return staticBlogPosts.filter(post => post.tags && post.tags.includes(tag));
  }
}