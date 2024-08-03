/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "./src/app/frames/[castHash]/route": ["./public/fonts/**/*"],
    },
  },
};

export default nextConfig;
