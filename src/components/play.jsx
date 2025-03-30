import MinecraftServerPromo from "./minecraft-server-promo"
import MinecraftServerPromoWithImages from "./minecraft-server-promo-with-images"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Minecraft Server Promotion</h1>

      {/* First version with placeholder images */}
      <div className="mb-12">
        <h2 className="text-lg font-medium mb-4">Version with placeholder images:</h2>
        <MinecraftServerPromo />
      </div>

      {/* Second version with SVG crystals */}
      <div>
        <h2 className="text-lg font-medium mb-4">Version with SVG crystals:</h2>
        <MinecraftServerPromoWithImages />
      </div>
    </div>
  )
}

