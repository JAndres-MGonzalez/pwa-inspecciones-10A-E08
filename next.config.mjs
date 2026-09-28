/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, no-cache" }]
      },
      {
        // Cabeceras de seguridad para todas las rutas y archivos públicos.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; " +
              "base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
          }
        ]
      }
    ];
  }
};

export default nextConfig;