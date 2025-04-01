// import { Navbar } from "@/components/navbar"

import React from 'react';
import { FiExternalLink, FiCircle, FiHelpCircle, FiGift, FiClock, FiDollarSign, FiThumbsUp } from 'react-icons/fi';
import pvpingmc from  "../assets/pvpingmc.png"

const Vote = () => {
  const votingLinks = [
    { id: 1, name: "Link 1", url: "#" },
    { id: 2, name: "Link 2", url: "#" },
    { id: 3, name: "Link 3", url: "#" },
    { id: 4, name: "Link 4", url: "#" },
    { id: 5, name: "Link 5", url: "#" }
  ];

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        {/* Header section */}
        <div className="mb-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#3ABCFD] rounded-full w-12 h-12 flex items-center justify-center">
              <FiThumbsUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Server Voting</h1>
              <div className="w-6 h-1 bg-blue-500 mt-1"></div>
            </div>
          </div>
      
        </div>

        {/* Main vote button */}
        <div className="mb-12">
          <button className="group w-full bg-gradient-to-b from-[#45DFFE] to-[#4996F7] text-white text-xl font-bold py-5 rounded-lg transition-all duration-300 shadow-xl shadow-blue-700/20 transform hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              {/* Top left */}
              <span className="absolute top-[10%] left-[5%] text-3xl font-black rotate-[-10deg] select-none opacity-90 text-white">
                PvPingMC
              </span>
              
              {/* Center */}
              <span className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black rotate-[5deg] select-none opacity-90 text-white">
                PvPingMC
              </span>
              
              {/* Between center and left */}
              <span className="absolute top-[50%] left-[25%] transform -translate-y-1/2 text-2xl font-black rotate-[-15deg] select-none opacity-90 text-white">
                PvPingMC
              </span>
              
              {/* Bottom right */}
              <span className="absolute bottom-[10%] right-[5%] text-3xl font-black rotate-[15deg] select-none opacity-90 text-white">
                PvPingMC
              </span>
              
              {/* Add logo image in the background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img 
                  src={pvpingmc} 
                  alt="" 
                  className="opacity-8 w-32 object-contain mix-blend-soft-light"
                  aria-hidden="true"
                />
              </div>
            </div>
            <span className="relative z-10">VOTE FOR PvPingMC TO EARN REWARDS</span>
          </button>
        </div>

        {/* Vote content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left column - Voting Links */}
          <div className="md:col-span-4">
            <div className="bg-[#151c2c] p-5 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FiExternalLink className="mr-2 text-blue-400" />
                Voting Links
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                Use all the links below to get the maximum number of rewards for helping preserve in the long server lifetime.
              </p>
              <div className="grid grid-cols-2 justify-center gap-4 auto-rows-auto">
  {votingLinks.map((link, index) => (
    <div
      key={link.id}
      className={`bg-gradient-to-br flex justify-center from-[#1a2337] to-[#232e47] rounded-lg p-4 hover:bg-gradient-to-br hover:from-[#1d2943] hover:to-[#2a3753] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-900/20 transform hover:scale-105 ${
        votingLinks.length % 2 !== 0 && index === votingLinks.length - 1 ? "col-span-2 justify-self-center w-3/5" : ""
      }`}
    >
      <a href={link.url} className="text-blue-400 font-medium flex items-center">
        <FiExternalLink className="mr-2" />
        {link.name}
      </a>
    </div>
  ))}
</div>

            </div>
          </div>

          {/* Right column - Info sections */}
          <div className="md:col-span-8 space-y-6">
            {/* Why vote section */}
            <div className="bg-[#151c2c] p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px]">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiHelpCircle className="mr-2 text-blue-400" />
                Why vote for PvPingMc?
              </h3>
              <div className="bg-[#1a2337] p-4 rounded-lg shadow-inner">
                <p className="text-gray-300 text-sm mb-4">
                  When you vote for our server, you're helping the community to continue to grow and for even more players to join. As a token of our gratitude for your contributions, we reward you with valuable in-game items and other benefits.
                </p>
                <p className="text-blue-400 text-sm font-medium">
                  Make sure to vote on all five links every day to get more rank-ups and better rewards!
                </p>
              </div>
            </div>

            {/* How to vote section */}
            <div className="bg-[#151c2c] p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px]">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiHelpCircle className="mr-2 text-blue-400" />
                How to vote for PvPingMc
              </h3>
              <div className="bg-[#1a2337] p-4 rounded-lg shadow-inner">
                <p className="text-gray-300 text-sm">
                  Voting for us is very simple: It's just one click up in each link to vote in our server through various voting platforms. Simply click "Vote" and it is done in a simple step.
                </p>
              </div>
            </div>

            {/* Where do I get rewards section */}
            <div className="bg-[#151c2c] p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px]">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiGift className="mr-2 text-blue-400" />
                Where do I get my rewards?
              </h3>
              <div className="bg-[#1a2337] p-4 rounded-lg shadow-inner">
                <p className="text-gray-300 text-sm">
                  After you have voted, your rewards are automatically sent to your in-game inventory. To receive them, you must be logged into the server. Any pending rewards will be delivered immediately after joining. Login regularly to avoid missing your participation rewards.
                </p>
              </div>
            </div>

            {/* Can I win Credits section */}
            <div className="bg-[#151c2c] p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px]">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiDollarSign className="mr-2 text-blue-400" />
                Can I win Credits from Voting?
              </h3>
              <div className="bg-[#1a2337] p-4 rounded-lg shadow-inner">
                <p className="text-gray-300 text-sm">
                  Yes, you can earn rewards by voting. Every 30 votes will reward 100 credits to spend on our in-game items, or even a new valuable credit rank.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
