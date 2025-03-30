# OriginMC Website with Netlify CMS Integration

This project is a static website for OriginMC built with React and Vite, featuring blog management through Netlify CMS.

## Features

- Modern, responsive design using Tailwind CSS
- Dynamic blog system with Markdown support
- Admin interface for content management via Netlify CMS
- Optimized for deployment on Cloudflare Pages

## Getting Started

### Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### CMS Access

The CMS is accessible at `/admin` when the site is running. This provides an interface to:
- Create, edit, and delete blog posts
- Manage media assets
- Preview content changes before publishing

## Blog System

### Structure

- Blog posts are stored as Markdown files in the `content/blog` directory
- Each post has frontmatter with metadata (title, date, tags, etc.)
- Images and assets are stored in `public/images/uploads`

### Creating a New Post

1. Navigate to `/admin` and log in
2. Click "Blog" in the left sidebar
3. Click "New Blog" button
4. Fill in the required fields:
   - Title
   - Publish Date
   - Featured Image (optional)
   - Tags (comma-separated)
   - Excerpt (brief summary)
   - Body (main content in Markdown)
5. Click "Save" to publish the post or "Save as Draft" to save without publishing

### Editing Posts

1. Navigate to `/admin` and log in
2. Click "Blog" in the left sidebar
3. Select the post you want to edit
4. Make your changes
5. Click "Save" to update the post

## Deployment

This site is configured for deployment on Cloudflare Pages. When changes are pushed to the main branch:
1. Cloudflare Pages rebuilds the site
2. The updated content is automatically deployed

## CMS Configuration

The Netlify CMS configuration is located at `public/admin/config.yml`. This defines:

- Backend configuration (Git provider)
- Media folder settings
- Content collections and their fields

## Technologies Used

- React
- Vite
- Tailwind CSS
- Netlify CMS
- Markdown parsing with marked
- Frontmatter parsing with gray-matter

## Troubleshooting

### Common Issues

- If the CMS login doesn't work, ensure the Netlify Identity service is properly configured
- For image upload issues, check that the media folder permissions are correct
- If posts aren't appearing, verify the markdown files are properly formatted with valid frontmatter

## License

This project is proprietary and confidential.
