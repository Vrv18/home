// Micro-break - Eye care reminder
const { invoke } = window.__TAURI__.core;

const messages = [
  {
    title: 'Look away from screen',
    tip: 'Focus on something 20 feet away'
  },
  {
    title: 'Rest your eyes',
    tip: 'Blink slowly 10 times'
  },
  {
    title: 'Relax your gaze',
    tip: 'Close your eyes for a moment'
  },
  {
    title: 'Stretch your neck',
    tip: 'Roll your shoulders back gently'
  },
  {
    title: 'Take a breath',
    tip: 'Deep breath in, slow breath out'
  }
];

const DURATION = 10; // 10 seconds
let remaining = DURATION;
let interval = null;

const elements = {
  message: document.getElementById('message'),
  tip: document.getElementById('tip'),
  countdown: document.getElementById('countdown'),
  autoClose: document.getElementById('autoClose'),
  progressCircle: document.getElementById('progressCircle'),
  dismissBtn: document.getElementById('dismissBtn')
};

function showRandomMessage() {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  elements.message.textContent = msg.title;
  elements.tip.textContent = msg.tip;
}

function updateTimer() {
  remaining--;
  elements.countdown.textContent = remaining;
  elements.autoClose.textContent = remaining;

  // Update progress circle
  const circumference = 2 * Math.PI * 36;
  const progress = remaining / DURATION;
  const offset = circumference * (1 - progress);
  elements.progressCircle.style.strokeDashoffset = offset;

  if (remaining <= 0) {
    dismiss();
  }
}

function dismiss() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  invoke('hide_microbreak_window');
}

function init() {
  // Show random message
  showRandomMessage();

  // Start countdown
  remaining = DURATION;
  interval = setInterval(updateTimer, 1000);

  // Dismiss button
  elements.dismissBtn.addEventListener('click', dismiss);

  // Click anywhere to dismiss
  document.body.addEventListener('click', (e) => {
    if (e.target !== elements.dismissBtn) {
      dismiss();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

// Reset on window show
window.addEventListener('focus', () => {
  remaining = DURATION;
  elements.countdown.textContent = remaining;
  elements.autoClose.textContent = remaining;
  showRandomMessage();
  
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(updateTimer, 1000);
});
