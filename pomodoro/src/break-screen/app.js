// Break Sanctuary - Timer Logic and Animations

const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

// State file paths
const STATE_DIR = path.join(process.env.HOME, '.pomodoro');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const STATE_BACKUP = path.join(STATE_DIR, 'state_backup.json');

// DOM Elements
const elements = {
  sanctuary: document.querySelector('.sanctuary'),
  lotus: document.querySelector('.lotus'),
  timerValue: document.getElementById('timerValue'),
  timerLabel: document.getElementById('timerLabel'),
  timerSubtitle: document.getElementById('timerSubtitle'),
  progressRing: document.getElementById('progressRing'),
  skipBtn: document.getElementById('skipBtn'),
  completionOverlay: document.getElementById('completionOverlay'),
  particles: document.getElementById('particles'),
  ambientSound: document.getElementById('ambientSound'),
  bellSound: document.getElementById('bellSound'),
};

// Timer state
let totalSeconds = 300; // default 5 min
let remainingSeconds = 300;
let isLongBreak = false;
let isCalmMode = false;
let tickInterval = null;
let startTime = null;
let cursorTimeout = null;

// Calming messages that rotate
const messages = {
  labels: [
    'Take a breath',
    'Be present',
    'Rest your eyes',
    'Let go',
    'Be still',
  ],
  subtitles: [
    'Your mind is settling',
    'This moment is yours',
    'Stillness restores',
    'Peace flows through you',
    'Breathe deeply',
  ],
};

// Format seconds to M:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Read state from file
function readState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading state:', error);
  }
  return null;
}

// Initialize timer from state
function initFromState() {
  const state = readState();
  
  if (state && state.status === 'break') {
    // Calculate remaining from start_time if available
    if (state.start_time) {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - state.start_time;
      remainingSeconds = Math.max(0, state.total - elapsed);
      totalSeconds = state.total;
    } else {
      remainingSeconds = state.remaining || 300;
      totalSeconds = state.total || 300;
    }
    
    // Check if this is calm mode (standalone sanctuary)
    isCalmMode = state.type === 'calm';
    
    // Determine break type
    isLongBreak = totalSeconds >= 600; // 10+ minutes = long break
    
    if (isCalmMode) {
      elements.timerLabel.textContent = 'Calm mode';
      elements.timerSubtitle.textContent = 'A moment of stillness';
    } else if (isLongBreak) {
      elements.sanctuary.classList.add('long-break');
      elements.timerLabel.textContent = 'Long break';
    }
  }
  
  updateDisplay();
}

// Update the display
function updateDisplay() {
  elements.timerValue.textContent = formatTime(remainingSeconds);
  
  // Update progress ring
  const circumference = 2 * Math.PI * 120; // radius = 120
  const progress = remainingSeconds / totalSeconds;
  const offset = circumference * (1 - progress);
  elements.progressRing.style.strokeDashoffset = offset;
  
  // Rotate messages periodically
  if (remainingSeconds % 30 === 0 && remainingSeconds > 0 && remainingSeconds < totalSeconds) {
    rotateMessage();
  }
}

// Rotate calming messages
function rotateMessage() {
  const labelIndex = Math.floor(Math.random() * messages.labels.length);
  const subtitleIndex = Math.floor(Math.random() * messages.subtitles.length);
  
  // Fade out
  elements.timerLabel.style.opacity = '0';
  elements.timerSubtitle.style.opacity = '0';
  
  setTimeout(() => {
    elements.timerLabel.textContent = messages.labels[labelIndex];
    elements.timerSubtitle.textContent = messages.subtitles[subtitleIndex];
    
    // Fade in
    elements.timerLabel.style.opacity = '1';
    elements.timerSubtitle.style.opacity = '1';
  }, 300);
}

// Timer tick
function tick() {
  // Re-read state to sync with SwiftBar
  const state = readState();
  
  if (state) {
    if (state.status !== 'break') {
      // Break was ended externally (forfeit, etc.)
      completeBreak();
      return;
    }
    
    // Calculate remaining from start_time for accuracy
    if (state.start_time) {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - state.start_time;
      remainingSeconds = Math.max(0, state.total - elapsed);
    }
  }
  
  if (remainingSeconds <= 0) {
    completeBreak();
    return;
  }
  
  remainingSeconds--;
  updateDisplay();
}

// Complete the break
function completeBreak() {
  clearInterval(tickInterval);
  
  // Play bell sound
  try {
    elements.bellSound.play().catch(() => {});
  } catch (e) {}
  
  // Show completion overlay
  elements.completionOverlay.classList.add('visible');
  
  // Close after a moment
  setTimeout(() => {
    closeWindow();
  }, 2500);
}

// Restore previous state if we were in calm mode
function restoreState() {
  if (isCalmMode) {
    try {
      // Restore from backup if it exists
      if (fs.existsSync(STATE_BACKUP)) {
        fs.copyFileSync(STATE_BACKUP, STATE_FILE);
        fs.unlinkSync(STATE_BACKUP); // Clean up backup
      } else {
        // No backup, reset to idle
        const today = new Date().toISOString().split('T')[0];
        const idleState = {
          status: 'idle',
          remaining: 1500,
          total: 1500,
          sessions_today: 0,
          last_date: today,
          type: 'focus'
        };
        fs.writeFileSync(STATE_FILE, JSON.stringify(idleState));
      }
    } catch (error) {
      console.error('Error restoring state:', error);
    }
  }
}

// Close the window
function closeWindow() {
  restoreState();
  
  if (ipcRenderer) {
    ipcRenderer.send('close-break-screen');
  } else {
    window.close();
  }
}

// Skip break early
function skipBreak() {
  clearInterval(tickInterval);
  closeWindow();
}

// Create floating particles
function createParticles() {
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.animationDuration = `${15 + Math.random() * 10}s`;
    elements.particles.appendChild(particle);
  }
}

// Mark lotus as bloomed after initial animation
function setupLotusBloom() {
  setTimeout(() => {
    elements.lotus.classList.add('bloomed');
  }, 2000); // After bloom animation completes
}

// Cursor visibility - show on move, hide after inactivity
function showCursor() {
  document.body.classList.remove('cursor-hidden');
  
  // Clear existing timeout
  if (cursorTimeout) {
    clearTimeout(cursorTimeout);
  }
  
  // Hide cursor after 2 seconds of inactivity
  cursorTimeout = setTimeout(() => {
    document.body.classList.add('cursor-hidden');
  }, 2000);
}

function hideCursor() {
  document.body.classList.add('cursor-hidden');
  if (cursorTimeout) {
    clearTimeout(cursorTimeout);
    cursorTimeout = null;
  }
}

function setupCursorBehavior() {
  // Start with cursor hidden
  document.body.classList.add('cursor-hidden');
  
  // Show cursor on any mouse movement
  document.addEventListener('mousemove', showCursor);
  
  // Click on background = return to stillness
  // Click on button = skip (handled separately)
  elements.sanctuary.addEventListener('click', (e) => {
    // If clicking the skip button, don't hide
    if (e.target === elements.skipBtn || elements.skipBtn.contains(e.target)) {
      return;
    }
    // Return to calm mode
    hideCursor();
  });
}

// Initialize
function init() {
  // Read state and configure
  initFromState();
  
  // Create particles
  createParticles();
  
  // Setup lotus bloom
  setupLotusBloom();
  
  // Setup cursor hide/show behavior
  setupCursorBehavior();
  
  // Start timer
  tickInterval = setInterval(tick, 1000);
  
  // Skip button
  elements.skipBtn.addEventListener('click', skipBreak);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      skipBreak();
    }
  });
  
  // Try to play ambient sound (user may need to interact first)
  try {
    // elements.ambientSound.volume = 0.3;
    // elements.ambientSound.play().catch(() => {});
  } catch (e) {}
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
