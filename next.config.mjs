import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const isStandaloneBuild = process.env.NEXT_OUTPUT_STANDALONE === '1';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStandaloneBuild ? { output: 'standalone' } : {}),
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'docs.klong.lat',
        'klong-docs.vercel.app',
      ],
    },
  },
  async headers() {
    return [
      {
        // Apply charset to HTML pages
        source: '/:lang(zh)/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:lang/docs/:path*.mdx',
        destination: '/:lang/llms.mdx/:path*',
      },
    ];
  },
};

export default withMDX(config);
