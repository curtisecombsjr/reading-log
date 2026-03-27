# Reading Log - Version History

## v1.2 - March 27, 2026

**Snapshot:** `reading-log-v1.2-2026-03-27.jsx`

### New Features
- **Hybrid Book Search**: Toggle between search sources
  - "All Sources" searches Google Books + Open Library simultaneously
  - "Google Books" — better for comics, graphic novels, TPBs, manga
  - "Open Library" — good for traditional/classic books
  - Results show source badge for each book
  - Switching sources re-searches automatically

### Bug Fixes
- **Personal Summary keyboard fix**: Textarea no longer closes keyboard on every keystroke on mobile
  - Now uses local state and saves on blur
  - Added useEffect to sync state when switching between books

### Tech Stack
- React 18 + Vite 5
- Google Books API + Open Library API (hybrid search)
- Vercel-ready deployment

---

## v1.1 - March 22, 2026

**Snapshot:** `reading-log-v1.1-2026-03-22.jsx`

### New Features
- **Star Rating System**: Rate books 1-5 stars, editable anytime
- **Personal Summary**: Add your thoughts/summary to any book
- **Reopen Finished Books**: Click "Finished ↩" badge or button to move books back to Reading
- **Goals Tab**: New dedicated tab for reading goals
  - Reading Streak Tracker: Track consecutive days with log entries, shows current & longest streak
  - Custom Challenges: Create personal reading goals, mark complete, track progress
- **Tagging System**: 
  - Add custom tags to books (e.g., #fiction, #scifi, #classics)
  - Autocomplete suggests existing tags
  - Filter Reading and History tabs by tag
  - Tags display on book cards (up to 3 shown)
- **"Already Read" Option**: Mark books as finished when adding them

### Improvements
- Light theme colors fixed: Tags and accent elements now use readable light backgrounds
- Accent color changed from dark navy to vibrant indigo (#5046e5)
- Challenges included in backup/restore

### Tech Stack
- React 18 + Vite 5
- Open Library API for book search
- Vercel-ready deployment

---

## v1.0 - March 22, 2026

**Snapshot:** `reading-log-v1.0-2026-03-22.jsx`

### Features
- Add books with title, author, and cover image
- Search books via Open Library API (free, no API key)
- Log reading entries with event descriptions
- Track new characters with descriptions per entry
- View compiled character list per book
- Mark books as finished
- History tab with date range filtering
- 6 color themes (Light default, Void, Ember, Arctic, Steel, Rose)
- Iron Log-style modern UI (sharp corners, monospace fonts, uppercase labels)
- Backup & Restore to .rlbak files
- All data persisted to localStorage

### Tech Stack
- React 18 + Vite 5
- Open Library API for book search
- Vercel-ready deployment

---

To revert to a version:
1. Copy the `.jsx` file to `reading-log-app/src/App.jsx`
2. Or extract the `.zip` for the full project
