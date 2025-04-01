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
    switch (tag.toLowerCase()) {
      case 'news': return 'bg-green-600';
      case 'welcome': return 'bg-blue-600';
      case 'server': return 'bg-purple-600';
      case 'update': return 'bg-red-600';
      case 'features': return 'bg-yellow-600';
      case 'event': return 'bg-orange-600';
      case 'seasonal': return 'bg-teal-600';
      case 'announcement': return 'bg-indigo-600';
      case 'factions': return 'bg-pink-600';
      case 'changelog': return 'bg-cyan-600';
      case 'pvp': return 'bg-rose-600';
      case 'tournament': return 'bg-lime-600';
      case 'patch': return 'bg-amber-600';
      case 'economy': return 'bg-emerald-600';
      case 'raid': return 'bg-red-700';
      case 'survival': return 'bg-green-700';
      case 'hardcore': return 'bg-gray-800';
      case 'summer': return 'bg-sky-600';
      case 'modpack': return 'bg-fuchsia-600';
      case 'vanilla': return 'bg-stone-600';
      case 'creative': return 'bg-purple-500';
      case 'skyblock': return 'bg-blue-700';
      case 'guide': return 'bg-violet-700';
      case 'leaderboard': return 'bg-gray-500';
      case 'clans': return 'bg-rose-500';
      case 'battlepass': return 'bg-yellow-700';
      case 'quests': return 'bg-cyan-700';
      case 'map': return 'bg-red-800';
      case 'skins': return 'bg-green-500';
      case 'mods': return 'bg-blue-500';
      case 'weapons': return 'bg-orange-700';
      case 'tutorial': return 'bg-amber-500';
      case 'parkour': return 'bg-pink-500';
      case 'leaderboard': return 'bg-gray-500';
      case 'speedrun': return 'bg-blue-800';
      case 'admin': return 'bg-purple-800';
      case 'battle': return 'bg-red-500';
      case 'rpg': return 'bg-teal-700';
      case 'celebration': return 'bg-green-800';
      case 'build': return 'bg-yellow-500';
      case 'trade': return 'bg-lime-500';
      case 'enchantments': return 'bg-indigo-700';
      case 'beginners': return 'bg-orange-900';
      case 'endgame': return 'bg-fuchsia-700';
      case 'farming': return 'bg-green-900';
      default: return 'bg-gray-600';
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };
  
  // Ensure tags are in array format
  const renderTags = () => {
    if (!post.tags) return null;
    
    // If tags is a string, split it by spaces
    const tagsArray = Array.isArray(post.tags) 
      ? post.tags 
      : typeof post.tags === 'string' 
        ? post.tags.split(' ').filter(Boolean)
        : [];
    
    if (tagsArray.length === 0) return null;
    
    // Limit to 3 visible tags
    const visibleTags = tagsArray.slice(0, 3);
    
    return (
      <>
        {visibleTags.map((tag, index) => (
          <span key={index} className={`${getTagColor(tag)} text-xs font-medium px-2 py-1 rounded shadow-sm`}>
            {tag}
          </span>
        ))}
        {tagsArray.length > 3 && (
          <span className="bg-gray-700 text-xs font-medium px-2 py-1 rounded shadow-sm">
            +{tagsArray.length - 3}
          </span>
        )}
      </>
    );
  };

  return (
    <Link to={`/blog/${post.id}`} className="block h-full">
      <div className="bg-[#13141d] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:transform hover:scale-102 hover:shadow-xl hover:shadow-blue-900/20 h-full flex flex-col">
        <div className="h-48 relative">
          <img 
            src={post.thumbnail || storeImg} 
            alt={post.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = storeImg;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {renderTags()}
          </div>
        </div>
        <div className="p-5 flex-grow flex flex-col">
          <p className="text-gray-400 text-sm mb-2">Posted on {formatDate(post.date)}</p>
          <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">{post.title}</h3>
          <p className="text-gray-400 text-base line-clamp-3 flex-grow">
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
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch blog posts...');
        
        const startTime = performance.now();
        const allPosts = await getAllPosts();
        console.log(allPosts)
        const endTime = performance.now();
        
        console.log(`Blog post fetching took ${(endTime - startTime).toFixed(2)}ms`);
        
        if (!allPosts || allPosts.length === 0) {
          console.warn('No posts returned from getAllPosts');
          setError('No blog posts found');
          setLoading(false);
          return;
        }
        
        const postInfo = allPosts.map(post => ({
          id: post.id,
          title: post.title,
          date: post.date
        }));
        
        console.log(`Loaded ${allPosts.length} blog posts successfully:`, postInfo);
        setDebugInfo({
          count: allPosts.length,
          posts: postInfo,
          fetchTime: (endTime - startTime).toFixed(2)
        });
        
        // Sort posts by date (newest first)
        const sortedPosts = allPosts.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        setPosts(sortedPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen pb-16">
      <div className="w-full container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-8 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#3ABCFD] rounded-full w-12 h-12 flex items-center justify-center">
              <FiBook className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
              <div className="w-5 h-1 bg-blue-500 mt-1"></div>
            </div>
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
          <>
            {/* Post Counter */}
            <div className="mb-6 text-gray-400">
              <p>Showing {posts.length} blog posts</p>
            </div>
            
            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            
            {/* Debug Information (only in development) */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <div className="mt-10 p-4 bg-gray-800 rounded-lg text-xs overflow-auto">
                <h3 className="text-white font-bold mb-2">Debug Info</h3>
                <p>Posts loaded: {debugInfo.count}</p>
                <p>Fetch time: {debugInfo.fetchTime}ms</p>
                <details>
                  <summary className="cursor-pointer text-blue-400">Post List</summary>
                  <pre className="mt-2 text-gray-400 overflow-x-auto">{JSON.stringify(debugInfo.posts, null, 2)}</pre>
                </details>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogOverview;