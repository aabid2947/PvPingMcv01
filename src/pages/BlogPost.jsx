import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiArrowLeft, FiTag } from 'react-icons/fi';
import { getPostById, getAllPosts } from '../utils/markdown';
import { Helmet } from 'react-helmet-async';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        const postData = await getPostById(id);
        
        if (!postData) {
          setError('Post not found');
          return;
        }
        
        setPost(postData);
        
        // Load related posts (posts with same tags)
        const allPosts = await getAllPosts();
        const related = allPosts
          .filter(p => p.id !== id && p.tags && postData.tags && 
            p.tags.some(tag => postData.tags.includes(tag)))
          .slice(0, 3); // Get up to 3 related posts
        
        setRelatedPosts(related);
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    }
    
    loadPost();
  }, [id]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Estimate read time (1 minute per 200 words)
  const calculateReadTime = (content) => {
    if (!content) return '1 min read';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="loader"></div>
        <p className="ml-3">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 inline-block">
          {error || 'Post not found'}
        </div>
        <div>
          <button
            onClick={() => navigate('/blog')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mt-4"
          >
            Return to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page container mx-auto px-4 py-8">
      <Helmet>
        <title>{post.title} | PvPing MC Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>
      
      <Link to="/blog" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
        <FiArrowLeft className="mr-2" />
        Back to all posts
      </Link>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.thumbnail && (
          <div className="h-64 sm:h-80 md:h-96 overflow-hidden">
            <img 
              src={post.thumbnail} 
              alt={post.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/default-blog.jpg';
              }}
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-4">
            <div className="flex items-center">
              <FiCalendar className="mr-1" />
              <span>{formatDate(post.date)}</span>
            </div>
            
            <div className="flex items-center">
              <FiClock className="mr-1" />
              <span>{calculateReadTime(post.content)}</span>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link 
                    key={tag}
                    to={`/blog?tag=${tag}`}
                    className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-purple-100 text-gray-700 hover:text-purple-700"
                  >
                    <FiTag className="mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div 
            className="prose prose-lg max-w-none prose-headings:text-purple-900 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg" 
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          ></div>
        </div>
      </article>
      
      {relatedPosts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => (
              <div 
                key={relatedPost.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link to={`/blog/${relatedPost.id}`}>
                  <div className="h-40 overflow-hidden">
                    {relatedPost.thumbnail ? (
                      <img 
                        src={relatedPost.thumbnail} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/default-blog.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-medium">PvPing MC</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 hover:text-purple-600 transition-colors">{relatedPost.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogPost; 