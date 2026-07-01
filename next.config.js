/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Supabase Storage public URLs (property photos, document images)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // The Form 50-129 generate route reads templates/50-129.pdf from disk at
    // runtime. It isn't statically imported, so the file tracer won't include
    // it in the serverless bundle unless we say so explicitly.
    outputFileTracingIncludes: {
      "/api/properties/[id]/form50129/generate": ["./templates/**"],
    },
  },
};

module.exports = nextConfig;
