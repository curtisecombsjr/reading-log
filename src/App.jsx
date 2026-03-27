import React, { useState, useEffect, useRef } from 'react';

const THEMES = {
  void: {
    name: 'Void',
    bg: '#0a0a0f',
    surface: '#0e0e1a',
    surfaceAlt: '#161620',
    text: '#e2e8f0',
    textMuted: '#666',
    accent: '#a78bfa',
    accentDim: '#4c1d95',
    border: '#1e1e2e',
    borderSubtle: '#111',
    danger: '#ef4444',
    success: '#22c55e',
    isLight: false,
    fontDisplay: "'Orbitron', sans-serif",
    fontBody: "'Share Tech Mono', monospace",
  },
  ember: {
    name: 'Ember',
    bg: '#0f0a08',
    surface: '#1a100a',
    surfaceAlt: '#180e08',
    text: '#fde8d0',
    textMuted: '#6a4030',
    accent: '#fb923c',
    accentDim: '#7c2d12',
    border: '#2e1a0e',
    borderSubtle: '#1a0e08',
    danger: '#ef4444',
    success: '#22c55e',
    isLight: false,
    fontDisplay: "'Bebas Neue', sans-serif",
    fontBody: "'DM Mono', monospace",
  },
  arctic: {
    name: 'Arctic',
    bg: '#08100f',
    surface: '#0d1a18',
    surfaceAlt: '#0a1614',
    text: '#d0f0ec',
    textMuted: '#305050',
    accent: '#2dd4bf',
    accentDim: '#0d4a42',
    border: '#1a2e2a',
    borderSubtle: '#111f1d',
    danger: '#ef4444',
    success: '#22c55e',
    isLight: false,
    fontDisplay: "'Exo 2', sans-serif",
    fontBody: "'Fira Code', monospace",
  },
  steel: {
    name: 'Steel',
    bg: '#0a0c10',
    surface: '#10141c',
    surfaceAlt: '#0d1018',
    text: '#dce8f8',
    textMuted: '#3a5070',
    accent: '#60a5fa',
    accentDim: '#1e3a6e',
    border: '#1e2430',
    borderSubtle: '#141820',
    danger: '#ef4444',
    success: '#22c55e',
    isLight: false,
    fontDisplay: "'Rajdhani', sans-serif",
    fontBody: "'JetBrains Mono', monospace",
  },
  rose: {
    name: 'Rose',
    bg: '#100a0d',
    surface: '#1a0d12',
    surfaceAlt: '#160a0f',
    text: '#f8d8e8',
    textMuted: '#5a2a3a',
    accent: '#f472b6',
    accentDim: '#6d1a3a',
    border: '#2e1220',
    borderSubtle: '#1a0d14',
    danger: '#ef4444',
    success: '#22c55e',
    isLight: false,
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Courier Prime', monospace",
  },
  light: {
    name: 'Light',
    bg: '#f4f1ec',
    surface: '#fffefa',
    surfaceAlt: '#edeae4',
    text: '#1a1714',
    textMuted: '#6b6560',
    accent: '#5046e5',
    accentDim: '#e8e6fc',
    border: '#d4cfc7',
    borderSubtle: '#e8e4dd',
    danger: '#dc2626',
    success: '#16a34a',
    isLight: true,
    fontDisplay: "'Bebas Neue', sans-serif",
    fontBody: "'DM Mono', monospace",
  },
};

export default function ReadingLog() {
  const [theme, setTheme] = useState('light');
  const [books, setBooks] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [tab, setTab] = useState('current'); // current, history, goals, settings
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentTagFilter, setCurrentTagFilter] = useState(null);
  const [historyTagFilter, setHistoryTagFilter] = useState(null);
  
  // Default to showing books from last month
  const getLastMonthDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  };
  const [currentDateRange, setCurrentDateRange] = useState({ start: getLastMonthDate(), end: '' });
  
  const fileInputRef = useRef(null);
  const backupInputRef = useRef(null);
  const [restoreMsg, setRestoreMsg] = useState(null);

  const t = THEMES[theme];

  // Get all unique tags from all books
  const allTags = [...new Set(books.flatMap(b => b.tags || []))].sort();

  useEffect(() => {
    const saved = localStorage.getItem('readingLog');
    if (saved) {
      const data = JSON.parse(saved);
      setBooks(data.books || []);
      setChallenges(data.challenges || []);
      setTheme(data.theme || 'light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('readingLog', JSON.stringify({ books, challenges, theme }));
  }, [books, challenges, theme]);

  // Calculate reading streak
  const calculateStreak = () => {
    const allEntryDates = books
      .flatMap(b => b.entries || [])
      .map(e => new Date(e.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // unique dates
      .sort((a, b) => new Date(b) - new Date(a)); // newest first

    if (allEntryDates.length === 0) return { current: 0, longest: 0 };

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if streak is active (logged today or yesterday)
    const streakActive = allEntryDates[0] === today || allEntryDates[0] === yesterday;
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate streaks
    for (let i = 0; i < allEntryDates.length; i++) {
      const currentDate = new Date(allEntryDates[i]);
      const prevDate = i > 0 ? new Date(allEntryDates[i - 1]) : null;
      
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((prevDate - currentDate) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Current streak only counts if active
    if (streakActive) {
      currentStreak = tempStreak;
      // Recalculate from most recent
      currentStreak = 1;
      for (let i = 1; i < allEntryDates.length; i++) {
        const currentDate = new Date(allEntryDates[i]);
        const prevDate = new Date(allEntryDates[i - 1]);
        const diffDays = Math.round((prevDate - currentDate) / 86400000);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    return { current: currentStreak, longest: longestStreak };
  };

  const streak = calculateStreak();

  // Star Rating Component
  const StarRating = ({ rating, onRate, size = 24, readonly = false }) => {
    const [hover, setHover] = useState(0);
    
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRate && onRate(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: readonly ? 'default' : 'pointer',
              padding: '2px',
              fontSize: `${size}px`,
              lineHeight: 1,
              color: (hover || rating) >= star ? '#f59e0b' : t.border,
              transition: 'color 0.15s, transform 0.15s',
              transform: !readonly && hover >= star ? 'scale(1.15)' : 'scale(1)',
            }}
            disabled={readonly}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // Tag Input Component
  const TagInput = ({ tags, onTagsChange, existingTags = [] }) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = existingTags
      .filter(tag => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 5);

    const addTag = (tag) => {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        onTagsChange([...tags, trimmed]);
      }
      setInputValue('');
      setShowSuggestions(false);
    };

    const removeTag = (tagToRemove) => {
      onTagsChange(tags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    };

    return (
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: tags.length > 0 ? '8px' : 0 }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: t.accentDim,
                color: t.accent,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: t.accent,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                  lineHeight: 1,
                  opacity: 0.7,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            style={styles.input}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter to add tag"
          />
          {showSuggestions && suggestions.length > 0 && inputValue && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: '4px',
              marginTop: '4px',
              zIndex: 10,
              overflow: 'hidden',
            }}>
              {suggestions.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: t.text,
                    fontSize: '0.85rem',
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const addBook = (book) => {
    const newBook = {
      id: Date.now(),
      ...book,
      entries: [],
      tags: book.tags || [],
      status: book.status || 'reading',
      rating: book.rating || null,
      startDate: new Date().toISOString(),
      finishDate: book.status === 'finished' ? new Date().toISOString() : null,
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

  // Challenge functions
  const addChallenge = (challenge) => {
    const newChallenge = {
      id: Date.now(),
      ...challenge,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setChallenges([newChallenge, ...challenges]);
    setShowAddChallenge(false);
  };

  const toggleChallenge = (challengeId) => {
    setChallenges(challenges.map(c => {
      if (c.id === challengeId) {
        return { 
          ...c, 
          completed: !c.completed,
          completedAt: !c.completed ? new Date().toISOString() : null,
        };
      }
      return c;
    }));
  };

  const deleteChallenge = (challengeId) => {
    setChallenges(challenges.filter(c => c.id !== challengeId));
  };

  const saveBackup = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      theme,
      books,
      challenges,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-log-backup-${new Date().toISOString().split('T')[0]}.rlbak`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        
        if (!data.books || !Array.isArray(data.books)) {
          setRestoreMsg({ type: 'error', text: 'Invalid backup file format' });
          return;
        }
        
        // Merge books - avoid duplicates by ID
        const existingBookIds = new Set(books.map(b => b.id));
        const newBooks = data.books.filter(b => !existingBookIds.has(b.id));
        const mergedBooks = [...books, ...newBooks];
        
        // Merge challenges - avoid duplicates by ID
        const existingChallengeIds = new Set(challenges.map(c => c.id));
        const newChallenges = (data.challenges || []).filter(c => !existingChallengeIds.has(c.id));
        const mergedChallenges = [...challenges, ...newChallenges];
        
        setBooks(mergedBooks);
        setChallenges(mergedChallenges);
        if (data.theme && THEMES[data.theme]) {
          setTheme(data.theme);
        }
        
        const restoredItems = [];
        if (newBooks.length > 0) restoredItems.push(`${newBooks.length} book${newBooks.length !== 1 ? 's' : ''}`);
        if (newChallenges.length > 0) restoredItems.push(`${newChallenges.length} challenge${newChallenges.length !== 1 ? 's' : ''}`);
        
        setRestoreMsg({ 
          type: 'success', 
          text: restoredItems.length > 0 
            ? `Restored ${restoredItems.join(' and ')}` 
            : 'No new data to restore (all already exist)'
        });
        
        setTimeout(() => setRestoreMsg(null), 4000);
      } catch (err) {
        setRestoreMsg({ type: 'error', text: 'Failed to parse backup file' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentBooks = books.filter(b => {
    if (b.status !== 'reading') return false;
    if (currentDateRange.start && new Date(b.startDate) < new Date(currentDateRange.start)) return false;
    if (currentDateRange.end && new Date(b.startDate) > new Date(currentDateRange.end + 'T23:59:59')) return false;
    if (currentTagFilter && !(b.tags || []).includes(currentTagFilter)) return false;
    return true;
  });
  
  const allCurrentBooks = books.filter(b => b.status === 'reading');
  const finishedBooks = books.filter(b => {
    if (b.status !== 'finished') return false;
    if (dateRange.start && new Date(b.finishDate) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(b.finishDate) > new Date(dateRange.end + 'T23:59:59')) return false;
    if (historyTagFilter && !(b.tags || []).includes(historyTagFilter)) return false;
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
      fontFamily: t.fontBody,
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
      fontFamily: t.fontDisplay,
      fontSize: '1.5rem',
      fontWeight: 700,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
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
      fontFamily: t.fontBody,
      fontSize: '0.7rem',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      transition: 'color 0.2s',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }),
    content: {
      padding: '16px',
    },
    card: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
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
      borderRadius: '4px',
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
      fontFamily: t.fontDisplay,
      fontSize: '1.1rem',
      fontWeight: 600,
      margin: '0 0 4px 0',
      lineHeight: 1.3,
      letterSpacing: '0.04em',
    },
    bookAuthor: {
      color: t.textMuted,
      fontSize: '0.85rem',
      margin: '0 0 8px 0',
    },
    badge: {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: 500,
      background: t.accentDim,
      color: t.accent,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    btn: (variant = 'primary') => ({
      padding: '11px 18px',
      borderRadius: '6px',
      border: 'none',
      fontFamily: t.fontBody,
      fontSize: '0.85rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      ...(variant === 'primary' && { background: t.accent, color: t.isLight ? '#fff' : t.bg }),
      ...(variant === 'secondary' && { background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }),
      ...(variant === 'danger' && { background: 'transparent', color: t.danger, border: `1px solid ${t.danger}` }),
    }),
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '6px',
      border: `1px solid ${t.border}`,
      background: t.surfaceAlt,
      color: t.text,
      fontFamily: t.fontBody,
      fontSize: '0.95rem',
      outline: 'none',
      boxSizing: 'border-box',
      colorScheme: t.isLight ? 'light' : 'dark',
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '6px',
      border: `1px solid ${t.border}`,
      background: t.surfaceAlt,
      color: t.text,
      fontFamily: t.fontBody,
      fontSize: '0.95rem',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px',
      boxSizing: 'border-box',
      colorScheme: t.isLight ? 'light' : 'dark',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: 500,
      color: t.textMuted,
      fontSize: '0.75rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
    formGroup: {
      marginBottom: '16px',
    },
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 200,
    },
    modalContent: {
      background: t.surface,
      borderRadius: '10px 10px 0 0',
      padding: '24px 20px',
      width: '100%',
      maxWidth: '480px',
      maxHeight: '85vh',
      overflowY: 'auto',
      border: `1px solid ${t.border}`,
      borderBottom: 'none',
    },
    modalTitle: {
      fontFamily: t.fontDisplay,
      fontSize: '1.3rem',
      fontWeight: 600,
      margin: '0 0 20px 0',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    entry: {
      background: t.surfaceAlt,
      borderRadius: '6px',
      padding: '14px',
      marginBottom: '10px',
      border: `1px solid ${t.borderSubtle}`,
    },
    entryDate: {
      fontSize: '0.75rem',
      color: t.textMuted,
      marginBottom: '8px',
      letterSpacing: '0.08em',
    },
    entryText: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
      marginBottom: '10px',
    },
    character: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: '4px',
      padding: '8px 10px',
      marginTop: '6px',
    },
    characterName: {
      fontWeight: 600,
      fontSize: '0.85rem',
      color: t.accent,
    },
    characterDesc: {
      fontSize: '0.8rem',
      color: t.textMuted,
      marginTop: '2px',
    },
    fab: {
      position: 'fixed',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '52px',
      height: '52px',
      borderRadius: '8px',
      background: t.accent,
      color: t.isLight ? '#fff' : t.bg,
      border: 'none',
      fontSize: '1.6rem',
      cursor: 'pointer',
      boxShadow: `0 4px 16px ${t.accent}44`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: t.accent,
      fontSize: '0.85rem',
      cursor: 'pointer',
      padding: '0',
      fontFamily: t.fontBody,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    themeBtn: (active) => ({
      width: '36px',
      height: '36px',
      borderRadius: '6px',
      border: active ? `3px solid ${t.text}` : `2px solid ${t.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: t.textMuted,
      letterSpacing: '0.1em',
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

  const GoalsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
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
    const [tags, setTags] = useState([]);
    const [rating, setRating] = useState(null);
    const [alreadyRead, setAlreadyRead] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [searchSource, setSearchSource] = useState('all'); // 'all', 'openlib', 'google'
    const searchTimeout = useRef(null);

    // Open Library search
    const searchOpenLibrary = async (query) => {
      try {
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6&fields=key,title,author_name,first_publish_year,cover_i`
        );
        if (!response.ok) return [];
        const data = await response.json();
        return (data.docs || [])
          .filter(doc => doc.title)
          .slice(0, 6)
          .map(doc => ({
            id: `ol-${doc.key || Math.random().toString(36).slice(2)}`,
            title: doc.title,
            author: doc.author_name?.join(', ') || 'Unknown Author',
            cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
            year: doc.first_publish_year ? String(doc.first_publish_year) : '',
            source: 'Open Library',
          }));
      } catch (e) {
        console.error('Open Library search failed:', e);
        return [];
      }
    };

    // Google Books search
    const searchGoogleBooks = async (query) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&printType=all`
        );
        if (!response.ok) return [];
        const data = await response.json();
        return (data.items || [])
          .filter(item => item.volumeInfo?.title)
          .slice(0, 6)
          .map(item => {
            const info = item.volumeInfo;
            return {
              id: `gb-${item.id}`,
              title: info.title + (info.subtitle ? `: ${info.subtitle}` : ''),
              author: info.authors?.join(', ') || 'Unknown Author',
              cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
              year: info.publishedDate ? info.publishedDate.slice(0, 4) : '',
              source: 'Google Books',
            };
          });
      } catch (e) {
        console.error('Google Books search failed:', e);
        return [];
      }
    };

    const searchBooks = async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        setSearchError(false);
        return;
      }
      
      setIsSearching(true);
      setSearchError(false);
      
      try {
        let results = [];
        
        if (searchSource === 'all') {
          // Search both in parallel
          const [olResults, gbResults] = await Promise.all([
            searchOpenLibrary(query),
            searchGoogleBooks(query),
          ]);
          // Interleave results for variety
          const maxLen = Math.max(olResults.length, gbResults.length);
          for (let i = 0; i < maxLen; i++) {
            if (gbResults[i]) results.push(gbResults[i]);
            if (olResults[i]) results.push(olResults[i]);
          }
          results = results.slice(0, 8);
        } else if (searchSource === 'openlib') {
          results = await searchOpenLibrary(query);
        } else if (searchSource === 'google') {
          results = await searchGoogleBooks(query);
        }
        
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError(false); // No results isn't an error
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setSearchError(true);
      }
      setIsSearching(false);
    };

    const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setSearchError(false);
      
      // Debounce search
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => searchBooks(query), 500);
    };

    // Re-search when source changes
    const handleSourceChange = (newSource) => {
      setSearchSource(newSource);
      if (searchQuery.length >= 2) {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
          // Need to call with the new source directly since state won't update immediately
          setIsSearching(true);
          (async () => {
            let results = [];
            if (newSource === 'all') {
              const [olResults, gbResults] = await Promise.all([
                searchOpenLibrary(searchQuery),
                searchGoogleBooks(searchQuery),
              ]);
              const maxLen = Math.max(olResults.length, gbResults.length);
              for (let i = 0; i < maxLen; i++) {
                if (gbResults[i]) results.push(gbResults[i]);
                if (olResults[i]) results.push(olResults[i]);
              }
              results = results.slice(0, 8);
            } else if (newSource === 'openlib') {
              results = await searchOpenLibrary(searchQuery);
            } else if (newSource === 'google') {
              results = await searchGoogleBooks(searchQuery);
            }
            setSearchResults(results);
            setIsSearching(false);
          })();
        }, 100);
      }
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
      addBook({ 
        title: title.trim(), 
        author: author.trim(), 
        cover,
        tags,
        rating: rating,
        status: alreadyRead ? 'finished' : 'reading',
      });
    };

    const resetForm = () => {
      setTitle('');
      setAuthor('');
      setCover('');
      setTags([]);
      setRating(null);
      setAlreadyRead(false);
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(false);
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
                
                {/* Source Selector */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {[
                    { key: 'all', label: 'All Sources' },
                    { key: 'google', label: 'Google Books' },
                    { key: 'openlib', label: 'Open Library' },
                  ].map(src => (
                    <button
                      key={src.key}
                      type="button"
                      onClick={() => handleSourceChange(src.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: searchSource === src.key ? t.accent : t.surfaceAlt,
                        color: searchSource === src.key ? (t.isLight ? '#fff' : t.bg) : t.text,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: searchSource === src.key ? 600 : 400,
                      }}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>

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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          {book.year && (
                            <span style={{ color: t.textMuted, fontSize: '0.75rem' }}>
                              {book.year}
                            </span>
                          )}
                          {book.source && (
                            <span style={{ 
                              fontSize: '0.65rem', 
                              padding: '2px 6px', 
                              background: t.accentDim, 
                              color: t.accent,
                              borderRadius: '3px',
                            }}>
                              {book.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && !searchError && (
                <div style={{ textAlign: 'center', padding: '20px', color: t.textMuted, fontSize: '0.85rem' }}>
                  No books found. Try a different search or add manually.
                </div>
              )}

              {!isSearching && searchError && (
                <div style={{ textAlign: 'center', padding: '20px', color: t.danger, fontSize: '0.85rem' }}>
                  Search failed. Check your connection or add manually.
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

              <div style={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={alreadyRead}
                    onChange={e => setAlreadyRead(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: t.accent }}
                  />
                  <span style={{ fontSize: '0.9rem', color: t.text }}>I've already read this book</span>
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Rating (optional)</label>
                <StarRating rating={rating} onRate={setRating} size={28} />
                {rating && (
                  <button
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: t.textMuted, 
                      fontSize: '0.75rem', 
                      cursor: 'pointer',
                      marginTop: '6px',
                      padding: 0,
                    }}
                    onClick={() => setRating(null)}
                  >
                    Clear rating
                  </button>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tags (optional)</label>
                <TagInput tags={tags} onTagsChange={setTags} existingTags={allTags} />
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
    const [majorEvents, setMajorEvents] = useState(['']);
    const [characters, setCharacters] = useState([{ name: '', description: '' }]);

    const addMajorEventField = () => {
      setMajorEvents([...majorEvents, '']);
    };

    const updateMajorEvent = (index, value) => {
      const updated = [...majorEvents];
      updated[index] = value;
      setMajorEvents(updated);
    };

    const removeMajorEvent = (index) => {
      if (majorEvents.length > 1) {
        setMajorEvents(majorEvents.filter((_, i) => i !== index));
      }
    };

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
      const validMajorEvents = majorEvents.filter(e => e.trim());
      addEntry(currentBook.id, {
        description: description.trim(),
        majorEvents: validMajorEvents,
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
            <label style={styles.label}>Major Events (optional)</label>
            {majorEvents.map((event, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  style={{ ...styles.input, flex: 1 }}
                  value={event}
                  onChange={e => updateMajorEvent(idx, e.target.value)}
                  placeholder="e.g., Battle at the bridge, Secret revealed..."
                />
                {majorEvents.length > 1 && (
                  <button
                    style={{ ...styles.btn('danger'), padding: '8px 12px' }}
                    onClick={() => removeMajorEvent(idx)}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
            <button
              style={{ ...styles.btn('secondary'), width: '100%', marginTop: '4px', padding: '8px' }}
              onClick={addMajorEventField}
            >
              + Add Another Event
            </button>
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
    const [localSummary, setLocalSummary] = useState(book?.summary || '');
    
    // Sync local state when book changes
    useEffect(() => {
      setLocalSummary(book?.summary || '');
    }, [book?.id, book?.summary]);

    if (!book) return null;
    
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
              <h2 style={{ ...styles.bookTitle, fontSize: '1.2rem' }}>{book.title}</h2>
              {book.author && <p style={styles.bookAuthor}>by {book.author}</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span style={{ ...styles.badge, background: book.status === 'reading' ? t.accentDim : `${t.success}22`, color: book.status === 'reading' ? t.accent : t.success }}>
                  {book.status === 'reading' ? 'Reading' : 'Finished'}
                </span>
                <span style={{ ...styles.badge, background: t.surfaceAlt, color: t.textMuted, border: `1px solid ${t.borderSubtle}` }}>
                  {book.entries.length} entries
                </span>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div style={{ marginTop: '16px', padding: '12px', background: t.surfaceAlt, borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Rating</span>
              {book.rating && (
                <button
                  style={{ background: 'none', border: 'none', color: t.textMuted, fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                  onClick={() => updateBook(book.id, { rating: null })}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{ marginTop: '8px' }}>
              <StarRating 
                rating={book.rating} 
                onRate={(r) => updateBook(book.id, { rating: r })} 
                size={26} 
              />
            </div>
          </div>

          {/* Personal Summary Section */}
          <div style={{ marginTop: '12px', padding: '12px', background: t.surfaceAlt, borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Personal Summary</span>
            </div>
            <textarea
              style={{ 
                ...styles.textarea, 
                minHeight: '80px',
                background: t.surface,
              }}
              value={localSummary}
              onChange={e => setLocalSummary(e.target.value)}
              onBlur={() => updateBook(book.id, { summary: localSummary })}
              placeholder="Write your personal summary or thoughts about this book..."
            />
          </div>

          {/* Tags Section */}
          <div style={{ marginTop: '12px', padding: '12px', background: t.surfaceAlt, borderRadius: '6px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tags</span>
            </div>
            <TagInput 
              tags={book.tags || []} 
              onTagsChange={(newTags) => updateBook(book.id, { tags: newTags })} 
              existingTags={allTags}
            />
          </div>

          {book.status === 'reading' ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={{ ...styles.btn('primary'), flex: 1 }} onClick={() => setShowAddEntry(true)}>
                + Add Entry
              </button>
              <button style={{ ...styles.btn('secondary'), flex: 1 }} onClick={() => markAsFinished(book.id)}>
                Mark Finished
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <button 
                style={{ ...styles.btn('secondary'), width: '100%' }} 
                onClick={() => updateBook(book.id, { status: 'reading', finishDate: null })}
              >
                ↩ Reopen for Editing
              </button>
            </div>
          )}
        </div>

        {uniqueCharacters.length > 0 && (
          <div style={styles.card}>
            <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', margin: '0 0 12px 0', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted }}>
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

        <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', margin: '20px 0 12px 0', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted }}>
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
              {entry.majorEvents?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Major Events:</div>
                  {entry.majorEvents.map((event, idx) => (
                    <div key={idx} style={{ 
                      fontSize: '0.85rem', 
                      color: t.accent, 
                      padding: '4px 0',
                      borderLeft: `2px solid ${t.accent}`,
                      paddingLeft: '10px',
                      marginBottom: '4px',
                    }}>
                      {event}
                    </div>
                  ))}
                </div>
              )}
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
      {/* Date Filter */}
      <div style={{ ...styles.card, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '110px' }}>
          <label style={styles.label}>From</label>
          <input
            type="date"
            style={styles.input}
            value={currentDateRange.start}
            onChange={e => setCurrentDateRange({ ...currentDateRange, start: e.target.value })}
          />
        </div>
        <div style={{ flex: 1, minWidth: '110px' }}>
          <label style={styles.label}>To</label>
          <input
            type="date"
            style={styles.input}
            value={currentDateRange.end}
            onChange={e => setCurrentDateRange({ ...currentDateRange, end: e.target.value })}
          />
        </div>
        {(currentDateRange.start || currentDateRange.end) && (
          <button
            style={{ ...styles.btn('secondary'), padding: '10px 14px', fontSize: '0.75rem' }}
            onClick={() => setCurrentDateRange({ start: '', end: '' })}
          >
            All
          </button>
        )}
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0' }}>
          <span style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', alignSelf: 'center' }}>Filter:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setCurrentTagFilter(currentTagFilter === tag ? null : tag)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: currentTagFilter === tag ? t.accent : t.surfaceAlt,
                color: currentTagFilter === tag ? (t.isLight ? '#fff' : t.bg) : t.text,
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: currentTagFilter === tag ? 600 : 400,
              }}
            >
              #{tag}
            </button>
          ))}
          {currentTagFilter && (
            <button
              onClick={() => setCurrentTagFilter(null)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textMuted,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div style={{ fontSize: '0.75rem', color: t.textMuted, margin: '12px 0', letterSpacing: '0.08em' }}>
        {currentBooks.length} of {allCurrentBooks.length} book{allCurrentBooks.length !== 1 ? 's' : ''} shown
      </div>

      {currentBooks.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.5 }}>📚</div>
          {allCurrentBooks.length === 0 ? (
            <>
              <p style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No books currently being read</p>
              <p style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.7 }}>Tap + to add your first book</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No books in this date range</p>
              <p style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.7 }}>Try adjusting the filter or tap "All"</p>
            </>
          )}
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
                {book.rating && (
                  <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '4px' }}>
                    {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                  </div>
                )}
                {(book.tags || []).length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {book.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontSize: '0.65rem', color: t.accent, background: t.accentDim, padding: '2px 6px', borderRadius: '3px' }}>
                        #{tag}
                      </span>
                    ))}
                    {book.tags.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: t.textMuted }}>+{book.tags.length - 3}</span>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={styles.badge}>{book.entries.length} entries</span>
                  <span style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.06em' }}>
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

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0' }}>
          <span style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', alignSelf: 'center' }}>Filter:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setHistoryTagFilter(historyTagFilter === tag ? null : tag)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: historyTagFilter === tag ? t.accent : t.surfaceAlt,
                color: historyTagFilter === tag ? (t.isLight ? '#fff' : t.bg) : t.text,
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: historyTagFilter === tag ? 600 : 400,
              }}
            >
              #{tag}
            </button>
          ))}
          {historyTagFilter && (
            <button
              onClick={() => setHistoryTagFilter(null)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: `1px solid ${t.border}`,
                background: 'transparent',
                color: t.textMuted,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.8rem', margin: '16px 0 12px 0', color: t.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {finishedBooks.length} book{finishedBooks.length !== 1 ? 's' : ''} finished
      </h3>

      {finishedBooks.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No finished books in this range</p>
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
                {book.rating && (
                  <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '4px' }}>
                    {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                  </div>
                )}
                {(book.tags || []).length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {book.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontSize: '0.65rem', color: t.accent, background: t.accentDim, padding: '2px 6px', borderRadius: '3px' }}>
                        #{tag}
                      </span>
                    ))}
                    {book.tags.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: t.textMuted }}>+{book.tags.length - 3}</span>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateBook(book.id, { status: 'reading', finishDate: null });
                    }}
                    style={{ 
                      ...styles.badge, 
                      background: `${t.success}22`, 
                      color: t.success,
                      cursor: 'pointer',
                      border: 'none',
                      fontFamily: 'inherit',
                    }}
                    title="Click to reopen for editing"
                  >
                    Finished ↩
                  </button>
                  <span style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.06em' }}>
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

  // Add Challenge Modal
  const AddChallengeModal = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
      if (!title.trim()) return;
      addChallenge({
        title: title.trim(),
        description: description.trim(),
      });
    };

    return (
      <div style={styles.modal} onClick={() => setShowAddChallenge(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={styles.modalTitle}>New Challenge</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Challenge Title *</label>
            <input
              type="text"
              style={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Read 5 classics this year"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description (optional)</label>
            <textarea
              style={{ ...styles.textarea, minHeight: '70px' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details about your challenge..."
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button style={{ ...styles.btn('secondary'), flex: 1 }} onClick={() => setShowAddChallenge(false)}>
              Cancel
            </button>
            <button style={{ ...styles.btn('primary'), flex: 1 }} onClick={handleSubmit}>
              Add Challenge
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Goals Tab
  const GoalsTab = () => {
    const activeChallenges = challenges.filter(c => !c.completed);
    const completedChallenges = challenges.filter(c => c.completed);

    return (
      <div>
        {/* Reading Streak Card */}
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', margin: '0 0 8px 0', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted }}>
                Reading Streak
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontFamily: t.fontDisplay, fontSize: '2.5rem', fontWeight: 700, color: streak.current > 0 ? '#f59e0b' : t.textMuted }}>
                  {streak.current}
                </span>
                <span style={{ fontSize: '0.9rem', color: t.textMuted }}>
                  day{streak.current !== 1 ? 's' : ''}
                </span>
                {streak.current > 0 && (
                  <span style={{ fontSize: '1.5rem' }}>🔥</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Longest
              </div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: '1.5rem', fontWeight: 600, color: t.accent }}>
                {streak.longest}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: '12px' }}>
            {streak.current > 0 
              ? 'Keep it up! Log an entry today to continue your streak.'
              : 'Start a streak by logging a reading entry today!'}
          </p>
        </div>

        {/* Challenges Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 12px 0' }}>
          <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted, margin: 0 }}>
            Challenges
          </h3>
          <button 
            style={{ ...styles.btn('primary'), padding: '8px 14px', fontSize: '0.75rem' }}
            onClick={() => setShowAddChallenge(true)}
          >
            + New
          </button>
        </div>

        {challenges.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.5 }}>🎯</div>
            <p style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No challenges yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.7 }}>Create a reading challenge to stay motivated!</p>
          </div>
        ) : (
          <>
            {/* Active Challenges */}
            {activeChallenges.map(challenge => (
              <div key={challenge.id} style={{ ...styles.card, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <button
                  onClick={() => toggleChallenge(challenge.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: `2px solid ${t.border}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                  }}
                  title="Mark as complete"
                >
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{challenge.title}</div>
                  {challenge.description && (
                    <div style={{ fontSize: '0.8rem', color: t.textMuted, lineHeight: 1.5 }}>{challenge.description}</div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: '8px', letterSpacing: '0.06em' }}>
                    Created {formatDate(challenge.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => deleteChallenge(challenge.id)}
                  style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '4px', fontSize: '1rem' }}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <>
                <h4 style={{ fontFamily: t.fontDisplay, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.textMuted, margin: '24px 0 12px 0' }}>
                  Completed ({completedChallenges.length})
                </h4>
                {completedChallenges.map(challenge => (
                  <div key={challenge.id} style={{ ...styles.card, display: 'flex', gap: '12px', alignItems: 'flex-start', opacity: 0.7 }}>
                    <button
                      onClick={() => toggleChallenge(challenge.id)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: `2px solid ${t.success}`,
                        background: t.success,
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '2px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                      title="Mark as incomplete"
                    >
                      ✓
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px', textDecoration: 'line-through' }}>{challenge.title}</div>
                      {challenge.description && (
                        <div style={{ fontSize: '0.8rem', color: t.textMuted, lineHeight: 1.5 }}>{challenge.description}</div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: t.success, marginTop: '8px', letterSpacing: '0.06em' }}>
                        ✓ Completed {formatDate(challenge.completedAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChallenge(challenge.id)}
                      style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '4px', fontSize: '1rem' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // Settings Tab
  const SettingsTab = () => (
    <div>
      <div style={styles.card}>
        <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', margin: '0 0 16px 0', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted }}>Theme</h3>
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
        <p style={{ marginTop: '12px', color: t.textMuted, fontSize: '0.8rem', letterSpacing: '0.08em' }}>
          Current: {THEMES[theme].name}
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', margin: '0 0 16px 0', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted }}>Statistics</h3>
        
        {(() => {
          const finished = books.filter(b => b.status === 'finished');
          const now = new Date();
          const thisYear = now.getFullYear();
          const thisMonth = now.getMonth();
          
          const finishedThisYear = finished.filter(b => b.finishDate && new Date(b.finishDate).getFullYear() === thisYear);
          const finishedThisMonth = finished.filter(b => {
            if (!b.finishDate) return false;
            const d = new Date(b.finishDate);
            return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
          });
          
          const ratedBooks = books.filter(b => b.rating);
          const avgRating = ratedBooks.length > 0 
            ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
            : '—';
          
          // Rating distribution
          const ratingDist = [5, 4, 3, 2, 1].map(r => ({
            rating: r,
            count: books.filter(b => b.rating === r).length
          }));
          const maxRatingCount = Math.max(...ratingDist.map(r => r.count), 1);
          
          // Top tags
          const tagCounts = {};
          books.forEach(b => (b.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }));
          const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
          
          // Books per month this year
          const monthlyData = Array(12).fill(0);
          finishedThisYear.forEach(b => {
            if (b.finishDate) {
              const month = new Date(b.finishDate).getMonth();
              monthlyData[month]++;
            }
          });
          const maxMonthly = Math.max(...monthlyData, 1);
          const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
          
          const totalEntries = books.reduce((sum, b) => sum + b.entries.length, 0);
          
          return (
            <>
              {/* Primary Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', padding: '12px 8px', background: t.surfaceAlt, borderRadius: '6px' }}>
                  <div style={{ fontFamily: t.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: t.accent }}>{books.filter(b => b.status === 'reading').length}</div>
                  <div style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reading</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 8px', background: t.surfaceAlt, borderRadius: '6px' }}>
                  <div style={{ fontFamily: t.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: t.success }}>{finished.length}</div>
                  <div style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Finished</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 8px', background: t.surfaceAlt, borderRadius: '6px' }}>
                  <div style={{ fontFamily: t.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b' }}>{avgRating}</div>
                  <div style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Avg Rating</div>
                </div>
              </div>

              {/* This Year / This Month */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: t.surfaceAlt, borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>This Year</span>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: t.text }}>{finishedThisYear.length}</span>
                  </div>
                </div>
                <div style={{ padding: '12px', background: t.surfaceAlt, borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>This Month</span>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: t.text }}>{finishedThisMonth.length}</span>
                  </div>
                </div>
              </div>

              {/* Books Per Month Chart */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {thisYear} Reading Pace
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px' }}>
                  {monthlyData.map((count, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '100%',
                        height: `${Math.max((count / maxMonthly) * 48, count > 0 ? 6 : 2)}px`,
                        background: i <= thisMonth ? (count > 0 ? t.accent : t.border) : t.borderSubtle,
                        borderRadius: '2px',
                        transition: 'height 0.3s',
                      }} />
                      <span style={{ fontSize: '0.55rem', color: i === thisMonth ? t.accent : t.textMuted }}>{monthNames[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Distribution */}
              {ratedBooks.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Rating Distribution
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {ratingDist.map(({ rating, count }) => (
                      <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', width: '45px' }}>{'★'.repeat(rating)}</span>
                        <div style={{ flex: 1, height: '8px', background: t.surfaceAlt, borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${(count / maxRatingCount) * 100}%`,
                            height: '100%',
                            background: '#f59e0b',
                            borderRadius: '4px',
                            transition: 'width 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: t.textMuted, width: '20px', textAlign: 'right' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Tags */}
              {topTags.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Top Tags
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {topTags.map(([tag, count]) => (
                      <span key={tag} style={{
                        padding: '4px 10px',
                        background: t.accentDim,
                        color: t.accent,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}>
                        #{tag} <span style={{ opacity: 0.7 }}>({count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Entries */}
              <div style={{ textAlign: 'center', padding: '12px', background: t.surfaceAlt, borderRadius: '6px' }}>
                <span style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Log Entries: </span>
                <span style={{ fontFamily: t.fontDisplay, fontSize: '1rem', fontWeight: 600, color: t.text }}>{totalEntries}</span>
              </div>
            </>
          );
        })()}
      </div>

      <div style={styles.card}>
        <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', margin: '0 0 16px 0', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted }}>Backup & Restore</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: restoreMsg ? '12px' : '0' }}>
          <button
            onClick={saveBackup}
            style={{ 
              flex: 1, 
              padding: '11px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontFamily: t.fontBody,
              background: t.accent, 
              border: 'none', 
              color: t.isLight ? '#fff' : t.bg, 
              fontSize: '0.8rem', 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            ↓ Save Backup
          </button>
          <button
            onClick={() => backupInputRef.current?.click()}
            style={{ 
              flex: 1, 
              padding: '11px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontFamily: t.fontBody,
              background: 'transparent', 
              border: `1px solid ${t.border}`, 
              color: t.accent, 
              fontSize: '0.8rem', 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase',
            }}
          >
            ↑ Restore
          </button>
          <input 
            ref={backupInputRef} 
            type="file" 
            accept=".rlbak,.json" 
            onChange={restoreBackup} 
            style={{ display: 'none' }} 
          />
        </div>
        {restoreMsg && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: restoreMsg.type === 'error' ? t.danger : t.success, 
            letterSpacing: '0.04em',
            padding: '8px 0 0 0',
          }}>
            {restoreMsg.type === 'error' ? '⚠ ' : '✓ '}{restoreMsg.text}
          </div>
        )}
        <p style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: '12px', lineHeight: 1.5 }}>
          Downloads an <span style={{ color: t.text }}>.rlbak</span> file. Restore merges with existing data — no duplicates.
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={{ fontFamily: t.fontDisplay, fontSize: '0.85rem', margin: '0 0 12px 0', letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textMuted }}>About</h3>
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
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Share+Tech+Mono&family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Exo+2:wght@500;600&family=Fira+Code:wght@400;500&family=Rajdhani:wght@500;600&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@600;700&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />

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
            {tab === 'goals' && <GoalsTab />}
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
        <button style={styles.navBtn(tab === 'goals')} onClick={() => { setTab('goals'); setCurrentBook(null); }}>
          <GoalsIcon />
          Goals
        </button>
        <button style={styles.navBtn(tab === 'settings')} onClick={() => { setTab('settings'); setCurrentBook(null); }}>
          <SettingsIcon />
          Settings
        </button>
      </nav>

      {showAddBook && <AddBookModal />}
      {showAddEntry && <AddEntryModal />}
      {showAddChallenge && <AddChallengeModal />}
    </div>
  );
}
