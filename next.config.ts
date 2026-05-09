import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Three.js bundles ship as ESM-only; mark heavier sub-deps as transpiled
  // so server builds don't trip on imports they shouldn't be touching anyway.
  transpilePackages: ["three"],
  serverExternalPackages: ["@prisma/client", "@auth/prisma-adapter"],
};

export default nextConfig;
