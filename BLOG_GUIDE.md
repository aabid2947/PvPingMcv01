# Blog System Guide for PvPingMC Website

This guide explains how to add and manage blog posts on your PvPingMC website using markdown files.

## Overview

The website is set up with a simple but powerful blog system that:

1. Automatically displays the 3 latest blog posts on the home page
2. Shows all blog posts on the dedicated blog page (/blog)
3. Creates individual blog post pages with their own URLs (/blog/post-id)

All of this is accomplished without a database or CMS - you just need to add markdown files to the `content/blog` directory.

## Adding a New Blog Post

### Step 1: Create a new markdown file

Create a new file in the `content/blog` directory using the following naming convention:

```
YYYY-MM-DD-title-of-post.md
```

For example:
- `2024-04-15-server-update.md`
- `2024-03-30-new-game-mode.md`

### Step 2: Add the frontmatter

At the top of your file, add the following metadata between triple-dash lines:

```yaml
---
title: "Your Blog Post Title"
date: YYYY-MM-DD
thumbnail: /images/uploads/your-image.jpg
tags:
  - tag1
  - tag2
  - tag3
excerpt: A brief summary of your post (1-2 sentences)
---
```

Example:
```yaml
---
title: "Server Maintenance Announcement"
date: 2024-04-15
thumbnail: /images/uploads/maintenance.jpg
tags:
  - announcement
  - maintenance
excerpt: Important information about our upcoming server maintenance scheduled for April 20th.
---
```

### Step 3: Write your content

After the frontmatter section, write your blog post content using markdown syntax:

```markdown
# Main Heading

This is a paragraph with **bold text** and *italic text*.

## Subheading

Here's a list:
- Item 1
- Item 2
- Item 3

[This is a link](https://example.com)

![This is an image](/images/uploads/example.jpg)
```

### Step 4: Add images

1. Place your images in the `public/images/uploads/` directory
2. Reference them in your post:
   - In the frontmatter: `thumbnail: /images/uploads/your-image.jpg`
   - In the content: `![Alt text](/images/uploads/your-image.jpg)`

### Step 5: Deploy

Once you've added your markdown file to the `content/blog` directory, commit and push the changes to your repository. Your website will automatically rebuild and display the new blog post.

## Recommended Tags

Here are some recommended tags you can use for categorizing your blog posts:

- `news` - General announcements and news
- `update` - Server updates and patches
- `event` - Special events and competitions
- `guide` - Tutorials and how-to guides
- `changelog` - Detailed lists of changes
- `announcement` - Important announcements
- `server` - Server-related news

## Formatting Tips

### Headers

Use `#` symbols for headers:
```markdown
# Header 1
## Header 2
### Header 3
```

### Emphasis

- Bold: `**bold text**`
- Italic: `*italic text*`
- Bold and italic: `***bold and italic text***`

### Lists

Unordered list:
```markdown
- Item 1
- Item 2
- Item 3
```

Ordered list:
```markdown
1. First item
2. Second item
3. Third item
```

### Links

```markdown
[Link text](https://example.com)
```

### Images

```markdown
![Alt text](/images/uploads/image.jpg)
```

### Quotes

```markdown
> This is a blockquote
```

### Code

Inline code: 
```markdown
`code`
```

Code block:
````markdown
```
code block
```
````

### Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

## Example Blog Post

Here's a complete example of a blog post:

```markdown
---
title: "Summer Event 2024"
date: 2024-06-01
thumbnail: /images/uploads/summer-event.jpg
tags:
  - event
  - seasonal
excerpt: Join us for our special Summer Event starting June 15th with exclusive rewards and challenges!
---

# Summer Event 2024

We're excited to announce our **Summer Event 2024** starting on June 15th!

## Event Duration

The event will run from **June 15th to July 15th, 2024**.

## Activities

During the event, you can participate in:

1. Beach Building Contest
2. Water Parkour Challenge
3. Tropical Treasure Hunt

## Rewards

Complete event activities to earn:

- Exclusive Summer Cosmetics
- Limited Edition Pets
- Special Titles
- Event Currency

![Summer Rewards](/images/uploads/summer-rewards.jpg)

Don't miss out on this exciting event! Join our [Discord server](https://discord.gg/example) for more details.
```

## Need Help?

If you have any questions or encounter issues while creating blog posts, please refer to the more detailed guide in the blog post titled "How to Add Blog Posts Using Markdown Files" on your website or contact your website administrator. 