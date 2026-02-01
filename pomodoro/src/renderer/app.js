// Pomodoro Renderer App

const { ipcRenderer } = require('electron');

// DOM Elements
const elements = {
  todayCount: document.getElementById('todayCount'),
  stateIcon: document.getElementById('stateIcon'),
  stateText: document.getElementById('stateText'),
  timerValue: document.getElementById('timerValue'),
  progressBar: document.getElementById('progressBar'),
  timerDisplay: document.querySelector('.timer-display'),
  
  // Control groups
  idleControls: document.getElementById('idleControls'),
  activeControls: document.getElementById('activeControls'),
  pausedControls: document.getElementById('pausedControls'),
  completeControls: document.getElementById('completeControls'),
  
  // Buttons
  startFocusBtn: document.getElementById('startFocusBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  forfeitBtn: document.getElementById('forfeitBtn'),
  resumeBtn: document.getElementById('resumeBtn'),
  forfeitBtn2: document.getElementById('forfeitBtn2'),
  startBreakBtn: document.getElementById('startBreakBtn'),
  skipBreakBtn: document.getElementById('skipBreakBtn'),
  quitBtn: document.getElementById('quitBtn'),
  
  // Modal
  forfeitModal: document.getElementById('forfeitModal'),
  forfeitReason: document.getElementById('forfeitReason'),
  confirmForfeit: document.getElementById('confirmForfeit'),
  cancelForfeit: document.getElementById('cancelForfeit'),
  
  // Stats
  statsToggle: document.getElementById('statsToggle'),
  statsContent: document.getElementById('statsContent'),
  statsChart: document.getElementById('statsChart'),
  
  // Audio
  soundStart: document.getElementById('soundStart'),
  soundComplete: document.getElementById('soundComplete'),
  soundBreakEnd: document.getElementById('soundBreakEnd'),
};

// Current state
let currentState = 'idle';
let pendingBreakType = 'short';

// Icon paths (relative to renderer folder)
const icons = {
  idle: '../assets/icons/idle.svg',
  focus: '../assets/icons/focus.svg',
  break: '../assets/icons/break.svg',
  paused: '../assets/icons/paused.svg',
};

// Format seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update UI with timer status
function updateUI(status) {
  currentState = status.state;
  
  // Update timer display
  if (status.state === 'idle') {
    elements.timerValue.textContent = '25:00';
    elements.progressBar.setAttribute('width', '200');
  } else {
    elements.timerValue.textContent = formatTime(status.remainingSeconds);
    
    // Update progress bar
    const progress = (status.remainingSeconds / status.totalSeconds) * 200;
    elements.progressBar.setAttribute('width', progress.toString());
  }
  
  // Update state icon and text
  elements.stateIcon.src = icons[status.state] || icons.idle;
  elements.stateText.className = `state-text ${status.state}`;
  
  switch (status.state) {
    case 'idle':
      elements.stateText.textContent = 'Ready to Focus';
      break;
    case 'focus':
      elements.stateText.textContent = 'Deep Focus';
      break;
    case 'break':
      elements.stateText.textContent = status.breakType === 'long' ? 'Long Break' : 'Short Break';
      break;
    case 'paused':
      elements.stateText.textContent = 'Paused';
      break;
  }
  
  // Update progress bar color
  elements.progressBar.className = `progress-ring-fill ${status.state}`;
  
  // Update timer display animation
  if (status.state === 'focus' || status.state === 'break') {
    elements.timerDisplay.classList.add('active');
  } else {
    elements.timerDisplay.classList.remove('active');
  }
  
  // Update session count
  elements.todayCount.textContent = status.completedToday.toString();
  
  // Show appropriate controls
  showControls(status.state);
}

// Show appropriate control buttons
function showControls(state) {
  // Hide all first
  elements.idleControls.classList.add('hidden');
  elements.activeControls.classList.add('hidden');
  elements.pausedControls.classList.add('hidden');
  elements.completeControls.classList.add('hidden');
  
  switch (state) {
    case 'idle':
      elements.idleControls.classList.remove('hidden');
      break;
    case 'focus':
    case 'break':
      elements.activeControls.classList.remove('hidden');
      break;
    case 'paused':
      elements.pausedControls.classList.remove('hidden');
      break;
  }
}

// Show session complete controls
function showCompleteControls(breakType) {
  pendingBreakType = breakType;
  elements.idleControls.classList.add('hidden');
  elements.activeControls.classList.add('hidden');
  elements.pausedControls.classList.add('hidden');
  elements.completeControls.classList.remove('hidden');
  
  // Update break button text
  elements.startBreakBtn.textContent = breakType === 'long' 
    ? 'Start Long Break (15 min)' 
    : 'Start Break (5 min)';
}

// Update stats chart
async function updateStats() {
  const stats = await ipcRenderer.invoke('get-stats');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Find max for scaling
  const maxSessions = Math.max(...stats.map(s => s.successfulSessions), 4);
  
  elements.statsChart.innerHTML = stats.map(stat => {
    const date = new Date(stat.date);
    const dayName = days[date.getDay()];
    const height = stat.successfulSessions > 0 
      ? Math.max((stat.successfulSessions / maxSessions) * 40, 8) 
      : 4;
    const hasSessionsClass = stat.successfulSessions > 0 ? 'has-sessions' : '';
    
    return `
      <div class="stat-bar">
        <span class="stat-bar-count">${stat.successfulSessions || '-'}</span>
        <div class="stat-bar-fill ${hasSessionsClass}" style="height: ${height}px"></div>
        <span class="stat-bar-label">${dayName}</span>
      </div>
    `;
  }).join('');
}

// Show forfeit modal
function showForfeitModal() {
  elements.forfeitModal.classList.remove('hidden');
  elements.forfeitReason.value = '';
  elements.forfeitReason.focus();
}

// Hide forfeit modal
function hideForfeitModal() {
  elements.forfeitModal.classList.add('hidden');
}

// Play sound
function playSound(name) {
  const soundMap = {
    start: elements.soundStart,
    complete: elements.soundComplete,
    'break-end': elements.soundBreakEnd,
  };
  
  const audio = soundMap[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {}); // Ignore errors
  }
}

// Event Listeners

// Start focus
elements.startFocusBtn.addEventListener('click', async () => {
  await ipcRenderer.invoke('start-focus');
});

// Pause
elements.pauseBtn.addEventListener('click', async () => {
  await ipcRenderer.invoke('pause');
});

// Resume
elements.resumeBtn.addEventListener('click', async () => {
  await ipcRenderer.invoke('resume');
});

// Forfeit buttons
elements.forfeitBtn.addEventListener('click', showForfeitModal);
elements.forfeitBtn2.addEventListener('click', showForfeitModal);

// Confirm forfeit
elements.confirmForfeit.addEventListener('click', async () => {
  const reason = elements.forfeitReason.value.trim() || undefined;
  await ipcRenderer.invoke('forfeit', reason);
  hideForfeitModal();
});

// Cancel forfeit
elements.cancelForfeit.addEventListener('click', hideForfeitModal);

// Start break
elements.startBreakBtn.addEventListener('click', async () => {
  await ipcRenderer.invoke('start-break', pendingBreakType);
});

// Skip break
elements.skipBreakBtn.addEventListener('click', async () => {
  await ipcRenderer.invoke('reset');
  const status = await ipcRenderer.invoke('get-status');
  updateUI(status);
});

// Stats toggle
elements.statsToggle.addEventListener('click', () => {
  elements.statsToggle.classList.toggle('open');
  elements.statsContent.classList.toggle('hidden');
  if (!elements.statsContent.classList.contains('hidden')) {
    updateStats();
  }
});

// Quit
elements.quitBtn.addEventListener('click', () => {
  ipcRenderer.invoke('quit-app');
});

// Close modal on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !elements.forfeitModal.classList.contains('hidden')) {
    hideForfeitModal();
  }
});

// IPC Event Listeners

// Timer tick
ipcRenderer.on('timer-tick', (_, status) => {
  updateUI(status);
});

// State change
ipcRenderer.on('timer-state-change', (_, status) => {
  updateUI(status);
});

// Session complete
ipcRenderer.on('session-complete', async (_, session) => {
  if (session.type === 'focus') {
    // Get next break type and show complete controls
    const breakType = await ipcRenderer.invoke('get-next-break-type');
    showCompleteControls(breakType);
  } else {
    // Break is over, show idle
    const status = await ipcRenderer.invoke('get-status');
    updateUI(status);
  }
  updateStats();
});

// Session forfeit
ipcRenderer.on('session-forfeit', (_, reason) => {
  console.log('Session forfeited:', reason);
});

// Play sound from main process
ipcRenderer.on('play-sound', (_, soundName) => {
  playSound(soundName);
});

// Initialize
async function init() {
  try {
    const status = await ipcRenderer.invoke('get-status');
    updateUI(status);
    await updateStats();
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

init();
