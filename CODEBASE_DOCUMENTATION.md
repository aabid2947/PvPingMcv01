# PvPingMC Website Codebase Documentation

This document provides a comprehensive overview of the PvPingMC website codebase, including its architecture, components, features, and data structures.

## Project Overview

The PvPingMC website is a React-based application built with Vite, featuring a modern UI with Tailwind CSS. It includes a blog system, store integration with Tebex, and various pages for server information.

## Technology Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.1.4
- **CSS Framework**: Tailwind CSS 4.0.17
- **Routing**: React Router DOM 6.22.1
- **Markdown Processing**: gray-matter 4.0.3, marked 15.0.7
- **HTTP Client**: Axios 1.8.4
- **UI Components**: @headlessui/react 2.2.0, lucide-react 0.485.0
- **Deployment**: Cloudflare Pages

## Project Structure

### Core Directories

- `/src`: Main source code
  - `/api`: API integration code
  - `/assets`: Static assets (images, icons)
  - `/components`: Reusable UI components
  - `/context` and `/contexts`: React context providers
  - `/lib`: Utility libraries
  - `/pages`: Page components
  - `/utils`: Utility functions
- `/content`: Content files
  - `/blog`: Markdown blog posts
- `/public`: Static files served directly
- `/admin`: Netlify CMS admin interface

## Key Features

### 1. Blog System

**Files:**
- `/src/pages/BlogOverview.jsx`: Blog listing page
- `/src/pages/BlogDetail.jsx`: Individual blog post page
- `/src/utils/markdown.js`: Markdown processing utilities
- `/content/blog/*.md`: Blog post content files

**Functions:**
- `getAllPosts()`: Retrieves and processes all blog posts
- `getPostBySlug()`: Retrieves a specific blog post by slug
- `parseMarkdown()`: Converts markdown to HTML
- `parseFrontmatter()`: Extracts metadata from blog posts

**Data Structure:**
- Blog posts use frontmatter for metadata (title, date, tags, thumbnail, excerpt)
- Content is stored in Markdown format

### 2. Store Integration (Tebex)

**Files:**
- `/src/pages/Store.jsx`: Store page component and context provider
- `/src/utils/tebexHeadlessService.js`: Tebex API integration
- `/src/utils/packageService.js`: Package management
- `/src/utils/checkoutService.js`: Checkout process
- `/src/contexts/CartContext.jsx`: Shopping cart state management
- `/src/contexts/BasketContext.jsx`: Tebex basket integration

**Functions:**
- `fetchCategories()`: Retrieves store categories
- `categorizePackages()`: Organizes packages by category
- `createBasket()`: Creates a new Tebex basket
- `addToBasket()`: Adds items to the basket
- `checkout()`: Processes checkout

**Data Structure:**
- Store categories defined in `/public/store-categories.json`
- Packages retrieved from Tebex API
- Cart items stored in localStorage

### 3. User Authentication

**Files:**
- `/src/context/UserContext.jsx`: User state management
- `/src/components/LoginModal.jsx`: Login interface
- `/src/components/LoginConfirmation.jsx`: Confirmation dialog

**Functions:**
- `login()`: Authenticates user
- `logout()`: Logs out user
- `updateUsername()`: Updates user information

**Data Structure:**
- User data stored in localStorage
- Purchase history tracked for logged-in users

## Page Components

1. **Home** (`/src/pages/Home.jsx`)
   - Main landing page with server information
   - Features recent blog posts
   - Server promotion sections

2. **Store** (`/src/pages/Store.jsx`)
   - Displays purchasable packages
   - Filtering by category
   - Cart and checkout functionality

3. **Blog** (`/src/pages/BlogOverview.jsx`)
   - Lists all blog posts
   - Filtering by tags
   - Pagination

4. **Player Guide** (`/src/pages/PlayerGuide.jsx`)
   - Information for new players

5. **Rules** (`/src/pages/Rules.jsx`)
   - Server rules and guidelines

6. **Vote** (`/src/pages/Vote.jsx`)
   - Server voting links

7. **Origin Pass** (`/src/pages/OriginPass.jsx`)
   - Premium membership information

## Context Providers

1. **UserContext** (`/src/context/UserContext.jsx`)
   - Manages user authentication state
   - Stores username and login status
   - Tracks purchase history

2. **CartContext** (`/src/contexts/CartContext.jsx`)
   - Manages shopping cart state
   - Stores cart items in localStorage
   - Provides cart operations (add, remove, clear)

3. **BasketContext** (`/src/contexts/BasketContext.jsx`)
   - Integrates with Tebex basket API
   - Synchronizes local cart with remote basket
   - Handles checkout process

4. **StoreContext** (`/src/pages/Store.jsx`)
   - Provides store data to components
   - Manages package and category loading
   - Handles filtering and sorting

## Utility Functions

1. **markdown.js**
   - Processes Markdown content
   - Extracts frontmatter
   - Converts Markdown to HTML

2. **tebexHeadlessService.js**
   - Communicates with Tebex API
   - Handles authentication
   - Manages baskets and checkout

3. **packageService.js**
   - Fetches and organizes store packages
   - Categorizes packages

4. **checkoutService.js**
   - Processes checkout operations
   - Handles payment flow

## Build and Deployment

- **Development**: `npm run dev` - Starts Vite development server
- **Build**: `npm run build` - Creates production build
- **Preview**: `npm run preview` - Previews production build
- **Deployment**: Configured for Cloudflare Pages via GitHub Actions

## Interdependencies

1. **Blog System Dependencies**:
   - `markdown.js` → `BlogOverview.jsx` and `BlogDetail.jsx`
   - Blog content files → `getAllPosts()` function

2. **Store System Dependencies**:
   - `tebexHeadlessService.js` → `BasketContext.jsx` → `CartContext.jsx`
   - `Store.jsx` → `CartModal.jsx` → `CheckoutModal.jsx`

3. **Authentication Flow**:
   - `UserContext.jsx` → `LoginModal.jsx` → `tebexHeadlessService.js`

## Configuration Files

1. **vite.config.js**
   - Vite build configuration
   - Custom plugins for Markdown processing
   - Environment variable handling

2. **tailwind.config.js**
   - Tailwind CSS configuration
   - Custom theme settings
   - Extended color palette

3. **.env and .env.example**
   - Environment variables
   - API keys and configuration

## Conclusion

The PvPingMC website is a well-structured React application with clear separation of concerns. The codebase follows modern React patterns with context-based state management and component composition. The integration with Tebex provides e-commerce functionality, while the Markdown-based blog system allows for easy content management.