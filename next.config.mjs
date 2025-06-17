/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Fix Supabase realtime dependency warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Ignore dynamic imports in @supabase/realtime-js and related packages
    config.module.rules.push({
      test: /node_modules\/@supabase\/(realtime-js|postgrest-js)/,
      parser: {
        requireEnsure: false,
      },
    });
    
    // Suppress multiple types of critical dependency warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/(realtime-js|postgrest-js)/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/ws/,
        message: /Critical dependency/,
      },
      // Suppress other common warnings that don't affect functionality
      /Module not found: Can't resolve 'encoding'/,
      /Module not found: Can't resolve 'bufferutil'/,
      /Module not found: Can't resolve 'utf-8-validate'/,
    ];
    
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
