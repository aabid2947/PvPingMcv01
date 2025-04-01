export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    
    // Check if this is an asset request
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
    
    // For all other paths, we'll serve the index.html file
    // If the path is one of our SPA routes
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