import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // set only to silence the startup warning; reproduces with false too
  partialPrefetching: true,
  cacheLife: {
    // stale under 30 with expire of 300 or more: never refreshes
    frozen: { stale: 0, revalidate: 15, expire: 300 },
    // identical except stale: refreshes as expected
    ok: { stale: 30, revalidate: 15, expire: 300 },
  },
};

export default nextConfig;
