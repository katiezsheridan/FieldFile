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
  async redirects() {
    return [
      {
        // The /wildlife-exemption lead-capture landing page was retired. Its
        // subject is now covered by the blog post, which is the destination for
        // any ad, bookmark, or inbound link still pointing at the old path.
        // Permanent (308) so search engines transfer the URL's equity.
        source: "/wildlife-exemption",
        destination: "/blog/choosing-texas-wildlife-management-practices",
        permanent: true,
      },
    ];
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
