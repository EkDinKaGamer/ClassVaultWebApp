
import { MetadataRoute } from 'next';

/**
 * PWA Manifest Generator
 * Configures how the app behaves when installed on a home screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClassVault',
    short_name: 'ClassVault',
    description: 'Elite Academic Resource Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1d4ed8',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
