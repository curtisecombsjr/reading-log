# Reading Log 📚

A mobile-focused reading tracker app to log your reading journey. Track books you're reading, log events and characters as you go, and view your reading history.

## Features

- **Hybrid Book Search** — Search Google Books + Open Library with source toggle
- **Reading Log** — Log events and plot points as you read
- **Character Tracking** — Keep track of new characters and their descriptions
- **Star Ratings** — Rate books 1-5 stars
- **Personal Summaries** — Add your thoughts to any book
- **Custom Tags** — Organize books with tags and filter by them
- **Reading Goals** — Track streaks and custom challenges
- **Statistics Dashboard** — View reading pace, rating distribution, top tags
- **6 Color Themes** — Light, Void, Ember, Arctic, Steel, Rose
- **Offline Support** — All data stored locally, works offline as PWA
- **Mobile-First** — Optimized for phone use, installable as an app

## PWA Installation

### On Android (Chrome)
1. Visit your deployed site
2. Tap the menu (⋮) → "Add to Home Screen" or "Install app"
3. The app will appear on your home screen

### On iOS (Safari)
1. Visit your deployed site
2. Tap the Share button → "Add to Home Screen"
3. The app will appear on your home screen

### Generate APK (via PWABuilder)
1. Deploy the app to Vercel
2. Go to [pwabuilder.com](https://pwabuilder.com)
3. Enter your Vercel URL
4. Download the Android APK package
5. Sideload via ADB or file transfer

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Vercel will auto-detect Vite and deploy

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Tech Stack

- React 18
- Vite 5
- Google Books + Open Library APIs
- localStorage for data persistence
- Service Worker for offline support

## License

MIT
