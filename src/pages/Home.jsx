import React, { useState, useEffect } from "react"
import pvping from "../assets/thumb_logo.png"
import { Link } from "react-router-dom"
import frame from "../assets/Frame 2.png";
import pngtree from "../assets/pngtree.png"
import storeImg from "../assets/store.png";
import arrow from "../assets/arrow.png"
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../utils/markdown";
import JoinDiscord from "../components/JoinDiscord";

// News card component with hover animation and link to blog detail
const NewsCard = ({ post }) => {
  // Get tag color function
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
    <Link to={`/blog/${post.id}`} className="block w-full">
      <div className="bg-[#111827] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-900/20 h-full">
        <img
          src={post.thumbnail ? post.thumbnail : storeImg}
          alt={post.title}
          width={400}
          height={150}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = storeImg;
          }}
        />
        <div className="p-3 md:p-5">
          <h3 className="font-bold text-lg md:text-xl lg:text-2xl mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-gray-400 text-sm md:text-base mb-2 md:mb-3">Posted on {formatDate(post.date)}</p>
          <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
            {post.tags && post.tags.map((tag, index) => (
              <span key={index} className={`${getTagColor(tag)} text-xs md:text-sm px-2 md:px-3 py-1 rounded shadow-sm`}>
                {tag}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm md:text-base line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default function OriginMC() {
  const navigate = useNavigate();
  const [featuredPosts, setFeaturedPosts] = useState([]);
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
        
        // Get the 3 most recent posts
        setFeaturedPosts(sortedPosts.slice(0, 3));
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
    <div className="min-h-screen bg-[#13141d] text-white mt-6 w-full">
      {/* Page Header */}
      {/* not necessary */}
      {/* <div className="container mx-auto md:w-4/5 px-4 pt-8">
        <div className="mb-12 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
              <HomeIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Home</h1>
              <div className="w-24 h-1 bg-blue-500 mt-1"></div>
            </div>
          </div>
          <div className="w-8 h-8 ml-4">
            <img src={arrow} alt="" />
          </div>
        </div>
      </div> */}

      {/* Latest News Section */}
      <div className="w-full container mx-auto px-4 md:w-4/5 py-8">
        <div onClick={()=>navigate('/blog')} className="flex items-center gap-3 mb-8 hover:cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <img src={arrow} alt="" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Latest News</h2>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-xl text-gray-400">Loading latest posts...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-xl text-red-400">{error}</p>
            <p className="text-gray-400 mt-2">Please try again later or check out our blog page for all posts.</p>
          </div>
        )}

        {!loading && !error && featuredPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xl text-gray-400 text-wrap ">No posts available</p>
            <p className="text-gray-400 mt-2">Check back later for news and updates!</p>
          </div>
        )}

        {!loading && !error && featuredPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {featuredPosts.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      {/* <JoinDiscord /> */}
      {/* Discord Community Section - Updated to match the image */}
      <div className="w-full container mx-auto px-4 md:w-4/5 py-8 md:py-16">
  <div className="bg-[#13141d] border border-gray-800 rounded-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-lg">
    {/* Left Side - Minecraft Character */}
    <div className="relative z-10 p-6 md:p-8">
      <img
        src={pngtree}
        alt="Minecraft Character"
        className="h-32 md:h-40 w-auto"
      />
    </div>

    {/* Center Content */}
    <div className="text-center md:text-left relative z-10 p-4 md:p-6 flex-1 ">
      <h2 className="text-xl md:text-2xl font-bold mb-2">
        Join our discord community!
      </h2>
      <p className="text-gray-400 text-ellipsis text-sm md:text-base">
        Find new friends to explore dungeons, build a <span className="text-blue-400">town</span> and discover <span className="text-red-400">rich</span> together.
        <br className="hidden md:block " />
        We also offer <span className="font-semibold">NVT</span> support.
      </p>
      <div className="relative z-10 p-6 md:p-8">
      <a
        href="http://pvpingmc.net/discord"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#5865F2] hover:bg-[#4752c4] transition-all duration-300 text-white font-medium py-2 px-6 rounded-md inline-block shadow-md hover:shadow-lg"
      >
        Join discord!
      </a>
    </div>
    </div>

    {/* Discord Button */}
    

    {/* Right Side Decorative Image */}
    <div className="hidden md:block   h-[17rem] w-2/5">
      <img
        src={frame}
        alt="Server Background"
        className="h-full w-full object-cover opacity-50"
      />
    </div>
  </div>
</div>

    </div>
  )
}

