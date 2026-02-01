// Timer logic for Pomodoro

import { EventEmitter } from 'events';
import { 
  TimerState, 
  TimerStatus, 
  Session, 
  BreakType,
  Settings 
} from './types';
import { 
  saveSession, 
  getCompletedToday, 
  getSettings, 
  generateSessionId 
} from './store';

export class PomodoroTimer extends EventEmitter {
  private state: TimerState = 'idle';
  private remainingSeconds: number = 0;
  private totalSeconds: number = 0;
  private interval: NodeJS.Timeout | null = null;
  private currentSession: Session | null = null;
  private breakType: BreakType = 'short';
  private settings: Settings;

  constructor() {
    super();
    this.settings = getSettings();
  }

  // Get current status
  getStatus(): TimerStatus {
    return {
      state: this.state,
      remainingSeconds: this.remainingSeconds,
      totalSeconds: this.totalSeconds,
      currentSession: this.currentSession,
      completedToday: getCompletedToday(),
      breakType: this.state === 'break' ? this.breakType : undefined,
    };
  }

  // Reload settings
  reloadSettings(): void {
    this.settings = getSettings();
  }

  // Start focus session
  startFocus(): void {
    this.settings = getSettings();
    const duration = this.settings.focusDuration;
    
    this.currentSession = {
      id: generateSessionId(),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      duration,
      type: 'focus',
      completed: false,
    };

    this.totalSeconds = duration * 60;
    this.remainingSeconds = this.totalSeconds;
    this.state = 'focus';
    
    this.startInterval();
    this.emit('stateChange', this.getStatus());
  }

  // Start break
  startBreak(type: BreakType = 'short'): void {
    this.settings = getSettings();
    this.breakType = type;
    
    const duration = type === 'long' 
      ? this.settings.longBreakDuration 
      : this.settings.shortBreakDuration;
    
    this.currentSession = {
      id: generateSessionId(),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      duration,
      type: 'break',
      breakType: type,
      completed: false,
    };

    this.totalSeconds = duration * 60;
    this.remainingSeconds = this.totalSeconds;
    this.state = 'break';
    
    this.startInterval();
    this.emit('stateChange', this.getStatus());
  }

  // Pause timer
  pause(): void {
    if (this.state === 'focus' || this.state === 'break') {
      this.stopInterval();
      this.state = 'paused';
      this.emit('stateChange', this.getStatus());
    }
  }

  // Resume timer
  resume(): void {
    if (this.state === 'paused' && this.currentSession) {
      this.state = this.currentSession.type === 'focus' ? 'focus' : 'break';
      this.startInterval();
      this.emit('stateChange', this.getStatus());
    }
  }

  // Forfeit current session
  forfeit(reason?: string): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.currentSession.completed = false;
      this.currentSession.forfeitReason = reason;
      saveSession(this.currentSession);
    }
    
    this.reset();
    this.emit('forfeit', reason);
  }

  // Reset to idle
  reset(): void {
    this.stopInterval();
    this.state = 'idle';
    this.remainingSeconds = 0;
    this.totalSeconds = 0;
    this.currentSession = null;
    this.emit('stateChange', this.getStatus());
  }

  // Complete current session
  private complete(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.currentSession.completed = true;
      saveSession(this.currentSession);
      
      const completedSession = this.currentSession;
      this.reset();
      
      this.emit('complete', completedSession);
    }
  }

  // Timer tick
  private tick(): void {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
      this.emit('tick', this.getStatus());
      
      if (this.remainingSeconds === 0) {
        this.complete();
      }
    }
  }

  // Start interval
  private startInterval(): void {
    this.stopInterval();
    this.interval = setInterval(() => this.tick(), 1000);
  }

  // Stop interval
  private stopInterval(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Determine next break type based on completed sessions
  getNextBreakType(): BreakType {
    const completed = getCompletedToday();
    const sessionsUntilLong = this.settings.sessionsUntilLongBreak;
    
    // Long break after every N sessions
    if (completed > 0 && completed % sessionsUntilLong === 0) {
      return 'long';
    }
    return 'short';
  }

  // Cleanup
  destroy(): void {
    this.stopInterval();
    this.removeAllListeners();
  }
}
