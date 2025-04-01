import React from 'react';
import { FiInfo, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import heroSectionBg from "../assets/herosection bg.png";

// CSS for custom scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1a202c;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3182ce;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #4299e1;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #3182ce #1a202c;
  }
`;

const SeverityBadge = ({ text }) => {
  // Handle different punishment formats
  let color = 'bg-gray-500'; // Default
  let displayText = text;
  
  if (text.includes('minute') || text.includes('hour')) {
    color = 'bg-yellow-500'; // Short duration
  } else if (text.includes('day') || text.includes('Ban')) {
    color = 'bg-orange-500'; // Medium duration
  } else if (text.includes('Blacklist') || text.includes('Tradeban')) {
    color = 'bg-red-800'; // Permanent/severe
  } else if (text.includes('Penalty')) {
    color = 'bg-purple-500'; // Competition penalties
  } else if (text === 'Warn' || text === 'Kick') {
    color = 'bg-blue-500'; // Warnings
  } else if (text.includes('Mute')) {
    color = 'bg-indigo-500'; // Mutes
  }

  return (
    <span className={`${color} text-[9px] text-white font-medium px-1.5 py-0.5 rounded uppercase mx-0.5 shadow-sm inline-block`}>
      {displayText}
    </span>
  );
};

const RuleItem = ({ rule, punishments }) => {
  return (
    <div className="bg-[#1A1B26] p-3 w-full rounded-lg  shadow-sm  transition-colors duration-200">
      <div className="flex items-start w-full">
        <FiAlertCircle className="text-red-400 mt-1 mr-2 flex-shrink-0" />
        <div className="w-full">
          <p className="text-white text-sm font-medium">{rule}</p>
          {punishments && punishments.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1 w-full">
              <span className="text-gray-400 text-xs">Punishment:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {punishments.map((punishment, i) => (
                  <SeverityBadge key={i} text={punishment} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CategorySection = ({ category }) => {
  return (
    <div className="bg-[#1A202C] rounded-xl overflow-hidden shadow-lg mb-6">
      <div className="p-4 ">
        <h2 className="text-xl font-bold text-white">{category.title}</h2>
      </div>
      
      <div className="p-5 bg-[#1A202C]  ">
        <p className="text-gray-300 mb-4 w-full">{category.description}</p>
        
        <div className="w-full h-80 overflow-y-auto custom-scrollbar rounded-lg  ">
          <div className="space-y-3 w-full">
            {category.rules.map((rule, ruleIndex) => (
              <RuleItem 
                key={ruleIndex} 
                rule={rule.text} 
                punishments={rule.punishments}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Rules = () => {
  const ruleCategories = [
    {
      id: "general",
      title: "Other Rules",
      description: "General rules that apply to all players on the server.",
      rules: [
        { text: "Payment Dispute Blacklist", punishments: ["Blacklist"], description: "Opening a fraudulent payment dispute against any OPLegends transaction." },
        { text: "Bots Blacklist", punishments: ["Blacklist"], description: "Use of automated accounts, such as console clients or botnets." },
        { text: "Grooming and Stalking Blacklist", punishments: ["Blacklist"], description: "Any actions of grooming or stalking will result in reports to legal authorities." },
        { text: "Market Scamming Blacklist", punishments: ["Blacklist"], description: "Failing to follow through on an agreed-upon trade consisting of at least 7,500 Credits as one part of the deal." },
        { text: "Mute Evasion Mute", punishments: ["Mute"], description: "Evading an existing mute through alternate accounts or other means." },
        { text: "Inappropriate Usernames, Skins and Items", punishments: ["30 day Ban"], description: "Displaying inappropriate or vulgar usernames, renames, items, or skins; this includes displays of language, nudity, or terrorism. If the username/skin/item is not fixed after the punishment expires, another will be issued." },
        { text: "Ban Evasion", punishments: ["180 day Ban"], description: "Evading an existing ban through alternate accounts or other means." },
        { text: "Compromised or Shared Accounts", punishments: ["14 day Ban", "30 day Ban", "60 day Ban"], description: "Shared alts, public alts, and accounts which log in from many different locations may be flagged as compromised. As a reminder, using a shared account is a violation of the Account Sharing cheating rule." },
        { text: "Insiding", punishments: ["14 day Ban", "30 day Ban", "180 day Ban"], description: "As an Island/Gang Leader, you're responsible for your team's actions. If you place an item on another Island/Plot, it belongs to that owner. If you're insided, you must provide video proof. We only return items if we can recover them from the thief." },
        { text: "TP Trapping", punishments: ["Warn", "30 minute Ban", "1 hour Ban", "3 hour Ban"], description: "Teleporting players to you in a way which restricts them from leaving the area." },
        { text: "Inappropriate Builds", punishments: ["1 hour Ban", "3 hour Ban", "7 hour Ban", "14 hour Ban"], description: "Building content which displays language, nudity, or terrorism." },
        { text: "Griefing", punishments: ["1 day Ban", "3 day Ban", "7 day Ban", "14 day Ban"], description: "Destroying builds of another user. We cannot restore builds under any circumstances." },
        { text: "Scamming", punishments: ["14 day Ban", "30 day Ban", "60 day Ban", "180 day Ban"], description: "Talking/agreeing on trades involving value less than 7,500 Credits and not following through with the trade." }
      ]
    },
    {
      id: "market",
      title: "Market Rules",
      description: "Rules governing transactions and trading on the server.",
      rules: [
        { text: "Payment Dispute", punishments: ["Blacklist"], description: "Opening a fraudulent payment dispute against any OPLegends transaction." },
        { text: "Market Scamming", punishments: ["Blacklist"], description: "Failing to follow through on an agreed-upon immediate transaction consisting of at least 7,500 Credits as one part of the deal." },
        { text: "IRL Trading", punishments: ["Tradeban", "Blacklist"], description: "You can't make deals involving real money or anything outside of OPLegends (like items on other servers or physical goods). Management can permanently tradeban anyone for trying, offering, or suggesting IRL trades, even if no deal happened." },
        { text: "Obscuring Transactions", punishments: ["Blacklist"], description: "You can't hide or withhold information about a transaction. This includes using alts to hide the true owner, value, or nature of a transaction." },
        { text: "Suspicious Market Activity", punishments: ["Tradeban", "Blacklist"], description: "Any market activity which is deemed suspicious by the OPLegends management team. This includes but is not limited to: market manipulation, price fixing, and market scams." },
        { text: "Trade Swapping", punishments: ["Tradeban"], description: "Any attempt to swap a trade after it has been agreed upon in the /trade menu, such as swapping items right before the other player clicks confirm, causing the target of the scam to unintentionally agree to a trade containing items different to those they initially reviewed" },
        { text: "Scamming", punishments: ["14 day Ban", "30 day Ban", "60 day Ban", "180 day Ban"], description: "Talking/agreeing on an immediate transaction involving combined value less than 7,500 Credits and not following through with the trade." }
      ]
    },
    {
      id: "competition",
      title: "Competition Rules",
      description: "Rules governing fair play in competitions and leaderboards.",
      rules: [
        { text: "Alternate Teams/Team Boosting (season-long penalty)", punishments: ["10% Penalty", "30% Penalty", "60% Penalty", "90% Penalty", "100% Penalty"], description: "Using extra islands/gangs or boosting other teams to gain an unfair advantage will get you penalized for the entire season. Team boosting is when one gang helps another gang in ways that are not normal, like giving or selling orbs or beacons for way too little. If you're caught doing this, both individual members and the team on leaderboards will be penalized. The first offense may get a verbal warning." },
        { text: "Team Member Rotation (season-long penalty)", punishments: ["10% Penalty", "30% Penalty", "60% Penalty", "90% Penalty", "100% Penalty"], description: "When you start playing any gamemode on the network, you get 5 team invites. Each week, you'll get 2 more free invites. After using all your free invites, each extra invite adds a 1.5% penalty to your deposits for that week. This penalty applies only if the person joins your team. Individual leaderboard players will also face this penalty. The first offense may get a verbal warning." },
        { text: "Team Merging (season-long penalty)", punishments: ["150% Penalty"], description: "You need Admin approval to bring valuable items (like spawners or smart chests) to a new island. Breaking this rule will get you penalized without a warning for the season. Individual team members on leaderboards will also be penalized. The first offense may get a verbal warning." },
        { text: "Coordinated Alt Activity (season-long penalty)", punishments: ["10% Penalty", "30% Penalty", "60% Penalty", "90% Penalty", "100% Penalty"], description: "If a gang gets at least two punishments for Alt Boosting or Account Sharing in a season, they will receive a penalty (e.g., 2 alt boosting + 1 account sharing = 30%, 1 alt boosting + 1 account sharing = 10%, or 2 account sharing = 10%), and individual team members on leaderboards will also be penalized. The first offense may get a verbal warning." },
        { text: "Penalties (season-long penalty)", punishments: ["Warn", "10% Penalty", "30% Penalty", "60% Penalty", "90% Penalty", "100% Penalty"], description: "If someone cheats, their whole gang or island gets penalized for a season. All Beacons or Gems from players who cheated will be removed from the final leaderboard. The first offense may get a verbal warning. Individual team members on leaderboards will also be penalized." }
      ]
    },
    {
      id: "cheating",
      title: "Cheating Rules",
      description: "Rules against using unfair advantages and exploits.",
      rules: [
        { text: "Exploiting Mechanics", punishments: ["180 day Ban", "Blacklist"], description: "Using any gameplay mechanic in a way that was not directly intended, such as duping, glitching, or other exploits." },
        { text: "Hacking", punishments: ["14 day Ban", "30 day Ban", "60 day Ban", "180 day Ban"], description: "Using hacked clients, x-ray texture packs, unfair advantages, macros, scripts, or nuking will disqualify you from leaderboards for your punishment period and up to 30 days before it, affecting any unredeemed rewards." },
        { text: "Disallowed Modifications", punishments: ["14 day Ban", "30 day Ban", "60 day Ban", "180 day Ban"], description: "Boosting progress with illegitimate methods/cheats or using quirks/bugs for automated mining (like F11 mining) is not allowed. Auto-clicking is okay if you're not AFK, meaning you must complete a captcha in 1 minute." },
        { text: "Alt Boosting", punishments: ["14 day Ban", "30 day Ban", "60 day Ban", "180 day Ban"], description: "You can use only one alternate account per IP address on OPLegends. If we find more than two accounts on your IP you'll be punished. Shared IP cases (like VPNs or public Wi-Fi) will be reviewed individually since it's rare for two different users to share an IP." },
        { text: "Account Sharing", punishments: ["14 day Ban", "30 day Ban", "60 day Ban", "180 day Ban"], description: "You can't share your account with others. Account sharing is when one account logs in from more than 3 IP addresses. Shared IP cases (like VPNs or public Wi-Fi) will be reviewed individually since it's rare for two different users to share an IP." },
        { text: "Keybinds", punishments: ["1 hour Ban", "12 hour Ban", "1 day Ban", "7 day Ban"], description: "Keybinds may not be used for completing chat events." }
      ]
    },
    {
      id: "chat",
      title: "Chat Rules",
      description: "Rules governing communication on the server.",
      rules: [
        { text: "Intentional Advertising", punishments: ["Shadowmute"], description: "Intentionally posting or displaying another server or community's IP address." },
        { text: "DDOS Threats", punishments: ["Blacklist"], description: "A serious, credible threat to perform a denial-of-service-attack." },
        { text: "DOX/SWAT Threats", punishments: ["Blacklist"], description: "Threatening (jokingly or not) to leak somebody's information or call the cops on them." },
        { text: "Inappropriate Content", punishments: ["Warn", "15 minute Mute", "30 minute Mute", "1 hour Mute"], description: "We disallow adult content or drug references in public chat." },
        { text: "Encouraging Rule Breaking", punishments: ["Warn", "Warn", "5 minute Mute", "10 minute Mute", "15 minute Mute"], description: "Joking about or convincing others to break the rules." },
        { text: "Toxicity", punishments: ["15 minute Mute", "30 minute Mute", "1 hour Mute", "3 hour Mute"], description: "Being consistently disrespectful or harassing players or staff." },
        { text: "Spamming", punishments: ["Warn", "Kick", "1 minute Mute", "5 minute Mute", "10 minute Mute"], description: "Do not repeat the same message more than 3 times in 30 seconds. Do not spam more than 15 of the same letter. Do not advertise shop messages more than once a minute." },
        { text: "Bigotry", punishments: ["30 minute Mute", "3 hour Mute", "1 day Mute", "3 day Mute", "5 day Ban"], description: "Use of slurs or language related to racism, sexism, or other discrimination." },
        { text: "Command Trolling", punishments: ["1 hour Mute", "1 hour Ban", "3 hour Ban", "1 day Ban"], description: "Convincing other users to perform dangerous commands such as /deletecommonpets or /is disband." },
        { text: "Violent or Intrusive Threat", punishments: ["1 day Mute", "1 day Ban", "3 day Ban", "7 day Ban", "Blacklist"], description: "Death threats, suicide threats, or talk of self-harm are all considered violent threats." }
      ]
    }
  ];

  const introduction = "PvPingMc rules have been created to ensure a positive experience for all players. Breaking any of the guidelines may lead to punishment depending on the severity of the violation. Each rule has specific penalties that increase with repeated offenses. These rules help maintain a fair and enjoyable environment for everyone.";

  return (
    <div className="w-full bg-[#13141d] text-white min-h-screen relative">
      {/* Add custom scrollbar styles */}
      <style>{scrollbarStyles}</style>
      
      {/* Hero section background */}
      <div 
        className="w-full h-40 absolute top-0 left-0 -z-10 overflow-hidden"
        style={{ 
          backgroundImage: `url(${heroSectionBg})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center top'
        }}
      />
      
      <div className="container mx-auto md:w-4/5 px-4 py-12">
        <div className="mb-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#3ABCFD] rounded-full w-12 h-12 flex items-center justify-center">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Rules</h1>
              <div className="w-7 h-1 bg-blue-500 mt-1"></div>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-start">
            <FiInfo className="text-blue-400 mt-1 mr-3 text-xl flex-shrink-0" />
            <p className="text-gray-300 text-lg">{introduction}</p>
          </div>
        </div>

        {ruleCategories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default Rules;