import { marked } from 'marked';
import matter from 'gray-matter';

/**
 * Helper function to parse markdown content
 * @param {string} markdown - Raw markdown content
 * @returns {string} HTML content
 */
export function parseMarkdown(markdown) {
  // Ensure external images are rendered correctly by preserving URLs
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  return marked(markdown);
}

/**
 * Simple frontmatter parser that works in browsers
 * Extracts YAML frontmatter between --- delimiters
 * @param {string} text - The markdown text with frontmatter
 * @returns {Object} { data, content }
 */
function parseFrontmatter(text) {
  // Check if the text starts with ---
  if (!text.startsWith('---')) {
    return { data: {}, content: text };
  }

  // Find the end of the frontmatter section
  const end = text.indexOf('---', 3);
  if (end === -1) {
    return { data: {}, content: text };
  }

  const frontmatterText = text.substring(3, end).trim();
  const content = text.substring(end + 3).trim();
  
  // Parse the YAML-like frontmatter
  const data = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Special handling for tags
      if (key === 'tags') {
        // Check if value is a space-separated string or already an array
        if (value === '') {
          // Empty array if no tags
          data[key] = [];
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Handle array format: [tag1, tag2]
          try {
            data[key] = JSON.parse(value);
          } catch (e) {
            // If parsing fails, use as space-separated
            data[key] = value.split(' ').filter(Boolean);
          }
        } else {
          // For space-separated format: "tag1 tag2 tag3"
          data[key] = value.split(' ').filter(Boolean);
        }
      }
      // Special handling for dates
      else if (key === 'date' || key.includes('date_')) {
        if (value.includes('T')) {
          // If it's an ISO format, parse it
          data[key] = value;
        } else {
          // Simple date format
          data[key] = value;
        }
      }
      // Handle special fields from the sample format
      else if (key === 'image_url' || key === 'thumbnail') {
        data['thumbnail'] = value; // Normalize to 'thumbnail'
      }
      else if (key === 'slug') {
        data['id'] = value; // Save slug as id for consistency
      }
      // Handle arrays (lines like "tags:" followed by "  - tag1")
      else if (value === '') {
        // This might be the start of a list
        data[key] = [];
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // Handle quoted strings
        data[key] = value.substring(1, value.length - 1);
      } else if (!isNaN(value)) {
        // Handle numbers
        data[key] = Number(value);
      } else {
        // Regular strings
        data[key] = value;
      }
    } else if (line.trim().startsWith('- ') && Object.keys(data).length > 0) {
      // This is a list item, add it to the last defined key
      const lastKey = Object.keys(data)[Object.keys(data).length - 1];
      if (Array.isArray(data[lastKey])) {
        data[lastKey].push(line.trim().substring(2));
      }
    }
  });

  // Ensure we have an ID field - either from slug or filename in the calling function
  if (!data.id && data.slug) {
    data.id = data.slug;
  }

  // Ensure 'date' is properly set
  if (!data.date && data.date_published) {
    data.date = data.date_published;
  }

  // Ensure we always have a tags array
  if (!data.tags) {
    data.tags = [];
  } else if (!Array.isArray(data.tags)) {
    data.tags = [data.tags];
  }

  return { data, content };
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

// Hardcoded list of known blog posts for development mode
const knownBlogFiles = [
  '2024-05-01-summer-event.md',
  '2024-04-25-faction-wars.md',
  '2024-04-15-server-update.md',
  '2024-04-10-arena-tournament.md',
  '2024-04-06-skyblock-guide.md',
  '2024-04-05-anniversary-celebration.md',
  '2024-04-04-new-survival-map.md',
  '2024-04-03-summer-event-announcement.md',
  '2024-04-02-new-pvp-arena.md',
  '2024-04-01-blog-system-guide.md',
  '2024-03-30-prison-announcement.md',
  '2024-03-15-beginner-guide.md',
  '2024-01-10-welcome-post.md',
  '2023-10-15-halloween-event.md',
  '2023-08-02-server-update.md',
  '2023-07-15-welcome-to-originmc.md',
  '2025-05-34-Test.md'
];

/**
 * Loads blog posts from the content directory
 * @returns {Promise<Array>} Array of blog posts with metadata
 */
export async function getAllPosts() {
  console.log('Fetching all posts...');
  let posts = [];
  
  // In development mode, use the hardcoded list of files and fetch directly
  try {
    console.log('Loading blog posts from content/blog directory...');
    const fetchPromises = knownBlogFiles.map(filename => 
      fetch(`/content/blog/${filename}`)
        .then(response => {
          if (!response.ok) {
            console.warn(`Failed to fetch ${filename}: ${response.status}`);
            return null;
          }
          return response.text();
        })
        .then(text => {
          if (!text) return null;
          try {
            // Use our custom frontmatter parser instead of matter
            const { data, content } = parseFrontmatter(text);
            const slug = filename.replace('.md', '');
            
            // Skip posts without required frontmatter
            if (!data.title || !data.date) {
              console.warn(`Missing required frontmatter in ${filename}`);
              return null;
            }
            
            return {
              id: slug,
              title: data.title,
              date: data.date || data.date_published || new Date().toISOString().split('T')[0],
              thumbnail: data.thumbnail || data.image_url || null,
              tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
              excerpt: data.excerpt || content.substring(0, 150) + '...',
              content,
              contentHtml: parseMarkdown(content)
            };
          } catch (error) {
            console.error(`Error parsing ${filename}:`, error);
            return null;
          }
        })
        .catch(error => {
          console.error(`Error fetching ${filename}:`, error);
          return null;
        })
    );
    
    const results = await Promise.all(fetchPromises);
    posts = results.filter(post => post !== null);
    
    console.log(`Successfully loaded ${posts.length} posts via direct fetch`);
  } catch (error) {
    console.error('Error loading posts via direct fetch:', error);
  }
  
  // If no posts were loaded, use the static fallback
  if (posts.length === 0) {
    console.warn('Using static fallback posts');
    posts = staticBlogPosts;
  }
  
  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
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