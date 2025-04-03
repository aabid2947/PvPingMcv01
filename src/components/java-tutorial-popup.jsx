"use client"
import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"



export default function JavaTuJavaTutorialPopuptorial({ onBack }) {
  const steps = [
    {
      title: "STEP 1",
      description: "DOWNLOAD MINECRAFT: JAVA EDITION AND RUN IT.",
      details:
        "If you have the launcher downloaded but you're unable to play, you may need to download the latest version of Java.",
      action: "DOWNLOAD MINECRAFT",
    },
    {
      title: "STEP 2",
      description: 'SELECT "LATEST RELEASE" AND PRESS THE PLAY BUTTON.',
      details:
        "For a complete experience, you must play on the latest version, Minecraft 1.18.1. Old versions of Minecraft are insecure and are not officially supported.",
    },
    {
      title: "STEP 3",
      description: 'SELECT "MULTIPLAYER" FROM THE TITLE SCREEN.',
      details: "There's a lot of options, but don't worry. We'll guide you through adding our server!",
    },
    {
      title: "STEP 4",
      description: 'PRESS THE "ADD SERVER" BUTTON.',
      details: "For quick access, we'll be adding a bookmark so you can always see our server.",
    },
    {
      title: "STEP 5",
      description: "ADD IN THE INFORMATION YOU SEE IN THE SCREENSHOT.",
      details:
        'Our server name is "OPLegends" and our IP address is "play.oplegends.com". Make sure to set "Server Resource Packs" to "Enabled". Then press "Done"!',
    },
    {
      title: "STEP 6",
      description: "SELECT OPLEGENDS, PRESS JOIN, AND WE WILL SEE YOU INGAME!",
      details: "Are you ready for an incredible Minecraft experience? We can't wait to welcome you to our community!",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="mb-8 flex items-center">
        <Button variant="ghost" className="text-gray-400 hover:text-white mr-4" onClick={onBack}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">How to Join on Java</h1>
          <div className="h-1 w-16 bg-emerald-500 mt-2"></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-[#1D1E29AB] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: `rgba(29, 30, 41, ${0.85 + index * 0.02})`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="bg-emerald-600 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-400 mb-1 text-center md:text-left">{step.title}</h3>
                <h2 className="text-xl font-bold text-white mb-2 text-center md:text-left">{step.description}</h2>
                <p className="text-gray-300 text-center md:text-left">{step.details}</p>
                {step.action && (
                  <button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors mx-auto md:mx-0 block md:inline-block">
                    {step.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

