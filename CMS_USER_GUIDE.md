# Netlify CMS User Guide

This guide will help you manage your website's blog content using Netlify CMS, a user-friendly content management system that lets you create and edit content without needing to understand coding.

## Accessing the CMS

1. Navigate to your website's admin panel by adding `/admin` to your website URL:
   ```
   https://your-website-domain.com/admin
   ```

2. Log in using your credentials (provided separately).

## Dashboard Overview

Once logged in, you'll see the main dashboard with the following components:

- **Left sidebar**: Shows all content types you can manage (in this case, "Blog").
- **Main content area**: Displays a list of existing content or the editor when creating/editing.
- **Top bar**: Contains options for publishing, saving drafts, and previewing content.

## Managing Blog Posts

### Viewing All Posts

1. Click on "Blog" in the left sidebar to see all existing blog posts.
2. You can filter and search for specific posts using the search bar.
3. Click on any post title to edit it.

### Creating a New Post

1. Click "Blog" in the left sidebar.
2. Click the "New Blog" button at the top of the page.
3. Fill in the required fields:
   - **Title**: The headline of your blog post.
   - **Publish Date**: When the post should be published (formatted as YYYY-MM-DD).
   - **Featured Image**: Upload an image to be displayed at the top of your post (optional).
   - **Tags**: Add relevant tags to categorize your post (e.g., "news", "update", "features").
   - **Excerpt**: A brief summary of your post (appears in blog listings).
   - **Body**: The main content of your post.

### Writing Content

The "Body" field supports Markdown, a simple formatting syntax. Here are some basic formatting options:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

[Link text](https://example.com)

- Bullet point
- Another bullet point

1. Numbered item
2. Another numbered item

![Image alt text](/images/uploads/image.jpg)

> Blockquote

`inline code`

```code block```
```

### Adding Images to Your Content

1. Place your cursor where you want to insert an image in the content editor.
2. Click the "+" button in the editor toolbar and select "Image".
3. Upload a new image or select from previously uploaded images.
4. Add alt text to describe the image (important for accessibility).

### Saving and Publishing

1. **Save draft**: Click "Save" to save your work without publishing.
2. **Preview**: Click "Preview" to see how your post will look on the site.
3. **Publish**: When you're ready to make your post live, click "Publish".

### Editing Existing Posts

1. Click on "Blog" in the left sidebar.
2. Find the post you want to edit and click on its title.
3. Make your changes.
4. Click "Save" to update the post.

### Deleting Posts

1. Click on "Blog" in the left sidebar.
2. Find the post you want to delete.
3. Click on the post to open it.
4. Click the "Delete" button at the top of the editor.
5. Confirm the deletion when prompted.

## Media Management

All uploaded images are stored in the Media Library.

1. Click on "Media" in the left sidebar to view all uploaded media.
2. You can upload new files, search for existing files, or delete files you no longer need.
3. When inserting images into posts, you can select from previously uploaded media.

## Best Practices

1. **Use descriptive titles**: Clear titles help readers and improve search results.
2. **Add meaningful tags**: Tags help organize content and make it discoverable.
3. **Include high-quality images**: Use images that are relevant and visually appealing.
4. **Write engaging excerpts**: The excerpt is often displayed in search results and social media shares.
5. **Preview before publishing**: Always preview your posts to ensure they look as expected.
6. **Optimize images**: Large images can slow down your site. Resize and compress images before uploading.

## Getting Help

If you encounter any issues or have questions about using the CMS, please contact your web development team for assistance.

---

## Markdown Cheat Sheet

### Basic Syntax

| Element | Markdown Syntax |
| ------- | --------------- |
| Heading 1 | # Heading 1 |
| Heading 2 | ## Heading 2 |
| Heading 3 | ### Heading 3 |
| Bold | **bold text** |
| Italic | *italicized text* |
| Blockquote | > blockquote |
| Ordered List | 1. First item<br>2. Second item |
| Unordered List | - First item<br>- Second item |
| Code | `code` |
| Horizontal Rule | --- |
| Link | [title](https://www.example.com) |
| Image | ![alt text](/images/uploads/image.jpg) |

### Extended Syntax

| Element | Markdown Syntax |
| ------- | --------------- |
| Table | \| Header 1 \| Header 2 \|<br>\| -------- \| -------- \|<br>\| Content 1 \| Content 2 \| |
| Fenced Code Block | \```<br>code block<br>\``` |
| Footnote | Here's a sentence with a footnote.[^1]<br><br>[^1]: This is the footnote. |
| Strikethrough | ~~strike through~~ |
| Task List | - [x] Task 1<br>- [ ] Task 2 |
``` 