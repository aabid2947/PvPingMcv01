import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import storeImg from '../assets/store.png';
import { FiBook, FiArrowLeft, FiShare2, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';
import { getPostById } from '../utils/markdown';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
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
      case 'announcement':
        return 'bg-orange-600';
      case 'changelog':
        return 'bg-indigo-600';
      case 'event':
        return 'bg-pink-600';
      case 'seasonal':
        return 'bg-teal-600';
      case 'guide':
        return 'bg-cyan-600';
      case 'tutorial':
        return 'bg-emerald-600';
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
    <div className="w-full bg-[#13141d] text-white min-h-screen pt-6">
      <div className="container mx-auto md:w-4/5 px-4 py-6">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center text-lg text-blue-400 hover:text-blue-300 transition-all duration-300 hover:translate-x-[-5px] mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back to Blog
        </Link>
        
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
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
              Return to Blog
            </button>
          </div>
        )}
        
        {!loading && !error && post && (
          <>
            {/* Main Blog Post */}
            <div className="bg-[#111827]/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-blue-900/10 mb-12">
              {/* Top Meta Section */}
              <div className="mb-6 flex flex-wrap gap-2">
                {post.tags && post.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`${getTagColor(tag)} text-sm px-3 py-1 rounded`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{post.title}</h1>
              
              {/* Post Metadata */}
              <div className="mb-8 text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span>Posted on {formatDate(post.date)}</span>
                
                {/* Share buttons */}
                <div className="flex items-center">
                  <span className="mr-2">Share:</span>
                  <button 
                    onClick={() => sharePost('twitter')} 
                    className="text-white bg-[#1DA1F2] rounded-full p-1.5 mx-1 hover:bg-opacity-80 transition-all"
                    aria-label="Share on Twitter"
                  >
                    <FiTwitter />
                  </button>
                  <button 
                    onClick={() => sharePost('facebook')} 
                    className="text-white bg-[#4267B2] rounded-full p-1.5 mx-1 hover:bg-opacity-80 transition-all"
                    aria-label="Share on Facebook"
                  >
                    <FiFacebook />
                  </button>
                  <button 
                    onClick={() => sharePost('linkedin')} 
                    className="text-white bg-[#0A66C2] rounded-full p-1.5 mx-1 hover:bg-opacity-80 transition-all"
                    aria-label="Share on LinkedIn"
                  >
                    <FiLinkedin />
                  </button>
                  <button 
                    onClick={() => sharePost('copy')} 
                    className="text-white bg-gray-700 rounded-full p-1.5 mx-1 hover:bg-opacity-80 transition-all"
                    aria-label="Copy link"
                  >
                    <FiShare2 />
                  </button>
                </div>
              </div>
              
              {/* Featured Image */}
              <div className="rounded-xl overflow-hidden mb-8 shadow-lg">
                <img 
                  src={post.thumbnail ? post.thumbnail : storeImg}
                  alt={post.title}
                  className="w-full h-auto object-cover max-h-[400px]"
                />
              </div>
              
              {/* Blog Content */}
              <div 
                className="prose prose-lg prose-invert max-w-none prose-headings:text-blue-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              ></div>
              
              {/* Tags at the bottom */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-xl font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags && post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className={`${getTagColor(tag)} text-sm px-3 py-1 rounded`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;