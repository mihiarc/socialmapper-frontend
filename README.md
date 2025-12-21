# SocialMapper Frontend

A modern, map-centric web interface for the SocialMapper geospatial analysis toolkit.

![SocialMapper UI](./docs/screenshot.png)

## Features

- **Interactive Map** - Mapbox GL JS powered map with dark cartographic styling
- **Location Search** - Geocoding with autocomplete suggestions
- **Travel-Time Analysis** - Configure walk, bike, or drive isochrones (5-60 min)
- **POI Discovery** - Select from 8+ categories of points of interest
- **Census Demographics** - View population and demographic data
- **Layer Controls** - Toggle visibility and opacity of data layers
- **Export** - Download results as CSV or GeoJSON

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS / react-map-gl
- **State**: Zustand
- **Data Fetching**: SWR
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Mapbox account (free tier works)
- SocialMapper backend running (see below)

### Installation

```bash
# Clone the repository
git clone https://github.com/mihiarc/socialmapper.git
cd socialmapper/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your Mapbox token to .env.local
# NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JS access token | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:8000) | No |
| `CENSUS_API_KEY` | Census Bureau API key | No |

## Project Structure

```
socialmapper-frontend/
├── app/
│   ├── layout.tsx          # Root layout with fonts/metadata
│   └── page.tsx            # Main page component
├── components/
│   ├── map/
│   │   └── Map.tsx         # Mapbox GL map component
│   ├── panels/
│   │   ├── SearchPanel.tsx # Location/analysis config
│   │   ├── ResultsPanel.tsx # Analysis results display
│   │   ├── LayersPanel.tsx # Map layer controls
│   │   └── SettingsPanel.tsx # App settings
│   └── Sidebar.tsx         # Main sidebar navigation
├── lib/
│   ├── api.ts              # API client functions
│   ├── store.ts            # Zustand state management
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
├── styles/
│   └── globals.css         # Global styles + Tailwind
└── public/
    └── ...                 # Static assets
```

## Design System

### Color Palette

The UI uses a dark cartographic theme:

- **Background**: `#0a0f1a` (carto-bg)
- **Surface**: `#111827` (carto-surface)
- **Elevated**: `#1f2937` (carto-elevated)
- **Border**: `#374151` (carto-border)
- **Accent Blue**: `#3b82f6`
- **Accent Cyan**: `#06b6d4`

### Typography

- **Headings**: Space Grotesk
- **Body**: DM Sans
- **Monospace**: JetBrains Mono

## API Integration

The frontend expects a FastAPI backend running at `NEXT_PUBLIC_API_URL`. See the `/backend` directory for the API implementation.

### Key Endpoints

- `POST /api/analysis` - Run accessibility analysis
- `POST /api/isochrone` - Create travel-time polygon
- `POST /api/poi` - Find points of interest
- `POST /api/census/blocks` - Get census block groups
- `GET /api/geocode` - Geocode location string
- `POST /api/export/:id` - Export analysis results

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Related

- [SocialMapper Python Library](https://github.com/mihiarc/socialmapper)
- [SocialMapper Backend API](./backend/README.md)
- [Documentation](https://mihiarc.github.io/socialmapper)
