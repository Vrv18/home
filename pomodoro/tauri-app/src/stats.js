const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

const elements = {
    todayMinutes: document.getElementById('today-minutes'),
    todaySessions: document.getElementById('today-sessions'),
    weekChart: document.getElementById('week-chart'),
    weekLabels: document.getElementById('week-labels'),
    closeBtn: document.getElementById('close-btn'),
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${WEEK_DAYS[date.getDay()]}`;
}

async function fetchAndRenderStats() {
    try {
        const history = await invoke('get_history');
        console.log('History:', history);

        // 1. Process Today's Data
        // history.sessions has entry { date: "YYYY-MM-DD", ... }
        // We assume backend returns Local date strings.
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const todayEntry = history.sessions.find(s => s.date === todayStr);

        if (todayEntry) {
            elements.todayMinutes.textContent = todayEntry.total_focus_minutes;
            elements.todaySessions.textContent = todayEntry.completed;
        } else {
            elements.todayMinutes.textContent = '0';
            elements.todaySessions.textContent = '0';
        }

        // 2. Process Week Chart
        renderWeekChart(history.sessions, todayStr);

    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function renderWeekChart(sessions, todayStr) {
    elements.weekChart.innerHTML = '';
    elements.weekLabels.innerHTML = '';

    // Generate last 7 days dates
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en-CA')); // YYYY-MM-DD
    }

    // Find max value for scaling
    // We Map days to minutes
    const dataPoints = days.map(dateStr => {
        const entry = sessions.find(s => s.date === dateStr);
        return {
            date: dateStr,
            minutes: entry ? entry.total_focus_minutes : 0,
            isToday: dateStr === todayStr
        };
    });

    const maxMinutes = Math.max(...dataPoints.map(d => d.minutes), 60); // Min scale 60m

    // Render bars
    dataPoints.forEach(point => {
        const dateObj = new Date(point.date);
        const dayName = WEEK_DAYS[dateObj.getDay()];

        // Bar Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'bar-tooltip';
        tooltip.textContent = `${point.minutes}m`;
        wrapper.appendChild(tooltip);

        // Bar
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (point.minutes / maxMinutes) * 100;
        bar.style.height = `${Math.max(height, 5)}%`; // Min height visual
        if (point.today) bar.style.opacity = '1';
        wrapper.appendChild(bar);

        elements.weekChart.appendChild(wrapper);

        // Label
        const label = document.createElement('div');
        label.className = `day-label ${point.isToday ? 'today' : ''}`;
        label.textContent = dayName;
        elements.weekLabels.appendChild(label);
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderStats();

    elements.closeBtn.addEventListener('click', () => {
        // We can just hide the window
        // But for a secondary window, closing it might be better?
        // Let's hide it to keep state if needed, or backend can handle close.
        // Actually, tauri windows usually just hide.
        // Let's use standard window api if available or invoke prompt
        // Using window.close() closes the view.
        // If the backend configured it to not exit app on close, this is fine.
        invoke('hide_stats_window').catch(() => window.close());
    });
});
