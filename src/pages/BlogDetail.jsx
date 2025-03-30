import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import storeImg from '../assets/store.png';
import { FiBook, FiArrowLeft, FiShare2, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';
import { getPostById, getAllPosts } from '../utils/markdown';

// Related post card component with hover animation
const RelatedPostCard = ({ post }) => {
  // Function to get tag colors
  const getTagColor = (tag) => {
    switch (tag) {
      case 'news':
        return 'bg-green-600';
      case 'welcome':
        return 'bg-blue-600';
      case 'server':
        return 'bg-purple-600';
      case 'update':
        return 'bg-red-600';
      case 'features':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Link to={`/blog/${post.id}`} className="block">
      <div className="bg-[#111827] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-900/20">
        <img 
          src={post.thumbnail ? post.thumbnail : storeImg} 
          alt={post.title} 
          className="w-full h-40 object-cover"
        />
        <div className="p-5">
          <h3 className="font-bold text-2xl mb-2">{post.title}</h3>
          <p className="text-gray-400 text-lg mb-3">Posted on {formatDate(post.date)}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags && post.tags.map((tag, index) => (
              <span key={index} className={`${getTagColor(tag)} text-base px-3 py-1 rounded shadow-sm`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        
        // Fetch the current post
        const postData = await getPostById(id);
        
        if (!postData) {
          setError('Post not found');
          setLoading(false);
          return;
        }
        
        setPost(postData);
        
        // Fetch related posts (posts with similar tags or recent posts)
        const allPosts = await getAllPosts();
        
        // Filter out the current post
        const otherPosts = allPosts.filter(p => p.id !== id);
        
        // Find posts with similar tags if the current post has tags
        let similar = [];
        if (postData.tags && postData.tags.length > 0) {
          similar = otherPosts.filter(p => 
            p.tags && p.tags.some(tag => postData.tags.includes(tag))
          );
        }
        
        // If we don't have enough similar posts, add recent posts
        if (similar.length < 2) {
          const recentPosts = otherPosts
            .filter(p => !similar.some(s => s.id === p.id))
            .slice(0, 2 - similar.length);
          
          similar = [...similar, ...recentPosts];
        }
        
        // Limit to 2 related posts
        setRelatedPosts(similar.slice(0, 2));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
        setLoading(false);
      }
    };
    
    fetchPostData();
  }, [id]);
  
  // Get tag color function for the post tags
  const getTagColor = (tag) => {
    switch (tag) {
      case 'news':
        return 'bg-green-600';
      case 'welcome':
        return 'bg-blue-600';
      case 'server':
        return 'bg-purple-600';
      case 'update':
        return 'bg-red-600';
      case 'features':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Share the post
  const sharePost = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Blog Post';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url)
          .then(() => alert('Link copied to clipboard!'))
          .catch(err => console.error('Could not copy text: ', err));
    }
  };

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-16 flex items-center gap-3">
          <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
            <FiBook className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Blog</h1>
            <div className="w-24 h-1 bg-blue-500 mt-1"></div>
          </div>
        </div>
        
        <Link 
          to="/blog" 
          className="inline-flex items-center text-lg text-blue-400 hover:text-blue-300 mb-8 transition-all duration-300 hover:translate-x-[-5px]"
        >
          <FiArrowLeft className="mr-2" /> Back to Blog
        </Link>
        
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">Loading blog post...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-400">{error}</p>
            <p className="text-gray-400 mt-2">
              The post you're looking for might not exist or has been removed.
            </p>
            <button 
              onClick={() => navigate('/blog')} 
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
            >
              Back to Blog
            </button>
          </div>
        )}
        
        {!loading && !error && post && (
          <>
            <div className="bg-[#111827] rounded-xl p-8 shadow-xl mb-12">
              <img 
                src={post.thumbnail ? post.thumbnail : storeImg} 
                alt={post.title} 
                className="w-full h-96 object-cover rounded-xl mb-8"
              />
              
              <div className="flex flex-wrap gap-3 mb-6">
                {post.tags && post.tags.map((tag, index) => (
                  <span key={index} className={`${getTagColor(tag)} text-base px-3 py-1 rounded shadow-sm`}>
                    {tag}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <p className="text-gray-400 text-xl mb-8">Posted on {formatDate(post.date)}</p>
              
              <div 
                className="prose prose-invert prose-lg max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
              />
              
              <div className="mt-12 pt-8 border-t border-gray-700">
                <h3 className="text-2xl font-bold mb-4">Share This Post</h3>
                <div className="flex gap-4">
                  <button 
                    className="p-3 bg-[#1DA1F2] rounded-full text-white hover:scale-110 transition-all duration-300"
                    onClick={() => sharePost('twitter')}
                  >
                    <FiTwitter size={24} />
                  </button>
                  <button 
                    className="p-3 bg-[#4267B2] rounded-full text-white hover:scale-110 transition-all duration-300"
                    onClick={() => sharePost('facebook')}
                  >
                    <FiFacebook size={24} />
                  </button>
                  <button 
                    className="p-3 bg-[#0077B5] rounded-full text-white hover:scale-110 transition-all duration-300"
                    onClick={() => sharePost('linkedin')}
                  >
                    <FiLinkedin size={24} />
                  </button>
                  <button 
                    className="p-3 bg-gray-700 rounded-full text-white hover:scale-110 transition-all duration-300"
                    onClick={() => sharePost('copy')}
                  >
                    <FiShare2 size={24} />
                  </button>
                </div>
              </div>
            </div>
            
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-8">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedPosts.map(relatedPost => (
                    <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;