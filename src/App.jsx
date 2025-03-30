import { Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import BlogOverview from './pages/BlogOverview'
import BlogDetail from './pages/BlogDetail'
import Store from './pages/Store'
import Vote from './pages/Vote'
import Rules from './pages/Rules'
import PvPingMC from './pages/PvPingMC'
import HeroSection from "./pages/HeroSection.jsx"
import OriginPass from './pages/OriginPass'
import { Link, useLocation } from 'react-router-dom'
import pvping from "./assets/thumb_logo.png"

// Universal Footer Component
const Footer = () => {
  return (
    <footer className="bg-[#0a0b11] border-t border-gray-800/30 py-8">
      <div className="container mx-auto w-full md:w-4/5 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <span className="text-white font-medium mr-1">Copyright ©</span>
              <span className="text-blue-500 font-medium mr-1">OriginMC</span>
              <span className="text-white font-medium">2023. All Rights Reserved.</span>
            </div>
            <p className="text-gray-500 text-xs">
              MINECRAFT IS © MOJANG STUDIOS 2009-2023. WE ARE NOT AFFILIATED WITH MOJANG STUDIOS.
            </p>
          </div>

          <div className="flex items-center">
            <img src={pvping} alt="OriginMC Logo" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-cover bg-center bg-[url('../assets/client-bg.png')] mt-[-30px]">
      <main className='mt-6'>
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <Home />
              </div>
            </>
          } />
          <Route path="/blog" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <BlogOverview />
              </div>
            </>
          } />
          <Route path="/blog/:id" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <BlogDetail />
              </div>
            </>
          } />
          <Route path="/store" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <Store />
              </div>
            </>
          } />
          <Route path="/vote" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <Vote />
              </div>
            </>
          } />
          <Route path="/rules" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <Rules />
              </div>
            </>
          } />
          <Route path="/pvpingmc" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <PvPingMC />
              </div>
            </>
          } />
          <Route path="/originpass" element={
            <>
              <HeroSection />
              <div className="bg-[#13141d] mt-[-30px]">
                <OriginPass />
              </div>
            </>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
