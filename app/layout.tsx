import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SocialMapper - Community Accessibility Analysis',
  description:
    'Analyze community accessibility and demographic patterns through travel-time based analysis. Discover POIs, generate isochrones, and explore census data.',
  keywords: [
    'geospatial analysis',
    'accessibility',
    'census data',
    'isochrone',
    'community mapping',
    'demographics',
    'travel time',
    'OpenStreetMap',
  ],
  authors: [{ name: 'mihiarc' }],
  openGraph: {
    title: 'SocialMapper - Community Accessibility Analysis',
    description:
      'Analyze community accessibility and demographic patterns through travel-time based analysis.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
