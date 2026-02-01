// Core Types for Pomodoro App

export type TimerState = 'idle' | 'focus' | 'break' | 'paused';
export type BreakType = 'short' | 'long';

export interface Session {
  id: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // ISO timestamp
  endTime?: string;       // ISO timestamp
  duration: number;       // planned minutes
  actualDuration?: number; // actual minutes (if extended)
  type: 'focus' | 'break';
  breakType?: BreakType;
  completed: boolean;
  forfeitReason?: string;
  extended?: number;      // extra minutes added
}

export interface DailyStats {
  date: string;           // YYYY-MM-DD
  successfulSessions: number;
}

export interface Settings {
  focusDuration: number;      // default: 25
  shortBreakDuration: number; // default: 5
  longBreakDuration: number;  // default: 15
  sessionsUntilLongBreak: number; // default: 4
  soundEnabled: boolean;
  autoLockOnBreak: boolean;
}

export interface AppData {
  sessions: Session[];
  settings: Settings;
  completedTodayCount: number;
  lastResetDate: string;  // YYYY-MM-DD
}

export interface TimerStatus {
  state: TimerState;
  remainingSeconds: number;
  totalSeconds: number;
  currentSession: Session | null;
  completedToday: number;
  breakType?: BreakType;
}

export const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  autoLockOnBreak: false,
};
