import React from 'react';
import { FiTarget } from 'react-icons/fi';

const PvPingMC = () => {
  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-16 flex items-center gap-3">
          <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
            <FiTarget className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">PvPingMC</h1>
            <div className="w-24 h-1 bg-blue-500 mt-1"></div>
          </div>
        </div>
        
        <div className="bg-[#111827] rounded-xl shadow-lg p-8 text-white">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">About PvPingMC</h2>
            <p className="text-gray-300 mb-4">
              PvPingMC is our dedicated PvP arena where players can test their combat skills against other players.
              Compete in various game modes, climb the leaderboards, and earn exclusive rewards!
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Game Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#1F2937] p-4 rounded-lg hover:transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                <h3 className="text-xl font-bold mb-2 text-amber-400">Duels</h3>
                <p className="text-gray-300">Challenge other players to 1v1 combat in various arenas with different weapon loadouts.</p>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-lg hover:transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                <h3 className="text-xl font-bold mb-2 text-amber-400">Capture The Flag</h3>
                <p className="text-gray-300">Work with your team to capture the enemy's flag while defending your own.</p>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-lg hover:transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                <h3 className="text-xl font-bold mb-2 text-amber-400">Battle Royale</h3>
                <p className="text-gray-300">Fight to be the last player standing in our custom battle royale arena.</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Leaderboards</h2>
            <p className="text-gray-300 mb-4">
              Compete to climb our global leaderboards! Top players receive special perks and recognition.
            </p>
            <div className="bg-[#1F2937] p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2 text-center">Current Top Players</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#111827]">
                      <th className="px-4 py-2 text-left">Rank</th>
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Wins</th>
                      <th className="px-4 py-2 text-left">K/D Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-2">1</td>
                      <td className="px-4 py-2">DragonSlayer99</td>
                      <td className="px-4 py-2">1,245</td>
                      <td className="px-4 py-2">3.8</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-2">2</td>
                      <td className="px-4 py-2">NinjaWarrior</td>
                      <td className="px-4 py-2">1,189</td>
                      <td className="px-4 py-2">3.5</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-2">3</td>
                      <td className="px-4 py-2">PixelFighter</td>
                      <td className="px-4 py-2">1,056</td>
                      <td className="px-4 py-2">3.2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
              Join PvPingMC Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PvPingMC;