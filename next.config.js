/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // API ルートの設定
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // 環境変数の設定
  env: {
    NEXT_PUBLIC_GITHUB_ACCESS_TOKEN: process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN,
  },
  // ログレベルの設定
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
