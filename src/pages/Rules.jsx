import React, { useState } from 'react';
import { FiInfo, FiChevronRight, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import arrow from "../assets/arrow.png";

const SeverityBadge = ({ type }) => {
  const colors = {
    minor: 'bg-yellow-500',
    medium: 'bg-orange-500',
    major: 'bg-red-500',
    severe: 'bg-purple-500',
    permanent: 'bg-red-800',
  };

  return (
    <span className={`${colors[type.toLowerCase()]} text-xs text-white font-medium px-2.5 py-1 rounded-md uppercase mx-1 shadow-md`}>
      {type}
    </span>
  );
};

const Rules = () => {
  const [expandedRule, setExpandedRule] = useState(null);

  const toggleRule = (index) => {
    if (expandedRule === index) {
      setExpandedRule(null);
    } else {
      setExpandedRule(index);
    }
  };

  const ruleCategories = [
    {
      id: 1,
      title: "Inappropriate Builds",
      description: "Building inappropriate structures that violate community standards will not be tolerated. This includes structures that depict explicit or offensive imagery. All builds must adhere to our community guidelines.",
      rules: [
        { id: 1, text: "Building inappropriate structures depicting explicit content", severity: ["Minor", "Medium", "Major"] },
        { id: 2, text: "Creating offensive symbols or language within builds", severity: ["Medium", "Major"] },
        { id: 3, text: "Using building blocks to form inappropriate or offensive patterns", severity: ["Minor", "Medium"] },
        { id: 4, text: "Constructing structures that mock or harass specific players or groups", severity: ["Medium", "Major"] }
      ]
    },
    {
      id: 2,
      title: "Griefing",
      description: "Intentionally destroying or altering other players' builds without permission is considered griefing. Respect others' property and creations.",
      rules: [
        { id: 1, text: "Destroying other players' builds without permission", severity: ["Medium", "Major"] },
        { id: 2, text: "Placing blocks or liquids to damage or alter others' work", severity: ["Minor", "Medium"] },
        { id: 3, text: "Using TNT or other explosives near protected areas", severity: ["Medium", "Major"] },
        { id: 4, text: "Modifying terrain around other players' builds maliciously", severity: ["Minor", "Medium"] }
      ]
    },
    {
      id: 3,
      title: "Scamming",
      description: "Deceiving other players for personal gain is prohibited. This includes false trading promises, item scamming, and dishonest gameplay.",
      rules: [
        { id: 1, text: "Falsely advertising items or services in trades", severity: ["Medium", "Major"] },
        { id: 2, text: "Taking payment without delivering promised items", severity: ["Major", "Severe"] },
        { id: 3, text: "Creating fake donation pages or services", severity: ["Severe"] },
        { id: 4, text: "Abusing trust systems or mechanics to gain unfair advantages", severity: ["Medium", "Major"] }
      ]
    },
    {
      id: 4,
      title: "Market Rules",
      description: "Fair play and honest trading are expected in all marketplace interactions.",
      rules: [
        { id: 1, text: "Manipulating market prices through coordinated buying/selling", severity: ["Medium", "Major"] },
        { id: 2, text: "Using alternate accounts to control market prices", severity: ["Major"] },
        { id: 3, text: "Spreading false information to affect market values", severity: ["Medium", "Major"] }
      ]
    },
    {
      id: 5,
      title: "Payment Dispute",
      description: "Issues relating to payments should be resolved through appropriate channels. Never disclose payment information.",
      rules: [
        { id: 1, text: "Making false payment dispute claims", severity: ["Major", "Severe"] },
        { id: 2, text: "Sharing payment information of other players", severity: ["Severe"] }
      ]
    },
    {
      id: 6,
      title: "Market Scamming",
      description: "Trading in bad faith or dishonest transaction handling will result in removal of market privileges. Users should use proper channels for all trades.",
      rules: [
        { id: 1, text: "Manipulating trades through deception", severity: ["Medium", "Major"] },
        { id: 2, text: "Misrepresenting items being traded", severity: ["Medium", "Major"] }
      ]
    },
    {
      id: 7,
      title: "IRL Trading",
      description: "Trading in-game items for real-world currency is prohibited outside official platforms. This applies to all currencies and platforms. Management can revoke privileges.",
      rules: [
        { id: 1, text: "Selling in-game items for real-world money", severity: ["Major", "Severe"] },
        { id: 2, text: "Purchasing in-game items through unauthorized channels", severity: ["Medium", "Major"] }
      ]
    },
    {
      id: 8,
      title: "Competition Rules",
      description: "Rules governing fair play in server competitions and events.",
      rules: [
        { id: 1, text: "Exploiting competition mechanics for unfair advantage", severity: ["Medium", "Major"] },
        { id: 2, text: "Collaborating in solo competitions", severity: ["Major"] }
      ]
    },
    {
      id: 9,
      title: "Coordinated XP Activity",
      description: "Coordinating with multiple users to gain unfair XP advantages is prohibited. Using alt accounts or mechanics in unintended ways will result in account termination.",
      rules: [
        { id: 1, text: "Boosting XP through coordinated activity", severity: ["Medium", "Major", "Severe"] },
        { id: 2, text: "Using alternative accounts for XP farming", severity: ["Major", "Permanent"] }
      ]
    },
    {
      id: 10,
      title: "Penalties",
      description: "Various penalties are applied based on rule violation severity, including temporary and permanent restrictions.",
      rules: [
        { id: 1, text: "Evading temporary bans using alternative accounts", severity: ["Major", "Permanent"] },
        { id: 2, text: "Attempting to circumvent penalties", severity: ["Severe", "Permanent"] }
      ]
    },
    {
      id: 11,
      title: "Cheating Rules",
      description: "Using unauthorized modifications or exploits is strictly prohibited and will result in immediate account action.",
      rules: [
        { id: 1, text: "Using unauthorized client modifications", severity: ["Major", "Severe", "Permanent"] },
        { id: 2, text: "Exploiting game bugs for advantage", severity: ["Medium", "Major"] }
      ]
    },
    {
      id: 12,
      title: "Account Sharing",
      description: "Sharing account credentials is prohibited. Each account must belong to one person only. This helps maintain security and accountability.",
      rules: [
        { id: 1, text: "Sharing account credentials with others", severity: ["Medium", "Major"] },
        { id: 2, text: "Using shared accounts for rule violations", severity: ["Major", "Severe"] }
      ]
    },
    {
      id: 13,
      title: "PvPHacks",
      description: "Using unauthorized clients or modifications that provide PvP advantages is prohibited and will result in permanent bans.",
      rules: [
        { id: 1, text: "Using combat hacks or unfair PvP mods", severity: ["Major", "Permanent"] },
        { id: 2, text: "Using reach, aimbot or other combat advantages", severity: ["Severe", "Permanent"] }
      ]
    },
    {
      id: 14,
      title: "Chat Rules",
      description: "Guidelines for maintaining respectful communication in all server channels.",
      rules: [
        { id: 1, text: "Using offensive or inappropriate language", severity: ["Minor", "Medium", "Major"] },
        { id: 2, text: "Spamming chat channels", severity: ["Minor", "Medium"] }
      ]
    },
    {
      id: 15,
      title: "Intentional Advertising",
      description: "Promotion of external services or content is prohibited without staff permission.",
      rules: [
        { id: 1, text: "Advertising other servers or services", severity: ["Medium", "Major"] },
        { id: 2, text: "Promoting external content without approval", severity: ["Minor", "Medium"] }
      ]
    },
    {
      id: 16,
      title: "DDOS Threats",
      description: "Threatening or implying DDoS attacks against the server or players is prohibited and will result in server bans.",
      rules: [
        { id: 1, text: "Making threats about DDoS attacks", severity: ["Major", "Severe", "Permanent"] },
        { id: 2, text: "Participating in server attacks", severity: ["Permanent"] }
      ]
    },
    {
      id: 17,
      title: "DOXING Threats",
      description: "Threatening to reveal or sharing personal information of other players is strictly prohibited and will result in permanent bans.",
      rules: [
        { id: 1, text: "Threatening to share personal information", severity: ["Severe", "Permanent"] },
        { id: 2, text: "Publishing private data of other players", severity: ["Permanent"] }
      ]
    }
  ];

  const introduction = "PvPingMc rules have been created to ensure a positive experience for all players. Breaking any of the guidelines may lead to punishment depending on the severity of the violation. Each rule has a specific category and severity level indicated by colored tags. Punishment duration increases with repeated offenses.";

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen">
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#3ABCFD] rounded-full w-12 h-12 flex items-center justify-center">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Rules</h1>
              <div className="w-24 h-1 bg-blue-500 mt-1"></div>
            </div>
          </div>

        </div>

        <div className="bg-[#111827] rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-start">
            <FiInfo className="text-blue-400 mt-1 mr-3 text-xl" />
            <p className="text-gray-300 text-lg">{introduction}</p>
          </div>
        </div>

        <div className="space-y-6">
          {ruleCategories.map((category, index) => (
            <div key={category.id} className="bg-[#111827] rounded-xl overflow-hidden shadow-lg">
              <button
                className={`w-full p-4 text-left transition-colors flex justify-between items-center ${
                  expandedRule === index ? 'bg-blue-900/20' : 'hover:bg-blue-900/10'
                }`}
                onClick={() => toggleRule(index)}
              >
                <div className="flex items-center">
                  <span className="text-xl font-bold text-white">{category.title}</span>
                </div>
                <FiChevronRight 
                  className={`text-xl transition-transform ${expandedRule === index ? 'transform rotate-90' : ''}`} 
                />
              </button>
              
              {expandedRule === index && (
                <div className="p-5 bg-[#1A202C] border-t border-[#2D3748]">
                  <p className="text-gray-300 mb-4">{category.description}</p>
                  
                  <div className="space-y-3">
                    {category.rules.map((rule) => (
                      <div key={rule.id} className="bg-[#111827] p-3 rounded-lg">
                        <div className="flex items-start">
                          <FiAlertCircle className="text-red-400 mt-1 mr-2" />
                          <div>
                            <p className="text-white">{rule.text}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-gray-400 text-sm mr-1">Severity:</span>
                              {rule.severity.map((sev, i) => (
                                <SeverityBadge key={i} type={sev} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rules;