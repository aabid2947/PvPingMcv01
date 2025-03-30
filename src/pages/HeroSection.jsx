import React from "react"
import pvping from "../assets/thumb_logo.png"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Play, ChevronRight, Menu, X, Copy, ExternalLink } from "lucide-react"
import Trailer from "../assets/trailer.png";
import heroSectionBg from "../assets/herosection bg.png";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import blue from "../api/blue.png"
import green from "../api/green.png"

import MinecraftServerPromoWithImages from "../components/minecraft-server-promo-with-images";

export default function OriginMC() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [isPlayerCountLoading, setIsPlayerCountLoading] = useState(true);
  const [discordCount, setDiscordCount] = useState(847); // Placeholder for actual Discord API call
  const [copiedServer, setCopiedServer] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const location = useLocation();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Fetch player count from API
  useEffect(() => {
    const fetchPlayerCount = async () => {
      try {
        setIsPlayerCountLoading(true);
        const response = await axios.get('https://api.mcsrvstat.us/2/play.pvpingmc.net');

        
        // Check if the server is online and has player data
        if (response.data && response.data.online) {
          if (response.data.players && typeof response.data.players.online === 'number') {
            setPlayerCount(response.data.players.online);
          }
        }
      } catch (error) {
        console.error('Error fetching player count:', error);
        // Fallback to default count on error
        setPlayerCount(0);
      } finally {
        setIsPlayerCountLoading(false);
      }
    };

    fetchPlayerCount();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchPlayerCount, 5 * 60 * 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to determine if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const copyServerAddress = () => {
    navigator.clipboard.writeText("play.pvpingmc.net");
    setCopiedServer(true);
    setTimeout(() => setCopiedServer(false), 2000);
  };

  const openDiscord = () => {
    window.open("http://pvpingmc.net/discord", "_blank");
  };

  // Style classes - updated for smoother transitions
  const activeClass = "bg-blue-500 px-4 py-1.5 rounded-md font-extrabold transition-all duration-300";
  const inactiveClass = "hover:text-blue-400 transition-all duration-300 font-medium";
  const mobileActiveClass = "bg-blue-500 px-4 py-2 font-extrabold text-left w-full block transition-all duration-300";
  const mobileInactiveClass = "hover:text-blue-400 transition-all duration-300 py-2 text-left font-medium w-full block";

  return (
    <div className={`${isHomePage ? 'min-h-screen' : 'min-h-[80px] md:min-h-[120px]'} bg-[#13141d] text-white mt-6 w-full`}
         style={{ backgroundImage: `url(${heroSectionBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Navigation */}
      <nav className={`w-full container mx-auto md:w-4/5 px-4  px-4 flex items-center justify-between relative`}>
        {/* Mobile Hamburger - positioned to the left */}
        <div className="md:hidden z-50" ref={hamburgerRef}>
          <button
            onClick={toggleMenu}
            className="text-white hover:text-blue-400 transition-colors p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Logo */}
        {/* <div className="md:hidden mx-auto">
          <img 
            src={pvping} 
            alt="Origin MC Logo" 
            className="h-10 w-auto"
          />
        </div> */}

        {/* Placeholder for right alignment */}
        <div className="md:hidden w-6"></div>

        {/* Desktop Navigation */}
        <div className={`hidden md:flex items-center gap-8 mx-auto mt-4 mb-12`}>
          <NavLink to="/" className={({isActive}) => isActive ? activeClass : inactiveClass} end>
            Home
          </NavLink>
          <NavLink to="/blog" className={({isActive}) => isActive ? activeClass : inactiveClass}>
            Blog
          </NavLink>
          <NavLink to="/vote" className={({isActive}) => isActive ? activeClass : inactiveClass}>
            Vote
          </NavLink>
          <NavLink to="/originpass" className={({isActive}) => isActive ? activeClass : inactiveClass}>
            Origins Pass
          </NavLink>
          <NavLink to="/store" className={({isActive}) => isActive ? activeClass : inactiveClass}>
            Store
          </NavLink>
          <NavLink to="/rules" className={({isActive}) => isActive ? activeClass : inactiveClass}>
            Rules
          </NavLink>
          <div className="relative group">
            <Link to="#" className="hover:text-blue-400 transition-colors flex items-center font-medium">
              More <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={toggleMenu}>
        </div>
        
        {/* Sidebar */}
        <div
          ref={menuRef}
          className={`fixed top-0 left-0 w-3/4 max-w-xs md:hidden bg-[#1a1b26] border-r border-blue-800/30 shadow-lg z-50 h-full overflow-auto pt-20 pb-6 transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col w-full">
            <NavLink
              to="/"
              className={({isActive}) => isActive ? mobileActiveClass : mobileInactiveClass}
              onClick={toggleMenu}
              end
            >
              <div className="px-4 py-3 border-b border-gray-800/50">Home</div>
            </NavLink>
            <NavLink
              to="/blog"
              className={({isActive}) => isActive ? mobileActiveClass : mobileInactiveClass}
              onClick={toggleMenu}
            >
              <div className="px-4 py-3 border-b border-gray-800/50">Blog</div>
            </NavLink>
            <NavLink
              to="/vote"
              className={({isActive}) => isActive ? mobileActiveClass : mobileInactiveClass}
              onClick={toggleMenu}
            >
              <div className="px-4 py-3 border-b border-gray-800/50">Vote</div>
            </NavLink>
            <NavLink
              to="/originpass"
              className={({isActive}) => isActive ? mobileActiveClass : mobileInactiveClass}
              onClick={toggleMenu}
            >
              <div className="px-4 py-3 border-b border-gray-800/50">Origins Pass</div>
            </NavLink>
            <NavLink
              to="/store"
              className={({isActive}) => isActive ? mobileActiveClass : mobileInactiveClass}
              onClick={toggleMenu}
            >
              <div className="px-4 py-3 border-b border-gray-800/50">Store</div>
            </NavLink>
            <NavLink
              to="/rules"
              className={({isActive}) => isActive ? mobileActiveClass : mobileInactiveClass}
              onClick={toggleMenu}
            >
              <div className="px-4 py-3 border-b border-gray-800/50">Rules</div>
            </NavLink>
            <NavLink
              to="/pvpingmc"
              className={({isActive}) => isActive ? mobileActiveClass : mobileInactiveClass}
              onClick={toggleMenu}
            >
              <div className="px-4 py-3">PvPingMC</div>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero Section - Only shown on home page */}
      
        <>
          <div className="relative  w-full">
            <div className="w-full container mx-auto md:w-4/5 px-4 flex flex-col md:flex-row items-center justify-between">
              {/* Left Side - Made Clickable */}
              <div className="hidden lg:block mb-8 md:mb-0 text-center md:text-left cursor-pointer group" onClick={copyServerAddress}>
                <div className="flex flex-col items-center md:items-start">
                  <h2 className="text-xl md:text-2xl font-extrabold mb-2 group-hover:text-blue-400 transition-colors">Start your adventure today!</h2>
                  <div className="flex items-center">
                    <p className="text-gray-400 text-sm mr-2">Join us on play.pvpingmc.net</p>
                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-sm text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {copiedServer ? "Copied!" : "Click to copy"}
                  </p>
                  <p className="text-blue-400 text-sm mt-2">
                    {isPlayerCountLoading ? (
                      <span className="inline-block animate-pulse">Loading players...</span>
                    ) : (
                      <span>{playerCount} players online</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Center Logo */}
              <div className="z-10 w-64 h-64 md:w-80 md:h-80 block mx-auto my-4 md:my-0">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#00ff85] to-[#00a1ff] opacity-30 rounded-full"></div>
                  <img
                    src={pvping}
                    alt="Origin MC Logo"
                    className="relative z-10 h-60 w-60 md:h-64 md:w-80 mx-auto"
                  />
                </div>
              </div>

              {/* Right Side - Made Clickable */}
              <div className="hidden lg:block  text-center md:text-right cursor-pointer group" onClick={openDiscord}>
                <div className="flex flex-col items-center md:items-end">
                  <h2 className="text-xl md:text-2xl font-extrabold mb-2 group-hover:text-blue-400 transition-colors">Join our discord server!</h2>
                  <div className="flex items-center">
                    <p className="text-gray-400 text-sm mr-2">discord.gg/pvpingmc</p>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-sm text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to open
                  </p>
                  <p className="text-blue-400 text-sm mt-2">{discordCount} members online</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video and Ready to Play Section - Only shown on home page */}
          {isHomePage && (
          <>
          <div className="w-full container mx-auto md:w-4/5 px-4 py-8 md:py-16 grid md:grid-cols-2 gap-8">
            {/* Video Section */}
            <div className="relative rounded-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30"></div>
              <img
                src={Trailer}
                alt="Gameplay Video"
                width={500}
                height={300}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white/20 hover:bg-white/30 transition-colors rounded-full p-4 backdrop-blur-sm group-hover:scale-110 duration-300">
                  <Play className="h-8 w-8 text-white" fill="white" />
                </button>
              </div>
            </div>

            {/* Ready to Play Section - Adjusted to match Figma with less padding */}
            <div className="relative flex items-center justify-center wrap rounded-xl bg-gradient-to-b from-[#131834] to-[#0D1117] p-6 shadow-xl ">
              {/* Blue Crystal Decoration - Top Right */}
              <div className="absolute top-[-30px] right-[-30px] ">
              <img src={blue} alt=""
                height={120}
                width={120}
                className="brightness-130"
                 />
              </div>
              
              {/* Green Crystal Decoration - Bottom Left */}
              <div className="absolute bottom-[-30px] left-[-30px] ">
                
                <img src={green} alt=""
                height={100}
                width={100}
                className="brightness-130"
                 />
                  {/* <div className="w-full h-full bg-green-400 opacity-50 rotate-12"></div> */}
             
              </div>
              
              {/* Content */}
              <div className="text-center relative z-10">
                <h2 className="text-xl md:text-2xl font-bold mb-3">Ready to play?</h2>
                <p className="text-gray-300 text-xs md:text-sm mb-5 max-w-md mx-auto">
                  OriginMC is a freshly new and custom survival community. Learn 
                  how to join the server on Java Edition and start playing in 
                  less than 30 seconds.
                </p>
                {/* <Button
                  className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-1.5 px-10 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 uppercase tracking-wide shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                  style={{button:}}
                >
                  PLAY NOW
                  
                </Button> */}

                <button
  className="w-64 h-10 inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-1.5 px-10 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 uppercase tracking-wide shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
  style={{
    clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)"
  }}
>
  PLAY NOW
</button>

              </div>
            </div>
            {/* <MinecraftServerPromoWithImages/> */}
          </div>
          </>)}
        </>
  
    </div>
  )
}

