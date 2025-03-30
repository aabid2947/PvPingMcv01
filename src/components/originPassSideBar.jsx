"use client"
import { ChevronRight } from "lucide-react"

export default function GamingSidebarMenu() {
  const menuItems = [
    {
      icon: "⚡",
      label: "Monthly Credits",
    },
    {
      icon: "🔄",
      label: "/Reclaim Contents",
    },
    {
      icon: "🏆",
      label: "Battle Pass Access",
    },
    {
      icon: "💬",
      label: "Pass Chat Tag",
    },
    {
      icon: "✨",
      label: "Exclusive GKits",
    },
    {
      icon: "🔑",
      label: "Crate Keys",
    },
    {
      icon: "🏷️",
      label: "Chat Title/Tag",
    },
  ]

  return (
    <div className="w-full max-w-xs bg-gray-900 bg-opacity-95 rounded-lg overflow-hidden shadow-lg border border-gray-800">
      <div className="p-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            <button className="w-full flex items-center justify-between py-3 px-4 text-gray-100 hover:bg-gray-800 rounded-md transition-colors duration-200">
              <div className="flex items-center gap-3">
                <span className="text-blue-400 opacity-70 w-5 text-center">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-400" />
            </button>
            {index < menuItems.length - 1 && <div className="mx-4 border-b border-gray-800/50"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

