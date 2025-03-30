import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import storeImg from '../assets/store.png';
import { FiBook } from 'react-icons/fi';
import arrow from "../assets/arrow.png";
import { getAllPosts } from '../utils/markdown';

// Blog card component with hover animation
const BlogCard = ({ post }) => {
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

  return (
    <Link to={`/blog/${post.id}`} className="block">
      <div className="bg-[#13141d] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:transform hover:scale-102 hover:shadow-xl hover:shadow-blue-900/20">
        <div className="h-48 relative">
          <img 
            src={post.thumbnail ? post.thumbnail : storeImg} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {post.tags && post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={`${getTagColor(tag)} text-xs font-medium px-2 py-1 rounded shadow-sm`}>
                {tag}
              </span>
            ))}
            {post.tags && post.tags.length > 3 && (
              <span className="bg-gray-700 text-xs font-medium px-2 py-1 rounded shadow-sm">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-400 text-sm mb-2">Posted on {formatDate(post.date)}</p>
          <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">{post.title}</h3>
          <p className="text-gray-400 text-base line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-4 text-blue-400 text-sm font-medium">Read More →</div>
        </div>
      </div>
    </Link>
  );
};

const BlogOverview = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const allPosts = await getAllPosts();
        
        // Sort posts by date (newest first)
        const sortedPosts = allPosts.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        setPosts(sortedPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen pb-16">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-8 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
              <FiBook className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Blog</h1>
              <div className="w-24 h-1 bg-blue-500 mt-1"></div>
            </div>
          </div>
          <div className="w-8 h-8 ml-4">
            <img src={arrow} alt="" />
          </div>
        </div>
        
        <p className="text-gray-300 text-xl mb-8">
          Stay up to date with the latest server updates, events, and community news
        </p>
        
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xl text-gray-400">Loading blog posts...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-xl text-red-400">{error}</p>
            <p className="text-gray-400 mt-2">Please try again later or contact support if the issue persists.</p>
          </div>
        )}
        
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12 bg-[#111827]/60 backdrop-blur-sm rounded-xl shadow-lg">
            <p className="text-xl text-gray-400">No blog posts found</p>
            <p className="text-gray-400 mt-2">Check back later for new content!</p>
          </div>
        )}
        
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogOverview;