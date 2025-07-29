/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        tsconfigPath: "./tsconfig.json",
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.**.**",
            },
        ],
    },
};

export default nextConfig;