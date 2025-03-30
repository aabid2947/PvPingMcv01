"use client"

export default function MinecraftServerPromoWithImages() {
  return (
    <div className="relative w-full h-full my-auto max-w-4xl mx-auto overflow-hidden">
      {/* Main container with dark background */}
      <div className="bg-[#0e1117] rounded-lg p-8 relative overflow-hidden">
        {/* Content container */}
        <div className="relative z-10 text-center max-w-md mx-auto py-4">
          <h2 className="text-white text-2xl font-bold mb-2">Ready to play?</h2>
          <p className="text-[#7a8ba3] text-sm mb-6">
            OriginMC is a freshly new and custom survival community. Learn how to join the server on Java Edition and
            start playing in less than 30 seconds.
          </p>

          {/* Play Now Button */}
          <button
            className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:brightness-110 transition-all duration-300 
                     text-white font-medium py-2 px-12 rounded-md w-48 shadow-md shadow-blue-900/30"
          >
            PLAY NOW
          </button>
        </div>

        {/* Green Diamond - Bottom Left */}
        <div className="absolute left-4 bottom-4 z-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/green-MSgrrQ6iHVa56IrtijwvZVr0HNElGO.png"
            alt="Green Diamond"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Blue Diamond - Top Right */}
        <div className="absolute right-4 top-4 z-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blue-r7dyADHeueOoour5YxOzJITpZChCvc.png"
            alt="Blue Diamond"
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>
    </div>
  )
}

