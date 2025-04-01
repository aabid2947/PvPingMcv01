export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const { pathname } = url;
      
      // Handle static assets
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
        return fetch(request);
      }
      
      // Handle blog content requests
      if (pathname.startsWith('/content/blog/')) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/blog',
            'Cache-Control': 'no-cache'
          }
        });
      }
      
      // Handle SPA routes
      if (
        pathname === '/blog' ||
        pathname.startsWith('/blog/') ||
        pathname === '/store' ||
        pathname === '/about' ||
        pathname === '/contact'
      ) {
        const response = await fetch(new URL('/index.html', request.url));
        return new Response(response.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          }
        });
      }
      
      // Default route - serve index.html
      const response = await fetch(new URL('/index.html', request.url));
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });

    } catch (error) {
      // Log the error for debugging
      console.error('Worker error:', error);
      
      // Return a proper error response
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      });
    }
  }
}; 