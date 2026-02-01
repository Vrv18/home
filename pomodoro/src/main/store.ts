// Persistence layer using electron-store

import Store from 'electron-store';
import { AppData, Session, Settings, DailyStats, DEFAULT_SETTINGS } from './types';

const store = new Store<AppData>({
  defaults: {
    sessions: [],
    settings: DEFAULT_SETTINGS,
    completedTodayCount: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
  },
});

// Get today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Check and reset daily counter if needed
function checkDailyReset(): void {
  const today = getToday();
  const lastReset = store.get('lastResetDate');
  
  if (lastReset !== today) {
    store.set('completedTodayCount', 0);
    store.set('lastResetDate', today);
  }
}

// Sessions
export function saveSession(session: Session): void {
  const sessions = store.get('sessions');
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  store.set('sessions', sessions);
  
  // Update today's count if completed focus session
  if (session.completed && session.type === 'focus') {
    checkDailyReset();
    const currentCount = store.get('completedTodayCount');
    store.set('completedTodayCount', currentCount + 1);
  }
}

export function getCompletedToday(): number {
  checkDailyReset();
  return store.get('completedTodayCount');
}

export function getLast7DaysStats(): DailyStats[] {
  const sessions = store.get('sessions');
  const stats: DailyStats[] = [];
  
  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const successfulSessions = sessions.filter(
      s => s.date === dateStr && s.type === 'focus' && s.completed
    ).length;
    
    stats.push({ date: dateStr, successfulSessions });
  }
  
  return stats;
}

// Settings
export function getSettings(): Settings {
  return store.get('settings');
}

export function updateSettings(settings: Partial<Settings>): Settings {
  const current = store.get('settings');
  const updated = { ...current, ...settings };
  store.set('settings', updated);
  return updated;
}

// Generate unique session ID
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
