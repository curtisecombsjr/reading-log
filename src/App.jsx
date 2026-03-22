import React, { useState, useEffect, useRef } from 'react';

const THEMES = {
  parchment: {
    name: 'Parchment',
    bg: '#f5f0e6',
    surface: '#fffef9',
    surfaceAlt: '#e8e0d0',
    text: '#2c2416',
    textMuted: '#6b5d4d',
    accent: '#8b4513',
    accentLight: '#d4a574',
    border: '#d4c9b8',
    danger: '#a33',
    success: '#2d5a27',
  },
  midnight: {
    name: 'Midnight',
    bg: '#0d1117',
    surface: '#161b22',
    surfaceAlt: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    accent: '#58a6ff',
    accentLight: '#1f6feb',
    border: '#30363d',
    danger: '#f85149',
    success: '#3fb950',
  },
  forest: {
    name: 'Forest',
    bg: '#1a2118',
    surface: '#242e22',
    surfaceAlt: '#2e3a2b',
    text: '#d8e4d6',
    textMuted: '#8fa38a',
    accent: '#7cb668',
    accentLight: '#4a7c3f',
    border: '#3d4d39',
    danger: '#e57373',
    success: '#81c784',
  },
  sepia: {
    name: 'Sepia',
    bg: '#2b2015',
    surface: '#3d2e1f',
    surfaceAlt: '#4a3928',
    text: '#e8dcc8',
    textMuted: '#b8a88e',
    accent: '#d4a56a',
    accentLight: '#a67c4a',
    border: '#5a4633',
    danger: '#e07a5f',
    success: '#81b29a',
  },
  lavender: {
    name: 'Lavender',
    bg: '#f8f6fc',
    surface: '#ffffff',
    surfaceAlt: '#ede8f5',
    text: '#2d2640',
    textMuted: '#6b6280',
    accent: '#7c5cbf',
    accentLight: '#a896d4',
    border: '#d8d0e8',
    danger: '#c44569',
    success: '#27ae60',
  },
};

const FONTS = {
  parchment: { heading: "'Playfair Display', Georgia, serif", body: "'Crimson Text', Georgia, serif" },
  midnight: { heading: "'Space Grotesk', system-ui, sans-serif", body: "'IBM Plex Sans', system-ui, sans-serif" },
  forest: { heading: "'Bitter', Georgia, serif", body: "'Source Sans 3', system-ui, sans-serif" },
  sepia: { heading: "'Libre Baskerville', Georgia, serif", body: "'Lora', Georgia, serif" },
  lavender: { heading: "'DM Serif Display', Georgia, serif", body: "'Nunito', system-ui, sans-serif" },
};

export default function ReadingLog() {
  const [theme, setTheme] = useState('parchment');
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [tab, setTab] = useState('current'); // current, history, settings
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const fileInputRef = useRef(null);

  const t = THEMES[theme];
  const fonts = FONTS[theme];

  useEffect(() => {
    const saved = localStorage.getItem('readingLog');
    if (saved) {
      const data = JSON.parse(saved);
      setBooks(data.books || []);
      setTheme(data.theme || 'parchment');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('readingLog', JSON.stringify({ books, theme }));
  }, [books, theme]);

  const addBook = (book) => {
    const newBook = {
      id: Date.now(),
      ...book,
      entries: [],
      status: 'reading',
      startDate: new Date().toISOString(),
      finishDate: null,
    };
    setBooks([newBook, ...books]);
    setShowAddBook(false);
  };

  const updateBook = (bookId, updates) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, ...updates } : b));
    if (currentBook?.id === bookId) {
      setCurrentBook({ ...currentBook, ...updates });
    }
  };

  const addEntry = (bookId, entry) => {
    const newEntry = {
      id: Date.now(),
      ...entry,
      date: new Date().toISOString(),
    };
    const updatedBooks = books.map(b => {
      if (b.id === bookId) {
        return { ...b, entries: [newEntry, ...b.entries] };
      }
      return b;
    });
    setBooks(updatedBooks);
    if (currentBook?.id === bookId) {
      setCurrentBook({ ...currentBook, entries: [newEntry, ...currentBook.entries] });
    }
    setShowAddEntry(false);
  };

  const markAsFinished = (bookId) => {
    updateBook(bookId, { status: 'finished', finishDate: new Date().toISOString() });
  };

  const deleteBook = (bookId) => {
    if (confirm('Delete this book and all its entries?')) {
      setBooks(books.filter(b => b.id !== bookId));
      if (currentBook?.id === bookId) setCurrentBook(null);
    }
  };

  const deleteEntry = (bookId, entryId) => {
    const updatedBooks = books.map(b => {
      if (b.id === bookId) {
        return { ...b, entries: b.entries.filter(e => e.id !== entryId) };
      }
      return b;
    });
    setBooks(updatedBooks);
    if (currentBook?.id === bookId) {
      setCurrentBook({ ...currentBook, entries: currentBook.entries.filter(e => e.id !== entryId) });
    }
  };

  const currentBooks = books.filter(b => b.status === 'reading');
  const finishedBooks = books.filter(b => {
    if (b.status !== 'finished') return false;
    if (dateRange.start && new Date(b.finishDate) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(b.finishDate) > new Date(dateRange.end + 'T23:59:59')) return false;
    return true;
  });

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: t.bg,
      color: t.text,
      fontFamily: fonts.body,
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      paddingBottom: '80px',
    },
    header: {
      background: t.surface,
      borderBottom: `1px solid ${t.border}`,
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    title: {
      fontFamily: fonts.heading,
      fontSize: '1.75rem',
      fontWeight: 700,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    nav: {
      display: 'flex',
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      background: t.surface,
      borderTop: `1px solid ${t.border}`,
      zIndex: 100,
    },
    navBtn: (active) => ({
      flex: 1,
      padding: '14px 8px',
      background: 'none',
      border: 'none',
      color: active ? t.accent : t.textMuted,
      fontFamily: fonts.body,
      fontSize: '0.75rem',
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      transition: 'color 0.2s',
    }),
    content: {
      padding: '16px',
    },
    card: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
    },
    bookCard: {
      display: 'flex',
      gap: '14px',
      cursor: 'pointer',
      transition: 'transform 0.15s',
    },
    bookCover: {
      width: '70px',
      height: '100px',
      borderRadius: '6px',
      objectFit: 'cover',
      background: t.surfaceAlt,
      border: `1px solid ${t.border}`,
      flexShrink: 0,
    },
    bookInfo: {
      flex: 1,
      minWidth: 0,
    },
    bookTitle: {
      fontFamily: fonts.heading,
      fontSize: '1.1rem',
      fontWeight: 600,
      margin: '0 0 4px 0',
      lineHeight: 1.3,
    },
    bookAuthor: {
      color: t.textMuted,
      fontSize: '0.9rem',
      margin: '0 0 8px 0',
    },
    badge: {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: t.accentLight,
      color: t.surface,
    },
    btn: (variant = 'primary') => ({
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      fontFamily: fonts.body,
      fontSize: '0.95rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      ...(variant === 'primary' && { background: t.accent, color: '#fff' }),
      ...(variant === 'secondary' && { background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }),
      ...(variant === 'danger' && { background: t.danger, color: '#fff' }),
    }),
    input: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: '8px',
      border: `1px solid ${t.border}`,
      background: t.surfaceAlt,
      color: t.text,
      fontFamily: fonts.body,
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: '8px',
      border: `1px solid ${t.border}`,
      background: t.surfaceAlt,
      color: t.text,
      fontFamily: fonts.body,
      fontSize: '1rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px',
      boxSizing: 'border-box',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: 500,
      color: t.textMuted,
      fontSize: '0.9rem',
    },
    formGroup: {
      marginBottom: '16px',
    },
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 200,
    },
    modalContent: {
      background: t.surface,
      borderRadius: '20px 20px 0 0',
      padding: '24px 20px',
      width: '100%',
      maxWidth: '480px',
      maxHeight: '85vh',
      overflowY: 'auto',
    },
    modalTitle: {
      fontFamily: fonts.heading,
      fontSize: '1.4rem',
      fontWeight: 600,
      margin: '0 0 20px 0',
    },
    entry: {
      background: t.surfaceAlt,
      borderRadius: '10px',
      padding: '14px',
      marginBottom: '10px',
    },
    entryDate: {
      fontSize: '0.8rem',
      color: t.textMuted,
      marginBottom: '8px',
    },
    entryText: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
      marginBottom: '10px',
    },
    character: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: '6px',
      padding: '8px 10px',
      marginTop: '6px',
    },
    characterName: {
      fontWeight: 600,
      fontSize: '0.9rem',
      color: t.accent,
    },
    characterDesc: {
      fontSize: '0.85rem',
      color: t.textMuted,
      marginTop: '2px',
    },
    fab: {
      position: 'fixed',
      bottom: '90px',
      right: 'calc(50% - 220px)',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: t.accent,
      color: '#fff',
      border: 'none',
      fontSize: '1.8rem',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: t.accent,
      fontSize: '1rem',
      cursor: 'pointer',
      padding: '0',
      fontFamily: fonts.body,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    themeBtn: (active) => ({
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: active ? `3px solid ${t.accent}` : `2px solid ${t.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: t.textMuted,
    },
  };

  // Icons
  const BookIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );

  const HistoryIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );

  const ArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );

  const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );

  // Add Book Modal
  const AddBookModal = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [cover, setCover] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const searchTimeout = useRef(null);

    const searchBooks = async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&printType=books`
        );
        const data = await response.json();
        
        if (data.items) {
          const books = data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title || 'Unknown Title',
            author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
            cover: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                   item.volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') || '',
            description: item.volumeInfo.description || '',
            publishedDate: item.volumeInfo.publishedDate || '',
            pageCount: item.volumeInfo.pageCount || null,
          }));
          setSearchResults(books);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
      setIsSearching(false);
    };

    const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      
      // Debounce search
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => searchBooks(query), 400);
    };

    const selectBook = (book) => {
      setTitle(book.title);
      setAuthor(book.author);
      setCover(book.cover);
      setSearchQuery('');
      setSearchResults([]);
      setShowManual(true);
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setCover(ev.target.result);
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = () => {
      if (!title.trim()) return;
      addBook({ title: title.trim(), author: author.trim(), cover });
    };

    const resetForm = () => {
      setTitle('');
      setAuthor('');
      setCover('');
      setSearchQuery('');
      setSearchResults([]);
      setShowManual(false);
    };

    const SearchIcon = () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    );

    return (
      <div style={styles.modal} onClick={() => setShowAddBook(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={styles.modalTitle}>Add New Book</h2>
          
          {!showManual ? (
            <>
              {/* Search Section */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Search for a book</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    style={{ ...styles.input, paddingLeft: '40px' }}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Enter title or author..."
                    autoFocus
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <SearchIcon />
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {isSearching && (
                <div style={{ textAlign: 'center', padding: '20px', color: t.textMuted }}>
                  Searching...
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                  {searchResults.map(book => (
                    <div
                      key={book.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        background: t.surfaceAlt,
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => selectBook(book)}
                      onMouseEnter={e => e.currentTarget.style.background = t.border}
                      onMouseLeave={e => e.currentTarget.style.background = t.surfaceAlt}
                    >
                      {book.cover ? (
                        <img 
                          src={book.cover} 
                          alt={book.title}
                          style={{ width: '45px', height: '68px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ 
                          width: '45px', 
                          height: '68px', 
                          background: t.surface, 
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          flexShrink: 0,
                        }}>
                          📖
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {book.title}
                        </div>
                        <div style={{ color: t.textMuted, fontSize: '0.85rem', marginTop: '2px' }}>
                          {book.author}
                        </div>
                        {book.publishedDate && (
                          <div style={{ color: t.textMuted, fontSize: '0.75rem', marginTop: '4px' }}>
                            {book.publishedDate.split('-')[0]}
                            {book.pageCount && ` • ${book.pageCount} pages`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: t.textMuted }}>
                  No books found. Try a different search or add manually.
                </div>
              )}

              <div style={{ 
                borderTop: `1px solid ${t.border}`, 
                paddingTop: '16px', 
                marginTop: '8px',
                display: 'flex',
                gap: '10px',
              }}>
                <button style={{ ...styles.btn('secondary'), flex: 1 }} onClick={() => setShowAddBook(false)}>
                  Cancel
                </button>
                <button style={{ ...styles.btn('secondary'), flex: 1 }} onClick={() => setShowManual(true)}>
                  Add Manually
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Manual Entry / Edit Section */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Cover</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {cover ? (
                    <img src={cover} alt="Cover" style={{ ...styles.bookCover, width: '80px', height: '120px' }} />
                  ) : (
                    <div style={{ ...styles.bookCover, width: '80px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, fontSize: '0.8rem' }}>
                      No cover
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      style={{ ...styles.btn('secondary'), fontSize: '0.85rem', padding: '8px 14px' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </button>
                    {cover && (
                      <button
                        style={{ ...styles.btn('secondary'), fontSize: '0.85rem', padding: '8px 14px' }}
                        onClick={() => setCover('')}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter book title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Author</label>
                <input
                  type="text"
                  style={styles.input}
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Enter author name"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button style={{ ...styles.btn('secondary'), flex: 1 }} onClick={resetForm}>
                  Back
                </button>
                <button style={{ ...styles.btn('primary'), flex: 1 }} onClick={handleSubmit}>
                  Add Book
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Add Entry Modal
  const AddEntryModal = () => {
    const [description, setDescription] = useState('');
    const [characters, setCharacters] = useState([{ name: '', description: '' }]);

    const addCharacterField = () => {
      setCharacters([...characters, { name: '', description: '' }]);
    };

    const updateCharacter = (index, field, value) => {
      const updated = [...characters];
      updated[index][field] = value;
      setCharacters(updated);
    };

    const removeCharacter = (index) => {
      if (characters.length > 1) {
        setCharacters(characters.filter((_, i) => i !== index));
      }
    };

    const handleSubmit = () => {
      if (!description.trim()) return;
      const validCharacters = characters.filter(c => c.name.trim());
      addEntry(currentBook.id, {
        description: description.trim(),
        characters: validCharacters,
      });
    };

    return (
      <div style={styles.modal} onClick={() => setShowAddEntry(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={styles.modalTitle}>New Log Entry</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>What happened? *</label>
            <textarea
              style={styles.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the events you just read..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>New Characters (optional)</label>
            {characters.map((char, idx) => (
              <div key={idx} style={{ marginBottom: '10px', padding: '12px', background: t.surfaceAlt, borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    style={{ ...styles.input, flex: 1 }}
                    value={char.name}
                    onChange={e => updateCharacter(idx, 'name', e.target.value)}
                    placeholder="Character name"
                  />
                  {characters.length > 1 && (
                    <button
                      style={{ ...styles.btn('danger'), padding: '8px 12px' }}
                      onClick={() => removeCharacter(idx)}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  style={styles.input}
                  value={char.description}
                  onChange={e => updateCharacter(idx, 'description', e.target.value)}
                  placeholder="Brief description"
                />
              </div>
            ))}
            <button
              style={{ ...styles.btn('secondary'), width: '100%', marginTop: '8px' }}
              onClick={addCharacterField}
            >
              + Add Another Character
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button style={{ ...styles.btn('secondary'), flex: 1 }} onClick={() => setShowAddEntry(false)}>
              Cancel
            </button>
            <button style={{ ...styles.btn('primary'), flex: 1 }} onClick={handleSubmit}>
              Save Entry
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Book Detail View
  const BookDetail = () => {
    const book = currentBook;
    const allCharacters = book.entries.flatMap(e => e.characters || []).filter(c => c.name);
    const uniqueCharacters = allCharacters.reduce((acc, char) => {
      if (!acc.find(c => c.name.toLowerCase() === char.name.toLowerCase())) {
        acc.push(char);
      }
      return acc;
    }, []);

    return (
      <div>
        <button style={styles.backBtn} onClick={() => setCurrentBook(null)}>
          <ArrowLeft /> Back
        </button>

        <div style={{ ...styles.card, marginTop: '16px' }}>
          <div style={styles.bookCard}>
            {book.cover ? (
              <img src={book.cover} alt={book.title} style={styles.bookCover} />
            ) : (
              <div style={{ ...styles.bookCover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                📖
              </div>
            )}
            <div style={styles.bookInfo}>
              <h2 style={{ ...styles.bookTitle, fontSize: '1.3rem' }}>{book.title}</h2>
              {book.author && <p style={styles.bookAuthor}>by {book.author}</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span style={{ ...styles.badge, background: book.status === 'reading' ? t.accent : t.success }}>
                  {book.status === 'reading' ? 'Currently Reading' : 'Finished'}
                </span>
                <span style={{ ...styles.badge, background: t.surfaceAlt, color: t.textMuted }}>
                  {book.entries.length} entries
                </span>
              </div>
            </div>
          </div>

          {book.status === 'reading' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={{ ...styles.btn('primary'), flex: 1 }} onClick={() => setShowAddEntry(true)}>
                + Add Entry
              </button>
              <button style={{ ...styles.btn('secondary'), flex: 1 }} onClick={() => markAsFinished(book.id)}>
                Mark Finished
              </button>
            </div>
          )}
        </div>

        {uniqueCharacters.length > 0 && (
          <div style={styles.card}>
            <h3 style={{ fontFamily: fonts.heading, fontSize: '1.1rem', margin: '0 0 12px 0' }}>
              Characters ({uniqueCharacters.length})
            </h3>
            {uniqueCharacters.map((char, idx) => (
              <div key={idx} style={styles.character}>
                <div style={styles.characterName}>{char.name}</div>
                {char.description && <div style={styles.characterDesc}>{char.description}</div>}
              </div>
            ))}
          </div>
        )}

        <h3 style={{ fontFamily: fonts.heading, fontSize: '1.1rem', margin: '20px 0 12px 0' }}>
          Reading Log
        </h3>

        {book.entries.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No entries yet. Start logging your reading!</p>
          </div>
        ) : (
          book.entries.map(entry => (
            <div key={entry.id} style={styles.entry}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={styles.entryDate}>{formatDate(entry.date)}</div>
                <button
                  style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '4px' }}
                  onClick={() => deleteEntry(book.id, entry.id)}
                >
                  <TrashIcon />
                </button>
              </div>
              <div style={styles.entryText}>{entry.description}</div>
              {entry.characters?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: t.textMuted, marginBottom: '6px' }}>New Characters:</div>
                  {entry.characters.map((char, idx) => (
                    <div key={idx} style={styles.character}>
                      <span style={styles.characterName}>{char.name}</span>
                      {char.description && <span style={styles.characterDesc}> — {char.description}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        <button
          style={{ ...styles.btn('danger'), width: '100%', marginTop: '20px' }}
          onClick={() => deleteBook(book.id)}
        >
          Delete Book
        </button>
      </div>
    );
  };

  // Current Books Tab
  const CurrentTab = () => (
    <div>
      {currentBooks.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
          <p>No books currently being read.</p>
          <p style={{ fontSize: '0.9rem' }}>Tap the + button to add your first book!</p>
        </div>
      ) : (
        currentBooks.map(book => (
          <div key={book.id} style={styles.card} onClick={() => setCurrentBook(book)}>
            <div style={styles.bookCard}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} style={styles.bookCover} />
              ) : (
                <div style={{ ...styles.bookCover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                  📖
                </div>
              )}
              <div style={styles.bookInfo}>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                {book.author && <p style={styles.bookAuthor}>by {book.author}</p>}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={styles.badge}>{book.entries.length} entries</span>
                  <span style={{ fontSize: '0.8rem', color: t.textMuted }}>
                    Started {formatDate(book.startDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // History Tab
  const HistoryTab = () => (
    <div>
      <div style={{ ...styles.card, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '130px' }}>
          <label style={styles.label}>From</label>
          <input
            type="date"
            style={styles.input}
            value={dateRange.start}
            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div style={{ flex: 1, minWidth: '130px' }}>
          <label style={styles.label}>To</label>
          <input
            type="date"
            style={styles.input}
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
        {(dateRange.start || dateRange.end) && (
          <button
            style={{ ...styles.btn('secondary'), alignSelf: 'flex-end' }}
            onClick={() => setDateRange({ start: '', end: '' })}
          >
            Clear
          </button>
        )}
      </div>

      <h3 style={{ fontFamily: fonts.heading, fontSize: '1rem', margin: '16px 0 12px 0', color: t.textMuted }}>
        {finishedBooks.length} book{finishedBooks.length !== 1 ? 's' : ''} finished
      </h3>

      {finishedBooks.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No finished books in this date range.</p>
        </div>
      ) : (
        finishedBooks.map(book => (
          <div key={book.id} style={styles.card} onClick={() => setCurrentBook(book)}>
            <div style={styles.bookCard}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} style={styles.bookCover} />
              ) : (
                <div style={{ ...styles.bookCover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                  📖
                </div>
              )}
              <div style={styles.bookInfo}>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                {book.author && <p style={styles.bookAuthor}>by {book.author}</p>}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ ...styles.badge, background: t.success }}>Finished</span>
                  <span style={{ fontSize: '0.8rem', color: t.textMuted }}>
                    {formatDate(book.finishDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Settings Tab
  const SettingsTab = () => (
    <div>
      <div style={styles.card}>
        <h3 style={{ fontFamily: fonts.heading, fontSize: '1.1rem', margin: '0 0 16px 0' }}>Theme</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(THEMES).map(([key, value]) => (
            <button
              key={key}
              style={{ ...styles.themeBtn(theme === key), background: value.accent }}
              onClick={() => setTheme(key)}
              title={value.name}
            />
          ))}
        </div>
        <p style={{ marginTop: '12px', color: t.textMuted, fontSize: '0.9rem' }}>
          Current: {THEMES[theme].name}
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={{ fontFamily: fonts.heading, fontSize: '1.1rem', margin: '0 0 8px 0' }}>Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div style={{ textAlign: 'center', padding: '16px', background: t.surfaceAlt, borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: t.accent }}>{currentBooks.length}</div>
            <div style={{ fontSize: '0.85rem', color: t.textMuted }}>Reading</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: t.surfaceAlt, borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: t.success }}>{books.filter(b => b.status === 'finished').length}</div>
            <div style={{ fontSize: '0.85rem', color: t.textMuted }}>Finished</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: t.surfaceAlt, borderRadius: '8px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: t.accentLight }}>{books.reduce((sum, b) => sum + b.entries.length, 0)}</div>
            <div style={{ fontSize: '0.85rem', color: t.textMuted }}>Total Entries</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ fontFamily: fonts.heading, fontSize: '1.1rem', margin: '0 0 12px 0' }}>About</h3>
        <p style={{ color: t.textMuted, fontSize: '0.9rem', lineHeight: 1.6 }}>
          Reading Log helps you track your reading journey. Log events, characters, and thoughts as you progress through each book.
        </p>
        <p style={{ color: t.textMuted, fontSize: '0.85rem', marginTop: '12px' }}>
          Data is saved locally on your device.
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Crimson+Text:wght@400;600&family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500&family=Bitter:wght@500;600&family=Source+Sans+3:wght@400;500&family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;500&family=DM+Serif+Display&family=Nunito:wght@400;500;600&display=swap" rel="stylesheet" />

      <header style={styles.header}>
        <h1 style={styles.title}>
          <BookIcon />
          Reading Log
        </h1>
      </header>

      <main style={styles.content}>
        {currentBook ? (
          <BookDetail />
        ) : (
          <>
            {tab === 'current' && <CurrentTab />}
            {tab === 'history' && <HistoryTab />}
            {tab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>

      {!currentBook && tab === 'current' && (
        <button style={styles.fab} onClick={() => setShowAddBook(true)}>
          <PlusIcon />
        </button>
      )}

      <nav style={styles.nav}>
        <button style={styles.navBtn(tab === 'current')} onClick={() => { setTab('current'); setCurrentBook(null); }}>
          <BookIcon />
          Reading
        </button>
        <button style={styles.navBtn(tab === 'history')} onClick={() => { setTab('history'); setCurrentBook(null); }}>
          <HistoryIcon />
          History
        </button>
        <button style={styles.navBtn(tab === 'settings')} onClick={() => { setTab('settings'); setCurrentBook(null); }}>
          <SettingsIcon />
          Settings
        </button>
      </nav>

      {showAddBook && <AddBookModal />}
      {showAddEntry && <AddEntryModal />}
    </div>
  );
}
