export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    
    // Check if this is a static asset request
    if (
      pathname.startsWith('/assets/') ||
      pathname.startsWith('/images/') ||
      pathname.includes('.js') ||
      pathname.includes('.css') ||
      pathname.includes('.ico') ||
      pathname.includes('.png') ||
      pathname.includes('.jpg') ||
      pathname.includes('.svg')
    ) {
      // It's an asset request, let it pass through to the static file
      return fetch(request);
    }
    
    // Specifically handle content/blog/* requests to avoid 404s
    if (pathname.startsWith('/content/blog/')) {
      // Instead of returning 404, redirect to the blog page
      // This prevents 404 errors in console for missing markdown files
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/blog',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    // For known SPA routes, serve the index.html file
    if (
      pathname === '/blog' ||
      pathname.startsWith('/blog/') ||
      pathname === '/store' ||
      pathname === '/about' ||
      pathname === '/contact'
    ) {
      // Create a new request for index.html
      const response = await fetch(new URL('/index.html', request.url), {
        headers: request.headers
      });
      
      return new Response(response.body, {
        status: 200,
        headers: response.headers
      });
    }
    
    // For other paths, let the default handling happen
    return fetch(request);
  }
}; 