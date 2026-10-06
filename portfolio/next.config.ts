import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/pid', destination: '/tools/pid', permanent: false },
      { source: '/binexa', destination: 'https://binexa.juanlarraya.com.ar', permanent: false },
      { source: '/binexa/:path*', destination: 'https://binexa.juanlarraya.com.ar/:path*', permanent: false },
      { source: '/votacion', destination: 'https://votacion.juanlarraya.com.ar', permanent: false },
      { source: '/votacion/:path*', destination: 'https://votacion.juanlarraya.com.ar/:path*', permanent: false },
      { source: '/vision', destination: 'https://vision.juanlarraya.com.ar', permanent: false },
      { source: '/vision/:path*', destination: 'https://vision.juanlarraya.com.ar/:path*', permanent: false },
      { source: '/centralmap', destination: 'https://centralmap.juanlarraya.com.ar', permanent: false },
      { source: '/centralmap/:path*', destination: 'https://centralmap.juanlarraya.com.ar/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
