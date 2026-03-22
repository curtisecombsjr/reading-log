# Reading Log 📚

A mobile-focused reading tracker app to log your reading journey. Track books you're reading, log events and characters as you go, and view your reading history.

## Features

- **Book Search** — Search Google Books API to auto-fill book details and covers
- **Reading Log** — Log events and plot points as you read
- **Character Tracking** — Keep track of new characters and their descriptions
- **Reading History** — View finished books with date range filtering
- **5 Color Themes** — Parchment, Midnight, Forest, Sepia, Lavender
- **Offline Support** — All data stored locally in your browser
- **Mobile-First** — Optimized for phone use, works great in browsers too

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
- Google Books API
- localStorage for data persistence

## License

MIT
