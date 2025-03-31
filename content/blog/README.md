# Blog Post Guidelines

This README explains how to create blog posts for the website using standardized Markdown files.

## Standardized Markdown Format

All blog posts should use the following frontmatter format:

```markdown
---
title: Your Blog Post Title
slug: your-blog-post-slug
image_url: /assets/img/post/category/image-name.jpg
date_published: YYYY-MM-DDThh:mm:ss.sssZ
date_updated: YYYY-MM-DDThh:mm:ss.sssZ
tags: Tag1 Tag2 Tag3 Tag4
---

# Your Blog Post Content

Content goes here...
```

### Frontmatter Properties

1. **title**: The title of your blog post
2. **slug**: A URL-friendly version of your title (used in the URL path)
3. **image_url**: Path to the featured image for your post
4. **date_published**: Original publication date in ISO format
5. **date_updated**: Last update date in ISO format
6. **tags**: Space-separated list of tags (no commas)

## File Naming Convention

Name your markdown files using this format:
```
YYYY-MM-DD-post-slug.md
```

For example: `2024-04-01-welcome-to-the-server.md`

## Example Blog Post

Here's a complete example of a properly formatted blog post:

```markdown
---
title: Gens Announcement - Releasing March 22nd @ 3:00 PM EST
slug: gens-announcement-2025-3-15
image_url: /assets/img/post/2025/gens-release-march.png
date_published: 2024-3-23T15:18:54.465Z
date_updated: 2024-3-23T15:18:54.465Z
tags: Server News Changelog Announcement
---

# OPLegends | GENS MAP | LAUNCHING NEXT SATURDAY AT 3PM EST!

:sparkler: We're thrilled to announce the release of our Gens Map, launching Saturday, March 22nd, 2025, at 3PM EST!

## Features

- Feature 1
- Feature 2
- Feature 3

Read more details [here](https://example.com).
```

## Converting Existing Posts

To convert existing posts to this format, you can use the script:

```
node scripts/convert-markdown.js
```

## Supported Markdown Features

- Headings (# h1, ## h2, etc.)
- Emphasis (**bold**, *italic*)
- Lists (ordered and unordered)
- Links [text](url)
- Images ![alt](url)
- Code blocks
- Tables
- Blockquotes

## Images

Store your blog post images in the appropriate directory:
```
/public/assets/img/post/YYYY/image-name.jpg
```

## Emoji Support

You can use emoji shortcodes in your posts, like `:sparkler:` or `:heart:`.

---

For additional help, please contact the website administrator. 