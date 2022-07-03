/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
            source: '/api/:path*',
            destination: 'https://notify-api.line.me/:path*',
            },
        ]
    },
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig
