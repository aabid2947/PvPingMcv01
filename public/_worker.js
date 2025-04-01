export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const { pathname } = url;
      
      // Handle API routes
      if (pathname.startsWith('/api/')) {
        // Forward API requests to the API handler
        const apiRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
        
        // Add environment variables to the request
        apiRequest.env = {
          TEBEX_STORE_ID: env.TEBEX_STORE_ID,
          TEBEX_API_KEY: env.TEBEX_API_KEY,
        };
        
        return env.API.fetch(apiRequest);
      }
      
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
        // Let Cloudflare handle static assets directly
        return env.ASSETS.fetch(request);
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
        // Fetch index.html directly from the assets
        const response = await env.ASSETS.fetch(new URL('/index.html', request.url));
        return new Response(response.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          }
        });
      }
      
      // Default route - serve index.html
      const response = await env.ASSETS.fetch(new URL('/index.html', request.url));
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