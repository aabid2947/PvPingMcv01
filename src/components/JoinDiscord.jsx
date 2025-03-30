import { Button } from "../ui/Button"
import frame from "../assets/Frame 2.png";
import pngtree from "../assets/pngtree.png"

export default function JoinDiscord() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-[#13141d] rounded-lg overflow-hidden flex items-center relative">
        {/* Left Side - Minecraft Character */}
        <div className="relative z-10 pl-4 md:pl-8 py-4">
          <img
            src={pngtree}
            alt="Minecraft Creeper Character"
            className="h-28 md:h-32 w-auto object-contain"
          />
        </div>

        {/* Center Content */}
        <div className="text-left relative z-10 py-4 px-4 flex-1">
          <h2 className="text-white text-xl md:text-2xl font-bold mb-1">Join our discord community!</h2>
          <p className="text-gray-400 text-sm">
            Find new friends to explore <span className="text-blue-400">dungeons</span>, build a{" "}
            <span className="text-green-400">town</span> and discover <span className="text-yellow-400">rich</span>{" "}
            together.
            <br />
            We also offer <span className="font-semibold text-white">7</span> servers.
          </p>
        </div>

        {/* Discord Button */}
        <div className="relative z-10 pr-4 md:pr-8 py-4">
          <Button className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-medium py-2 px-6 rounded-md">
            Join discord!
          </Button>
        </div>

        {/* Right Side Decorative Image */}
        <div className="absolute right-0 top-0 h-full w-1/3">
          <img
            src={frame}
            alt="Minecraft Temple Scene"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

