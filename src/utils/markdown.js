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

/**
 * Loads blog posts from the content directory using import.meta.glob
 * @returns {Promise<Array>} Array of blog posts with metadata
 */
export async function getAllPosts() {
  try {
    // In a production build, this would fetch markdown files from the content directory
    // Here we're using a workaround to import multiple markdown files in development
    const modules = import.meta.glob('/content/blog/*.md');
    const postsPromises = Object.entries(modules).map(async ([path, module]) => {
      const { default: content } = await module();
      const slug = path.replace('/content/blog/', '').replace('.md', '');
      
      // Parse the markdown content
      const { data, content: markdownContent } = matter(content);
      const contentHtml = marked(markdownContent);
      
      return {
        id: slug,
        title: data.title,
        date: data.date,
        thumbnail: data.thumbnail,
        tags: data.tags || [],
        excerpt: data.excerpt,
        contentHtml,
        content: markdownContent
      };
    });
    
    const posts = await Promise.all(postsPromises);
    
    // Sort by date (newest first)
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
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
    return allPosts.find(post => post.id === id);
  } catch (error) {
    console.error(`Error getting post with ID ${id}:`, error);
    return null;
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
    return [];
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
    return [];
  }
}