/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add security headers
    async headers() {
      return [
        {
          // Apply these headers to all routes
          source: '/:path*',
          headers: [
            // Content Security Policy
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*; font-src 'self' data:; frame-ancestors 'none';"
            },
            // Prevent clickjacking
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            // Helps prevent XSS attacks
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            // Prevents MIME type sniffing
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            // Referrer policy
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin'
            },
            // Strict Transport Security
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            // Permissions policy
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()'
            }
          ]
        }
      ];
    }
  };
  
  export default nextConfig;