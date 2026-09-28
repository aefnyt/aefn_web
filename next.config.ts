import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    // Mantenido en false intencionalmente: los errores de tipo romperían el deploy.
    // (Antes estaba en true y enmascaraba 126 errores; ya fueron corregidos —
    // si vuelven a aparecer, arréglalos en vez de re-activar el ignore.)
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
