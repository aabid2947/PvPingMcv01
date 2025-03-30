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
          
          <p className="text-gray-400 text-lg">
            {post.excerpt}
          </p>
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
        setPosts(allPosts);
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
    <div className="w-full bg-[#13141d] text-white min-h-screen">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-16 flex items-center">
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
        
        <p className="text-gray-300 text-2xl mb-12">
          Stay up to date with the latest server updates, events, and community news
        </p>
        
        {loading && (
          <div className="text-center py-8">
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
          <div className="text-center py-8">
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