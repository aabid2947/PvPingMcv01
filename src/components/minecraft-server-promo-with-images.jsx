"use client"

export default function MinecraftServerPromoWithImages() {
  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-gray-950 p-8 shadow-xl">
      {/* Blue crystal decoration - top right */}
      <div className="absolute top-4 right-4">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-90"
        >
          <path d="M40 0L60 20L40 40L20 20L40 0Z" fill="#4299e1" />
          <path d="M40 40L60 20L80 40L60 60L40 40Z" fill="#3182ce" />
          <path d="M40 40L20 20L0 40L20 60L40 40Z" fill="#3182ce" />
          <path d="M40 40L60 60L40 80L20 60L40 40Z" fill="#2b6cb0" />
        </svg>
      </div>

      {/* Green crystal decoration - bottom left */}
      <div className="absolute bottom-4 left-4">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-90"
        >
          <path d="M40 0L60 20L40 40L20 20L40 0Z" fill="#48bb78" />
          <path d="M40 40L60 20L80 40L60 60L40 40Z" fill="#38a169" />
          <path d="M40 40L20 20L0 40L20 60L40 40Z" fill="#38a169" />
          <path d="M40 40L60 60L40 80L20 60L40 40Z" fill="#2f855a" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center py-12 px-4">
        <h2 className="text-3xl font-bold text-white mb-2">Ready to play?</h2>
        <p className="text-blue-300 mb-8 max-w-md mx-auto">
          OriginMC is a freshly new and custom survival community. Learn how to join the server on Java Edition and
          start playing in less than 30 seconds.
        </p>

        {/* Play Now button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-12 rounded-md w-64 transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
          onClick={() => console.log("Play button clicked")}
        >
          PLAY NOW
        </button>
      </div>
    </div>
  )
}

