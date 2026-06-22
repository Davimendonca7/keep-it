/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',   // ← adiciona isso
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: { unoptimized: true },
    productionBrowserSourceMaps: false,
    swcMinify: true,
    experimental: {
        optimizePackageImports: ['@radix-ui'],
    },
    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 5,
    },
};

module.exports = nextConfig;