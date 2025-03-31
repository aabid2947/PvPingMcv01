import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiTag } from 'react-icons/fi';
import { getAllPosts } from '../utils/markdown';
import { Helmet } from 'react-helmet-async';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const allPosts = await getAllPosts();
        setPosts(allPosts);
        setError(null);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadPosts();
  }, []);

  // Filter posts by tag if one is selected
  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags && post.tags.includes(selectedTag))
    : posts;

  // Get all unique tags from all posts
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="blog-page container mx-auto px-4 py-8">
      <Helmet>
        <title>Blog | PvPing MC</title>
        <meta name="description" content="Latest news, guides, and updates from the PvPing Minecraft server." />
      </Helmet>
      
      <h1 className="text-4xl font-bold text-center mb-8">Server Blog</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loader"></div>
          <p className="ml-3">Loading posts...</p>
        </div>
      ) : (
        <>
          {/* Tags filter */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Filter by tag:</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm ${!selectedTag ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${selectedTag === tag ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {filteredPosts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No posts found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <div 
                  key={post.id} 
                  className="blog-card bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]"
                >
                  <Link to={`/blog/${post.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      {post.thumbnail ? (
                        <img 
                          src={post.thumbnail} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/default-blog.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-xl text-white font-semibold">PvPing MC</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-5">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FiCalendar className="mr-1" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    
                    <Link to={`/blog/${post.id}`}>
                      <h2 className="text-xl font-bold mb-2 hover:text-purple-600 transition-colors">{post.title}</h2>
                    </Link>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {post.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedTag(tag);
                              window.scrollTo(0, 0);
                            }}
                            className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-purple-100 text-gray-700 hover:text-purple-700"
                          >
                            <FiTag className="mr-1" />
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <Link 
                      to={`/blog/${post.id}`} 
                      className="mt-4 inline-block text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Blog; 