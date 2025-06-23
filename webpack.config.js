const { getDefaultConfig } = require("expo/webpack-config");
const { GenerateSW } = require("workbox-webpack-plugin");

module.exports = async function (env, argv) {
  const config = await getDefaultConfig(env, argv);

  // Add service worker plugin for PWA
  if (env.mode === "production") {
    config.plugins.push(
      new GenerateSW({
        // Don't precache source maps
        exclude: [/\.map$/, /asset-manifest\.json$/],

        // Define runtime caching
        runtimeCaching: [
          {
            // Cache API responses
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?${Date.now()}`;
              },
            },
          },
          {
            // Cache static assets
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
          {
            // Cache app shell
            urlPattern: /^https:\/\/localhost:8081\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "app-shell",
              expiration: {
                maxEntries: 25,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
        ],

        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,

        // Add offline fallback
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      })
    );
  }

  return config;
};
