// Break Sanctuary - Tauri Integration
const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

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

let cursorTimeout = null;
let lastState = null;

// Format seconds to M:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update the display
function updateDisplay(state) {
  if (!state) return;

  elements.timerValue.textContent = formatTime(state.remaining);

  // Update progress ring
  const circumference = 2 * Math.PI * 120;
  const progress = state.remaining / state.total;
  const offset = circumference * (1 - progress);
  elements.progressRing.style.strokeDashoffset = offset;

  // Stale check for message rotation
  if (state.remaining % 30 === 0 && state.remaining > 0 && lastState && lastState.remaining !== state.remaining) {
    rotateMessage();
  }

  // Sanctuary window visibility logic
  if (state.status !== 'break') {
    // If we are showing but state is no longer break, close/hide
    // In Tauri, the backend handles showing the window, but the frontend can handle closing it
    if (state.status === 'idle' && lastState && lastState.status === 'break') {
      completeBreak();
    }
  }

  // Determine break type styles
  if (state.total >= 600) {
    elements.sanctuary.classList.add('long-break');
  } else {
    elements.sanctuary.classList.remove('long-break');
  }

  lastState = state;
}

// Rotate calming messages
function rotateMessage() {
  const labelIndex = Math.floor(Math.random() * messages.labels.length);
  const subtitleIndex = Math.floor(Math.random() * messages.subtitles.length);

  elements.timerLabel.style.opacity = '0';
  elements.timerSubtitle.style.opacity = '0';

  setTimeout(() => {
    elements.timerLabel.textContent = messages.labels[labelIndex];
    elements.timerSubtitle.textContent = messages.subtitles[subtitleIndex];
    elements.timerLabel.style.opacity = '1';
    elements.timerSubtitle.style.opacity = '1';
  }, 300);
}

// Complete the break
function completeBreak() {
  // Play bell sound
  try {
    elements.bellSound.play().catch(() => { });
  } catch (e) { }

  // Show completion overlay
  elements.completionOverlay.classList.add('visible');

  // Close after a moment
  setTimeout(() => {
    invoke('hide_window');
  }, 2500);
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

// Cursor visibility behavior
function showCursor() {
  document.body.classList.remove('cursor-hidden');
  if (cursorTimeout) clearTimeout(cursorTimeout);
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

// Initialize
async function init() {
  createParticles();

  setTimeout(() => {
    elements.lotus.classList.add('bloomed');
  }, 2000);

  document.body.classList.add('cursor-hidden');
  document.addEventListener('mousemove', showCursor);
  elements.sanctuary.addEventListener('click', (e) => {
    if (e.target === elements.skipBtn || elements.skipBtn.contains(e.target)) return;
    hideCursor();
  });

  // Listen for timer ticks from backend
  await listen('timer-tick', (event) => {
    updateDisplay(event.payload);
  });

  // Initial state fetch
  const initialState = await invoke('get_state');
  updateDisplay(initialState);

  elements.skipBtn.addEventListener('click', () => {
    invoke('hide_window');
  });
}

document.addEventListener('DOMContentLoaded', init);
