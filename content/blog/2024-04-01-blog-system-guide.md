---
title: "How to Add Blog Posts Using Markdown Files"
date: 2024-04-01
thumbnail: /images/uploads/markdown.jpg
tags:
  - guide
  - admin
excerpt: A comprehensive guide on how to add new blog posts to the website by creating markdown files directly in the content/blog folder.
---

# How to Add Blog Posts Using Markdown Files

This guide will walk you through the process of adding new blog posts to your website by creating markdown files directly in the `content/blog` folder.

## Understanding Markdown Files

Markdown is a lightweight markup language that allows you to write formatted content using plain text. Each blog post on your website is stored as a markdown (`.md`) file in the `content/blog` directory.

### File Naming Convention

When creating a new blog post, use the following naming convention for your markdown file:

```
YYYY-MM-DD-title-of-post.md
```

For example:
- `2024-04-01-blog-system-guide.md`
- `2024-03-30-server-update.md`

## Markdown File Structure

Each markdown file should have the following structure:

1. **Frontmatter**: Metadata about the post enclosed between `---` markers
2. **Content**: The actual blog post content written in markdown format

### Frontmatter

The frontmatter section at the top of the file contains metadata about your blog post in YAML format. Here's what to include:

```yaml
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
```

- **title**: The title of your blog post
- **date**: The publication date (Year-Month-Day format)
- **thumbnail**: Path to the featured image (should be in `/images/uploads/`)
- **tags**: A list of relevant tags (each preceded by a hyphen and space)
- **excerpt**: A short summary of your post (1-2 sentences)

### Content

After the frontmatter, write your blog post content using markdown syntax. Here are some common markdown elements:

## Headings

Use `#` symbols for headings:

```markdown
# Heading 1
## Heading 2
### Heading 3
```

## Text Formatting

- **Bold text**: `**bold text**`
- *Italic text*: `*italic text*`
- ~~Strikethrough~~: `~~strikethrough~~`

## Lists

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

## Links

```markdown
[Link text](https://example.com)
```

## Images

```markdown
![Alt text](/images/uploads/image-name.jpg)
```

## Blockquotes

```markdown
> This is a blockquote
```

## Code Blocks

```markdown
```javascript
console.log("Hello, world!");
```
```

## Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

## Adding Images

1. Upload your images to the `/public/images/uploads/` directory
2. Reference them in your markdown file using:
   - In the frontmatter: `thumbnail: /images/uploads/image-name.jpg`
   - In the content: `![Alt text](/images/uploads/image-name.jpg)`

## Publishing a Blog Post

To publish a new blog post:

1. Create a new markdown file in the `content/blog` directory following the naming convention
2. Add the frontmatter with all required metadata
3. Write your content using markdown syntax
4. Add any images to the `/public/images/uploads/` directory
5. Commit and push your changes to the repository
6. The website will automatically rebuild and display your new post

## Example Blog Post

Here's a complete example of a blog post markdown file:

```markdown
---
title: "Server Maintenance Announcement"
date: 2024-04-05
thumbnail: /images/uploads/maintenance.jpg
tags:
  - announcement
  - maintenance
excerpt: Important information about upcoming server maintenance on April 10th.
---

# Server Maintenance Announcement

We will be performing scheduled server maintenance on **April 10th, 2024 from 2:00 AM to 5:00 AM UTC**.

## What to Expect

During this time, the following services will be unavailable:

1. Game servers
2. Website login
3. Forums

## Why We're Doing This

This maintenance is necessary to:

- Upgrade our server infrastructure
- Apply security patches
- Optimize database performance

We apologize for any inconvenience and appreciate your patience as we work to improve your experience.

![Server Maintenance](/images/uploads/maintenance.jpg)

Please join our [Discord server](https://discord.gg/example) for real-time updates during the maintenance period.
```

## Need Help?

If you have any questions or encounter issues while creating blog posts, please reach out to your website administrator.

Happy blogging! 