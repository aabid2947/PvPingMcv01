import { marked } from 'marked';
import matter from 'gray-matter';

/**
 * Helper function to parse markdown content
 * @param {string} markdown - Raw markdown content
 * @returns {string} HTML content
 */
export function parseMarkdown(markdown) {
  // Ensure external images are rendered correctly by preserving URLs
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  return marked(markdown);
}

/**
 * Simple frontmatter parser that works in browsers
 * Extracts YAML frontmatter between --- delimiters
 * @param {string} text - The markdown text with frontmatter
 * @returns {Object} { data, content }
 */
function parseFrontmatter(text) {
  // Check if the text starts with ---
  if (!text.startsWith('---')) {
    return { data: {}, content: text };
  }

  // Find the end of the frontmatter section
  const end = text.indexOf('---', 3);
  if (end === -1) {
    return { data: {}, content: text };
  }

  const frontmatterText = text.substring(3, end).trim();
  const content = text.substring(end + 3).trim();
  
  // Parse the YAML-like frontmatter
  const data = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Special handling for tags
      if (key === 'tags') {
        // Check if value is a space-separated string or already an array
        if (value === '') {
          // Empty array if no tags
          data[key] = [];
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Handle array format: [tag1, tag2]
          try {
            data[key] = JSON.parse(value);
          } catch (e) {
            // If parsing fails, use as space-separated
            data[key] = value.split(' ').filter(Boolean);
          }
        } else {
          // For space-separated format: "tag1 tag2 tag3"
          data[key] = value.split(' ').filter(Boolean);
        }
      }
      // Special handling for dates
      else if (key === 'date' || key.includes('date_')) {
        if (value.includes('T')) {
          // If it's an ISO format, parse it
          data[key] = value;
        } else {
          // Simple date format
          data[key] = value;
        }
      }
      // Handle special fields from the sample format
      else if (key === 'image_url' || key === 'thumbnail') {
        data['thumbnail'] = value; // Normalize to 'thumbnail'
      }
      else if (key === 'slug') {
        data['id'] = value; // Save slug as id for consistency
      }
      // Handle arrays (lines like "tags:" followed by "  - tag1")
      else if (value === '') {
        // This might be the start of a list
        data[key] = [];
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // Handle quoted strings
        data[key] = value.substring(1, value.length - 1);
      } else if (!isNaN(value)) {
        // Handle numbers
        data[key] = Number(value);
      } else {
        // Regular strings
        data[key] = value;
      }
    } else if (line.trim().startsWith('- ') && Object.keys(data).length > 0) {
      // This is a list item, add it to the last defined key
      const lastKey = Object.keys(data)[Object.keys(data).length - 1];
      if (Array.isArray(data[lastKey])) {
        data[lastKey].push(line.trim().substring(2));
      }
    }
  });

  // Ensure we have an ID field - either from slug or filename in the calling function
  if (!data.id && data.slug) {
    data.id = data.slug;
  }

  // Ensure 'date' is properly set
  if (!data.date && data.date_published) {
    data.date = data.date_published;
  }

  // Ensure we always have a tags array
  if (!data.tags) {
    data.tags = [];
  } else if (!Array.isArray(data.tags)) {
    data.tags = [data.tags];
  }

  return { data, content };
}

// Complete blog post content for production deployments
// Each post is complete with full content so we don't need to fetch files in production
const completePostData = [
  {
    id: '2024-05-01-summer-event',
    title: 'Summer Event 2024 - Sun, Fun, and Minecraft!',
    date: '2024-05-01',
    thumbnail: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
    tags: ['event', 'summer', 'news'],
    excerpt: 'Get ready for the biggest summer event of 2024! Join us for special challenges, prizes, and summer-themed builds.',
    content: `# Summer Event 2024: Sun, Fun, and Minecraft!

Are you ready for the hottest Minecraft event of the year? Our Summer Event 2024 is just around the corner, and it's going to be epic!

## Event Duration

The event will run from **June 1st** to **August 31st, 2024**.

## What to Expect

- **Summer Challenges**: Complete daily and weekly challenges for exclusive rewards
- **Beach Party Build Competition**: Show off your building skills with a summer theme
- **Special Mobs**: Hunt down special summer-themed mobs for rare drops
- **Limited-Time Recipes**: Craft unique summer items available only during the event

## Rewards

- Summer 2024 Exclusive Title
- Beach-themed armor set
- Special particle effects
- Custom weapon enchantments
- Unique pets

Don't miss out on this amazing event! Mark your calendars and prepare for the ultimate summer Minecraft experience.`,
    contentHtml: parseMarkdown(`# Summer Event 2024: Sun, Fun, and Minecraft!

Are you ready for the hottest Minecraft event of the year? Our Summer Event 2024 is just around the corner, and it's going to be epic!

## Event Duration

The event will run from **June 1st** to **August 31st, 2024**.

## What to Expect

- **Summer Challenges**: Complete daily and weekly challenges for exclusive rewards
- **Beach Party Build Competition**: Show off your building skills with a summer theme
- **Special Mobs**: Hunt down special summer-themed mobs for rare drops
- **Limited-Time Recipes**: Craft unique summer items available only during the event

## Rewards

- Summer 2024 Exclusive Title
- Beach-themed armor set
- Special particle effects
- Custom weapon enchantments
- Unique pets

Don't miss out on this amazing event! Mark your calendars and prepare for the ultimate summer Minecraft experience.`)
  },
  {
    id: '2024-04-25-faction-wars',
    title: 'Faction Wars: The Battle for Dominance Begins!',
    date: '2024-04-25',
    thumbnail: 'https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg',
    tags: ['factions', 'pvp', 'event'],
    excerpt: 'Join the ultimate faction competition with massive prizes and glory!',
    content: `# Faction Wars: The Battle for Dominance Begins!

Calling all faction leaders and members! It's time for the most anticipated event of the year - Faction Wars!

## Event Details

The battle runs for **4 weeks** starting on **May 1st**. Each week will focus on a different aspect of faction gameplay:

- **Week 1**: Territory Control
- **Week 2**: Resource Gathering
- **Week 3**: Raid Defense
- **Week 4**: Final Battle

## How to Participate

1. Ensure your faction has at least 5 active members
2. Register your faction at spawn with the NPC "War Commander"
3. Complete the qualification challenge to enter the tournament

## Prizes

- 1st Place: 1 month of Supreme rank for all members, 5,000,000 in-game currency, and exclusive faction tag
- 2nd Place: 2 weeks of Elite rank for all members, 2,500,000 in-game currency
- 3rd Place: 1 week of VIP rank for all members, 1,000,000 in-game currency

All participating factions will receive a commemorative trophy for their faction base.

May the best faction win!`,
    contentHtml: parseMarkdown(`# Faction Wars: The Battle for Dominance Begins!

Calling all faction leaders and members! It's time for the most anticipated event of the year - Faction Wars!

## Event Details

The battle runs for **4 weeks** starting on **May 1st**. Each week will focus on a different aspect of faction gameplay:

- **Week 1**: Territory Control
- **Week 2**: Resource Gathering
- **Week 3**: Raid Defense
- **Week 4**: Final Battle

## How to Participate

1. Ensure your faction has at least 5 active members
2. Register your faction at spawn with the NPC "War Commander"
3. Complete the qualification challenge to enter the tournament

## Prizes

- 1st Place: 1 month of Supreme rank for all members, 5,000,000 in-game currency, and exclusive faction tag
- 2nd Place: 2 weeks of Elite rank for all members, 2,500,000 in-game currency
- 3rd Place: 1 week of VIP rank for all members, 1,000,000 in-game currency

All participating factions will receive a commemorative trophy for their faction base.

May the best faction win!`)
  },
  {
    id: '2024-04-15-server-update',
    title: 'Major Server Update: New Features and Improvements',
    date: '2024-04-15',
    thumbnail: 'https://cdn.pixabay.com/photo/2015/12/04/14/05/code-1076536_1280.jpg',
    tags: ['news', 'update', 'features'],
    excerpt: 'Check out all the amazing new features in our latest server update!',
    content: `# Major Server Update: New Features and Improvements

We're excited to announce a major update to our Minecraft server! This update includes numerous new features, performance improvements, and bug fixes.

## New Features

- **Custom Enchantments**: 15 new unique enchantments exclusive to our server
- **Economy Overhaul**: New shops, trading system, and balance adjustments
- **Quest System**: Progressive quests with rewards for all game modes
- **New Biomes**: 3 custom biomes added to the survival world
- **Parkour Challenges**: New parkour course with tiered difficulty levels

## Performance Improvements

- Server optimization reducing lag by up to 40%
- Chunk loading improvements for smoother gameplay
- Entity processing optimizations
- Better TPS stability during high player counts

## Bug Fixes

- Fixed duplication glitch in certain chest types
- Resolved teleportation issues in the End dimension
- Fixed inconsistent damage calculations in PvP
- Corrected item description errors in custom items

The update is now live! Just log in to experience all these amazing improvements. We recommend creating a new profile to take full advantage of all the new features.

Let us know what you think about the update on our Discord server!`,
    contentHtml: parseMarkdown(`# Major Server Update: New Features and Improvements

We're excited to announce a major update to our Minecraft server! This update includes numerous new features, performance improvements, and bug fixes.

## New Features

- **Custom Enchantments**: 15 new unique enchantments exclusive to our server
- **Economy Overhaul**: New shops, trading system, and balance adjustments
- **Quest System**: Progressive quests with rewards for all game modes
- **New Biomes**: 3 custom biomes added to the survival world
- **Parkour Challenges**: New parkour course with tiered difficulty levels

## Performance Improvements

- Server optimization reducing lag by up to 40%
- Chunk loading improvements for smoother gameplay
- Entity processing optimizations
- Better TPS stability during high player counts

## Bug Fixes

- Fixed duplication glitch in certain chest types
- Resolved teleportation issues in the End dimension
- Fixed inconsistent damage calculations in PvP
- Corrected item description errors in custom items

The update is now live! Just log in to experience all these amazing improvements. We recommend creating a new profile to take full advantage of all the new features.

Let us know what you think about the update on our Discord server!`)
  },
  {
    id: '2024-04-06-skyblock-guide',
    title: 'Ultimate Beginner\'s Guide to Skyblock',
    date: '2024-04-06',
    thumbnail: 'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg',
    tags: ['guide', 'skyblock', 'tutorial'],
    excerpt: 'Everything new players need to know about playing Skyblock on our server.',
    content: `# Ultimate Beginner's Guide to Skyblock

Welcome to our comprehensive guide to Skyblock! Whether you're new to Minecraft or just new to Skyblock, this guide will help you get started and thrive on our server.

## What is Skyblock?

Skyblock is a popular Minecraft game mode where players start on a small floating island with limited resources. The challenge is to survive and expand your island using only what's available to you.

## Getting Started

1. **Claim Your Island**: Use the command \`/is create\` to start your Skyblock journey
2. **Resource Management**: Your starting chest has essentials - use them wisely!
3. **Cobblestone Generator**: Create this first to have an unlimited source of stone

## Essential Early Game Goals

- Build a cobblestone generator
- Expand your island size
- Create a basic farm for food
- Build a mob grinder for XP and drops

## Advanced Strategies

Once you've established your basic island, consider these advanced strategies:

- Create specialized farms for rare resources
- Establish trading systems with other players
- Complete island challenges for rewards
- Join or form an island team

Happy building and see you on the server!`,
    contentHtml: parseMarkdown(`# Ultimate Beginner's Guide to Skyblock

Welcome to our comprehensive guide to Skyblock! Whether you're new to Minecraft or just new to Skyblock, this guide will help you get started and thrive on our server.

## What is Skyblock?

Skyblock is a popular Minecraft game mode where players start on a small floating island with limited resources. The challenge is to survive and expand your island using only what's available to you.

## Getting Started

1. **Claim Your Island**: Use the command \`/is create\` to start your Skyblock journey
2. **Resource Management**: Your starting chest has essentials - use them wisely!
3. **Cobblestone Generator**: Create this first to have an unlimited source of stone

## Essential Early Game Goals

- Build a cobblestone generator
- Expand your island size
- Create a basic farm for food
- Build a mob grinder for XP and drops

## Advanced Strategies

Once you've established your basic island, consider these advanced strategies:

- Create specialized farms for rare resources
- Establish trading systems with other players
- Complete island challenges for rewards
- Join or form an island team

Happy building and see you on the server!`)
  },
  {
    id: '2024-04-05-anniversary-celebration',
    title: '3rd Anniversary Celebration - Join Us for Epic Festivities!',
    date: '2024-04-05',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/anniversary.jpg',
    tags: ['event', 'celebration', 'news'],
    excerpt: 'It\'s our 3rd anniversary! Join us for a week of special events.',
    content: `# 3rd Anniversary Celebration

Can you believe it? OriginMC is turning 3 years old this month! To celebrate this milestone, we're hosting a full week of special events, giveaways, and surprises for our amazing community.

## Event Schedule

### Monday: Opening Ceremony
- Server-wide announcement and kick-off
- Limited edition anniversary crate for all online players
- Trivia contest with exclusive prizes

### Tuesday: PvP Tournament
- Double XP in all PvP arenas
- Special tournament with tiered prizes
- Top player receives custom title and exclusive kit

### Wednesday: Build Competition
- Theme: "Future of OriginMC"
- Judged by staff and community vote
- Winners receive building materials and featured spot on server hub

### Thursday: Treasure Hunt
- Clues hidden throughout all server worlds
- Progressive difficulty system
- Grand prize: Exclusive anniversary armor set

### Friday: Community Projects
- Help complete special anniversary monuments
- Each completion unlocks server-wide buffs
- Final unlock reveals a brand new server feature!

### Saturday: VIP Day
- All players receive temporary VIP benefits
- Flash sales on store items
- Mystery boxes awarded every hour to random online players

### Sunday: Grand Finale
- Epic boss battle event
- Fireworks show
- Announcement of year 4 roadmap
- Grand prize drawing for all event participants

## Special Thanks

This server wouldn't be what it is today without our amazing community. From our dedicated staff team to our newest players, everyone has contributed to making OriginMC a special place.

We can't wait to celebrate with all of you!

*- The OriginMC Team*`,
    contentHtml: parseMarkdown(`# 3rd Anniversary Celebration

Can you believe it? OriginMC is turning 3 years old this month! To celebrate this milestone, we're hosting a full week of special events, giveaways, and surprises for our amazing community.

## Event Schedule

### Monday: Opening Ceremony
- Server-wide announcement and kick-off
- Limited edition anniversary crate for all online players
- Trivia contest with exclusive prizes

### Tuesday: PvP Tournament
- Double XP in all PvP arenas
- Special tournament with tiered prizes
- Top player receives custom title and exclusive kit

### Wednesday: Build Competition
- Theme: "Future of OriginMC"
- Judged by staff and community vote
- Winners receive building materials and featured spot on server hub

### Thursday: Treasure Hunt
- Clues hidden throughout all server worlds
- Progressive difficulty system
- Grand prize: Exclusive anniversary armor set

### Friday: Community Projects
- Help complete special anniversary monuments
- Each completion unlocks server-wide buffs
- Final unlock reveals a brand new server feature!

### Saturday: VIP Day
- All players receive temporary VIP benefits
- Flash sales on store items
- Mystery boxes awarded every hour to random online players

### Sunday: Grand Finale
- Epic boss battle event
- Fireworks show
- Announcement of year 4 roadmap
- Grand prize drawing for all event participants

## Special Thanks

This server wouldn't be what it is today without our amazing community. From our dedicated staff team to our newest players, everyone has contributed to making OriginMC a special place.

We can't wait to celebrate with all of you!

*- The OriginMC Team*`)
  },
  {
    id: '2024-04-04-new-survival-map',
    title: 'The Frontier: New Survival Map Launching Next Week',
    date: '2024-04-04',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/survival-map.jpg',
    tags: ['update', 'survival', 'map'],
    excerpt: 'Prepare for The Frontier - our most ambitious survival map yet!',
    content: `# The Frontier: New Survival Map

We're thrilled to announce our new survival map, "The Frontier," launching next week! This is our most ambitious map yet, featuring custom terrain, unique biomes, and special gameplay elements never before seen on our server.

## Map Features

### Custom Terrain
- Hand-crafted mountains, valleys, and cave systems
- Unique ore distribution for balanced gameplay
- Special hidden areas with rare resources

### New Biomes
- Mystic Forest: Home to rare mushroom varieties and magical creatures
- Crystal Canyon: Filled with valuable gems and challenging parkour
- Ancient Ruins: Discover lost civilizations and their treasures

### Gameplay Elements
- Region-specific challenges and achievements
- Dynamic weather system affecting crop growth and mob spawning
- Special events triggered by community progress

## Launch Details

**Release Date**: April 10th, 2024 @ 3:00 PM EST

**How to Join**: Use the portal in the main hub or type \`/survival\` to be teleported to The Frontier.

**Server Capacity**: We've upgraded our hardware to support up to 500 players simultaneously on this map.

## Important Notes

- Your inventory and ender chest from the current survival map will NOT transfer
- Economy balances will carry over
- Previous survival map will remain accessible for 2 weeks before archiving

## Pre-Launch Activities

Join us this weekend for special pre-launch activities:
- Map preview tours with the development team
- Scavenger hunt for launch day advantage items
- Community brainstorming for future additions

We can't wait to explore The Frontier with you!`,
    contentHtml: parseMarkdown(`# The Frontier: New Survival Map

We're thrilled to announce our new survival map, "The Frontier," launching next week! This is our most ambitious map yet, featuring custom terrain, unique biomes, and special gameplay elements never before seen on our server.

## Map Features

### Custom Terrain
- Hand-crafted mountains, valleys, and cave systems
- Unique ore distribution for balanced gameplay
- Special hidden areas with rare resources

### New Biomes
- Mystic Forest: Home to rare mushroom varieties and magical creatures
- Crystal Canyon: Filled with valuable gems and challenging parkour
- Ancient Ruins: Discover lost civilizations and their treasures

### Gameplay Elements
- Region-specific challenges and achievements
- Dynamic weather system affecting crop growth and mob spawning
- Special events triggered by community progress

## Launch Details

**Release Date**: April 10th, 2024 @ 3:00 PM EST

**How to Join**: Use the portal in the main hub or type \`/survival\` to be teleported to The Frontier.

**Server Capacity**: We've upgraded our hardware to support up to 500 players simultaneously on this map.

## Important Notes

- Your inventory and ender chest from the current survival map will NOT transfer
- Economy balances will carry over
- Previous survival map will remain accessible for 2 weeks before archiving

## Pre-Launch Activities

Join us this weekend for special pre-launch activities:
- Map preview tours with the development team
- Scavenger hunt for launch day advantage items
- Community brainstorming for future additions

We can't wait to explore The Frontier with you!`)
  },
  {
    id: '2024-04-01-blog-system-guide',
    title: 'How to Add Blog Posts Using Markdown Files',
    date: '2024-04-01',
    thumbnail: '/images/uploads/markdown.jpg',
    tags: ['guide', 'admin'],
    excerpt: 'A comprehensive guide on how to add new blog posts to the website by creating markdown files directly in the content/blog folder.',
    content: `# How to Add Blog Posts Using Markdown Files

This guide will walk you through the process of adding new blog posts to your website by creating markdown files directly in the \`content/blog\` folder.

## Understanding Markdown Files

Markdown is a lightweight markup language that allows you to write formatted content using plain text. Each blog post on your website is stored as a markdown (\`.md\`) file in the \`content/blog\` directory.

### File Naming Convention

When creating a new blog post, use the following naming convention for your markdown file:

\`\`\`
YYYY-MM-DD-title-of-post.md
\`\`\`

For example:
- \`2024-04-01-blog-system-guide.md\`
- \`2024-03-30-server-update.md\`

## Markdown File Structure

Each markdown file should have the following structure:

1. **Frontmatter**: Metadata about the post enclosed between \`---\` markers
2. **Content**: The actual blog post content written in markdown format

### Frontmatter

The frontmatter section at the top of the file contains metadata about your blog post in YAML format. Here's what to include:

\`\`\`yaml
---
title: "Your Blog Post Title"
date: YYYY-MM-DD
thumbnail: /images/uploads/image-name.jpg
tags:
  - tag1
  - tag2
  - tag3
excerpt: A brief summary of your post that will appear on the blog listing page.
---
\`\`\`

- **title**: The title of your blog post
- **date**: The publication date (Year-Month-Day format)
- **thumbnail**: Path to the featured image (should be in \`/images/uploads/\`)
- **tags**: A list of relevant tags (each preceded by a hyphen and space)
- **excerpt**: A short summary of your post (1-2 sentences)

### Content

After the frontmatter, write your blog post content using markdown syntax.`,
    contentHtml: parseMarkdown(`# How to Add Blog Posts Using Markdown Files

This guide will walk you through the process of adding new blog posts to your website by creating markdown files directly in the \`content/blog\` folder.

## Understanding Markdown Files

Markdown is a lightweight markup language that allows you to write formatted content using plain text. Each blog post on your website is stored as a markdown (\`.md\`) file in the \`content/blog\` directory.

### File Naming Convention

When creating a new blog post, use the following naming convention for your markdown file:

\`\`\`
YYYY-MM-DD-title-of-post.md
\`\`\`

For example:
- \`2024-04-01-blog-system-guide.md\`
- \`2024-03-30-server-update.md\`

## Markdown File Structure

Each markdown file should have the following structure:

1. **Frontmatter**: Metadata about the post enclosed between \`---\` markers
2. **Content**: The actual blog post content written in markdown format

### Frontmatter

The frontmatter section at the top of the file contains metadata about your blog post in YAML format. Here's what to include:

\`\`\`yaml
---
title: "Your Blog Post Title"
date: YYYY-MM-DD
thumbnail: /images/uploads/image-name.jpg
tags:
  - tag1
  - tag2
  - tag3
excerpt: A brief summary of your post that will appear on the blog listing page.
---
\`\`\`

- **title**: The title of your blog post
- **date**: The publication date (Year-Month-Day format)
- **thumbnail**: Path to the featured image (should be in \`/images/uploads/\`)
- **tags**: A list of relevant tags (each preceded by a hyphen and space)
- **excerpt**: A short summary of your post (1-2 sentences)

### Content

After the frontmatter, write your blog post content using markdown syntax.`)
  },
  {
    id: '2024-03-15-beginner-guide',
    title: 'Beginner\'s Guide to OriginMC',
    date: '2024-03-15',
    thumbnail: '/images/uploads/minecraft.jpg',
    tags: ['guide', 'beginners', 'server'],
    excerpt: 'Everything new players need to know to get started on our server.',
    content: `# Beginner's Guide to OriginMC

Welcome to OriginMC! This guide will help new players get started on our server and make the most of their experience.

## Getting Started

### Connecting to the Server

To join our server, use this address in your Minecraft client:

\`\`\`
play.originmc.net
\`\`\`

We support both Java Edition (1.8.9 to 1.20.x) and Bedrock Edition.

### Basic Commands

Here are some essential commands to know:

- \`/spawn\` - Return to the main spawn area
- \`/is\` or \`/island\` - Access your skyblock island
- \`/tpa <player>\` - Request to teleport to another player
- \`/msg <player> <message>\` - Send a private message
- \`/bal\` or \`/balance\` - Check your economy balance
- \`/shop\` - Open the server shop
- \`/vote\` - Vote for the server and receive rewards

## Game Modes

Our server offers multiple game modes to suit different playstyles:

### Survival
A classic Minecraft experience with economy, land claiming, and community builds.

### Skyblock
Start on a floating island and expand your territory through resource gathering and island level upgrades.

### Creative
Express your creativity with unlimited resources and WorldEdit tools.

### Prison
Mine through different levels, earn money, and upgrade your gear to reach the highest ranks.

## Economy System

Our server uses a dynamic player-driven economy:

- Earn money by selling items, completing jobs, and voting
- Spend money on shops, auctions, and land claims
- Trade with other players at the Community Market

## Community Guidelines

1. Be respectful to all players and staff
2. No griefing, stealing, or intentionally causing lag
3. No hacking, exploiting, or using unfair advantages
4. Keep chat family-friendly and appropriate
5. Have fun and contribute positively to the community!

## Need Help?

If you have questions or need assistance:
- Ask in global chat using \`/g\` or \`/global\`
- Contact a staff member using \`/helpop <message>\`
- Visit our Discord server for additional support

We hope you enjoy your time on OriginMC!`,
    contentHtml: parseMarkdown(`# Beginner's Guide to OriginMC

Welcome to OriginMC! This guide will help new players get started on our server and make the most of their experience.

## Getting Started

### Connecting to the Server

To join our server, use this address in your Minecraft client:

\`\`\`
play.originmc.net
\`\`\`

We support both Java Edition (1.8.9 to 1.20.x) and Bedrock Edition.

### Basic Commands

Here are some essential commands to know:

- \`/spawn\` - Return to the main spawn area
- \`/is\` or \`/island\` - Access your skyblock island
- \`/tpa <player>\` - Request to teleport to another player
- \`/msg <player> <message>\` - Send a private message
- \`/bal\` or \`/balance\` - Check your economy balance
- \`/shop\` - Open the server shop
- \`/vote\` - Vote for the server and receive rewards

## Game Modes

Our server offers multiple game modes to suit different playstyles:

### Survival
A classic Minecraft experience with economy, land claiming, and community builds.

### Skyblock
Start on a floating island and expand your territory through resource gathering and island level upgrades.

### Creative
Express your creativity with unlimited resources and WorldEdit tools.

### Prison
Mine through different levels, earn money, and upgrade your gear to reach the highest ranks.

## Economy System

Our server uses a dynamic player-driven economy:

- Earn money by selling items, completing jobs, and voting
- Spend money on shops, auctions, and land claims
- Trade with other players at the Community Market

## Community Guidelines

1. Be respectful to all players and staff
2. No griefing, stealing, or intentionally causing lag
3. No hacking, exploiting, or using unfair advantages
4. Keep chat family-friendly and appropriate
5. Have fun and contribute positively to the community!

## Need Help?

If you have questions or need assistance:
- Ask in global chat using \`/g\` or \`/global\`
- Contact a staff member using \`/helpop <message>\`
- Visit our Discord server for additional support

We hope you enjoy your time on OriginMC!`)
  }
];

// Static blog posts for fallback when import.meta.glob doesn't work
const staticBlogPosts = [
  {
    id: '2024-04-06-skyblock-guide',
    title: 'Ultimate Beginner\'s Guide to Skyblock',
    date: '2024-04-06',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/skyblock.jpg',
    tags: ['guide', 'skyblock', 'tutorial'],
    excerpt: 'Everything new players need to know about playing Skyblock on our server.',
    content: '# Ultimate Beginner\'s Guide to Skyblock\n\nWelcome to our comprehensive guide to Skyblock!',
    contentHtml: '<h1>Ultimate Beginner\'s Guide to Skyblock</h1><p>Welcome to our comprehensive guide to Skyblock!</p>'
  },
  {
    id: '2024-04-05-anniversary-celebration',
    title: '3rd Anniversary Celebration - Join Us for Epic Festivities!',
    date: '2024-04-05',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/anniversary.jpg',
    tags: ['event', 'celebration', 'news'],
    excerpt: 'It\'s our 3rd anniversary! Join us for a week of special events.',
    content: '# 3rd Anniversary Celebration\n\nCan you believe it? OriginMC is turning 3 years old this month!',
    contentHtml: '<h1>3rd Anniversary Celebration</h1><p>Can you believe it? OriginMC is turning 3 years old this month!</p>'
  },
  {
    id: '2024-04-04-new-survival-map',
    title: 'The Frontier: New Survival Map Launching Next Week',
    date: '2024-04-04',
    thumbnail: 'https://raw.githubusercontent.com/PvPingMc/blog-images/main/survival-map.jpg',
    tags: ['update', 'survival', 'map'],
    excerpt: 'Prepare for The Frontier - our most ambitious survival map yet!',
    content: '# The Frontier: New Survival Map\n\nWe\'re thrilled to announce our new survival map.',
    contentHtml: '<h1>The Frontier: New Survival Map</h1><p>We\'re thrilled to announce our new survival map.</p>'
  }
];

// Hardcoded list of known blog posts for development mode
const knownBlogFiles = [
  '2024-05-01-summer-event.md',
  '2024-04-25-faction-wars.md',
  '2024-04-15-server-update.md',
  '2024-04-10-arena-tournament.md',
  '2024-04-06-skyblock-guide.md',
  '2024-04-05-anniversary-celebration.md',
  '2024-04-04-new-survival-map.md',
  '2024-04-03-summer-event-announcement.md',
  '2024-04-02-new-pvp-arena.md',
  '2024-04-01-blog-system-guide.md',
  '2024-03-30-prison-announcement.md',
  '2024-03-15-beginner-guide.md',
  '2024-01-10-welcome-post.md',
  '2023-10-15-halloween-event.md',
  '2023-08-02-server-update.md',
  '2023-07-15-welcome-to-originmc.md',
  '2025-05-34-Test.md'
];

/**
 * Loads blog posts from the content directory
 * @returns {Promise<Array>} Array of blog posts with metadata
 */
export async function getAllPosts() {
  console.log('Fetching all posts...');
  
  // Always return the embedded data first for consistency
  // This ensures the blog works in all environments including Cloudflare
  console.log('Using embedded post data for consistent experience');
  return completePostData;
  
  /* Commenting out file-based loading to avoid 404 errors in production
  let posts = [];

  // Check if we're running in a deployment environment like Cloudflare
  const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  const isCloudflare = typeof navigator !== 'undefined' && navigator.userAgent.includes('Cloudflare');
  
  if (isProduction || isCloudflare) {
    console.log('Production or Cloudflare environment detected, using embedded post data');
    // In production/Cloudflare, use the embedded complete post data
    return completePostData;
  }
  
  // In development mode, try to fetch files directly
  try {
    console.log('Development mode: Loading blog posts from content/blog directory...');
    const fetchPromises = knownBlogFiles.map(filename => 
      fetch(`/content/blog/${filename}`)
        .then(response => {
          if (!response.ok) {
            console.warn(`Failed to fetch ${filename}: ${response.status}`);
            return null;
          }
          return response.text();
        })
        .then(text => {
          if (!text) return null;
          try {
            // Use our custom frontmatter parser instead of matter
            const { data, content } = parseFrontmatter(text);
            const slug = filename.replace('.md', '');
            
            // Skip posts without required frontmatter
            if (!data.title || !data.date) {
              console.warn(`Missing required frontmatter in ${filename}`);
              return null;
            }
      
      return {
        id: slug,
        title: data.title,
        date: data.date,
              thumbnail: data.thumbnail || null,
              tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
              excerpt: data.excerpt || content.substring(0, 150) + '...',
              content,
              contentHtml: parseMarkdown(content)
            };
          } catch (error) {
            console.error(`Error parsing ${filename}:`, error);
            return null;
          }
        })
        .catch(error => {
          console.error(`Error fetching ${filename}:`, error);
          return null;
        })
    );
    
    const results = await Promise.all(fetchPromises);
    posts = results.filter(post => post !== null);
    
    console.log(`Successfully loaded ${posts.length} posts via direct fetch`);
  } catch (error) {
    console.error('Error loading posts via direct fetch:', error);
  }
  
  // If no posts were loaded or we found fewer than expected, supplement with embedded data
  if (posts.length < 3) {
    console.warn(`Only found ${posts.length} posts via fetch. Using embedded post data as fallback.`);
    
    // Find posts from completePostData that aren't already in posts
    const existingIds = new Set(posts.map(post => post.id));
    const missingPosts = completePostData.filter(post => !existingIds.has(post.id));
    
    // Add the missing posts
    posts = [...posts, ...missingPosts];
    console.log(`Added ${missingPosts.length} embedded posts, total count: ${posts.length}`);
  }
  
  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  */
}

/**
 * Get a specific post by its id
 * @param {string} id - The post ID
 * @returns {Promise<Object>} The post data including HTML content
 */
export async function getPostById(id) {
  try {
    // Return directly from the completePostData array
    const post = completePostData.find(post => post.id === id);
    
    if (!post) {
      console.error(`Post with ID ${id} not found`);
      return null;
    }
    
    return post;
  } catch (error) {
    console.error(`Error getting post with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get all post IDs
 * @returns {Promise<Array>} Array of post IDs
 */
export async function getAllPostIds() {
  return completePostData.map(post => post.id);
}

/**
 * Get posts by tag
 * @param {string} tag - The tag to filter posts by
 * @returns {Promise<Array>} Array of posts with the specified tag
 */
export async function getPostsByTag(tag) {
  return completePostData.filter(post => post.tags && post.tags.includes(tag));
}