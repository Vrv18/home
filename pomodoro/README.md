# 🪷 Pomodoro Menu Bar

A minimal, focus-oriented Pomodoro timer that lives in your macOS menu bar. Inspired by the serene aesthetics of Indian Hoysala temple architecture.

![Screenshot placeholder](docs/screenshot.png)

## Features

- **Menu Bar Timer** - See your remaining time at a glance, no clicking required
- **Focus Mode** - Beautiful, distraction-free interface designed to keep you in flow
- **Session Tracking** - Track your daily focus sessions and view last 7 days
- **Gamification** - Build streaks and see your productivity grow
- **Custom Icons** - Hoysala temple-inspired lotus icons for each state

## States

| State | Icon | Description |
|-------|------|-------------|
| Idle | 🪷 Lotus Bud | Ready to focus |
| Focus | 🔥 Blooming Lotus | Deep focus mode (25 min) |
| Break | 💧 Lotus on Water | Rest and recharge (5/15 min) |
| Paused | 🔔 Temple Bell | Timer paused |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- macOS (menu bar app)

### Installation

```bash
# Clone the repository
cd pomodoro

# Install dependencies
npm install

# Build and run
npm start
```

### Development

```bash
# Run in development mode (with hot reload)
npm run dev
```

### Building for Distribution

```bash
# Package the app
npm run dist
```

## Design

### Color Palette (Earthly)

| Color | Hex | Usage |
|-------|-----|-------|
| Temple Stone | `#8B7355` | Primary, idle state |
| Terracotta | `#C67B5C` | Focus state, accents |
| Sage | `#7D8471` | Break state |
| Sandstone | `#D4C4A8` | Backgrounds |
| Warm White | `#FAF8F5` | App background |

### Hoysala Inspiration

The visual design draws from Hoysala temple architecture (12th-13th century Karnataka, India), known for:
- Intricate yet harmonious carved details
- Lotus motifs symbolizing purity and focus
- Stone textures in warm, earthy tones

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click icon | Open/close panel |
| Space | Start/Pause timer |
| Escape | Close panel |

## Data Storage

Sessions are stored locally using `electron-store` at:
```
~/Library/Application Support/pomodoro-menubar/config.json
```

## Roadmap

See [PLAN.md](PLAN.md) for the full roadmap.

### Phase 1 (Current) ✅
- Core timer functionality
- Menu bar integration
- Session tracking
- Custom icons

### Phase 2
- Extend focus feature
- Auto-lock on break
- macOS Focus integration

### Phase 3
- Full-screen break mode
- Settings panel
- Launch at login

## License

MIT

## Acknowledgments

- Inspired by the timeless beauty of Hoysala temple architecture
- Built with [Electron](https://electronjs.org) and [menubar](https://github.com/max-mapper/menubar)
