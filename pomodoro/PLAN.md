# Pomodoro Menu Bar App - Project Plan

> A minimal, focus-oriented Pomodoro timer that lives in the macOS menu bar.

---

## 🎯 Vision

A calming, distraction-free Pomodoro timer that encourages deep focus through thoughtful design inspired by the serene aesthetics of Indian Hoysala temple architecture.

---

## ⚠️ Technical Note

**Electron Tray Bug (macOS Sequoia/Tahoe)**: Electron's Tray API has a [known bug](https://github.com/electron/electron/issues/44817) on macOS 15+ where menu bar icons don't display. We pivoted to **SwiftBar** for the menu bar component, with Electron available for rich UI windows (break screen, settings).

---

## 📋 Phases

### Phase 1 - Core MVP ✅ Complete
- [x] ~~Electron menu bar app~~ → **SwiftBar** plugin (native macOS)
- [x] Timer with standard durations (25 min focus / 5 min short break / 15 min long break after 4 sessions)
- [x] Menu bar shows state icon + countdown (`🪷 23:45`)
- [x] Hoysala-inspired icons (🪷 focus, 🌿 break, ◉ idle)
- [x] Controls: Start, Pause, Forfeit
- [x] macOS native notifications with sound
- [x] Track sessions (persisted in `~/.pomodoro/`)
- [x] Show daily session count in dropdown
- [x] Electron window UI (working, for future use)

### Phase 2 - Focus Enhancements 🔄 Current
- [x] Micro-breaks (10-second eye-care reminders every 5 minutes during focus)
- [ ] Last 7 days stats view in dropdown
- [ ] "Extend focus" feature (+5 min focus = +1 min break earned)
- [ ] Forfeit with optional reason (for self-reflection)
- [ ] 10-second countdown before break starts
- [ ] Auto-lock macOS when break begins

### Phase 2.5 - Distribution ✅ Complete
- [x] One-click installer (.dmg with AppleScript app)
- [x] Auto-downloads SwiftBar if not installed
- [x] Bundles pomodoro script
- [x] Configures SwiftBar preferences automatically
- [x] No terminal or GitHub required for end users

### Phase 3 - Break Experience ✅ Largely Complete
- [x] Full-screen "break mode" window (Break Sanctuary - Electron)
- [x] Calming visual animation with timer (blooming lotus, breathing animations)
- [x] Light mode design with Hoysala aesthetics
- [x] Calm Mode — enter stillness anytime from menu bar
- [ ] Settings panel for custom durations
- [ ] Launch at login (SwiftBar)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    macOS Menu Bar                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  SwiftBar Plugin (pomodoro.1s.sh)               │    │
│  │  - Shows timer: 🪷 23:45                        │    │
│  │  - Dropdown menu controls                       │    │
│  │  - Writes state to ~/.pomodoro/state.json      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ reads/writes
                           ▼
┌─────────────────────────────────────────────────────────┐
│              ~/.pomodoro/                               │
│  ├── state.json      (current timer state)             │
│  └── history.json    (session history - Phase 2)       │
└─────────────────────────────────────────────────────────┘
                           │
                           │ triggers (Phase 3)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Electron App (Optional)                    │
│  - Full-screen break window                            │
│  - Settings panel                                       │
│  - Rich UI components                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

### Inspiration
- **Hoysala Temples** - Intricate yet harmonious, carved stone aesthetics
- Serene, meditative, grounded

### Color Palette (Earthly)
| Name | Hex | Usage |
|------|-----|-------|
| Temple Stone | `#8B7355` | Primary, idle state |
| Sandstone | `#D4C4A8` | Backgrounds |
| Terracotta | `#C67B5C` | Focus state, accents |
| Sage | `#7D8471` | Break state |
| Deep Earth | `#4A4238` | Text |
| Warm White | `#FAF8F5` | Background |

### Icons (SF Symbols)
| State | SF Symbol | Meaning |
|-------|-----------|---------|
| Idle | `circle.dashed` | Ready to focus |
| Focus | `scope` | Target/aim - deep work |
| Break | `leaf.fill` | Leaf - rest & restore |
| Paused | `pause.circle` | Timer paused (light weight) |

---

## 🔧 Technical Stack

| Component | Technology |
|-----------|------------|
| Menu Bar | **SwiftBar** (native macOS) |
| Timer Script | Bash + Python (JSON parsing) |
| State Storage | JSON files (`~/.pomodoro/`) |
| Notifications | macOS `osascript` |
| Rich UI | Electron (for break screen) |
| macOS Lock | `osascript` + `pmset` |

---

## 📁 Project Structure

```
pomodoro/
├── PLAN.md                          # This file
├── README.md                        # User documentation
│
├── pomodoro.1s.sh                   # Main timer script (source)
│
├── installer/                       # Distribution packaging
│   ├── Install Pomodoro.applescript # Installer source
│   ├── build-dmg.sh                 # Build script
│   └── build/                       # Output folder
│       └── Pomodoro-Timer.dmg       # Distributable installer
│
├── src/                            # Electron app (for rich UI)
│   ├── main/
│   ├── renderer/
│   └── assets/
│       ├── icons/                  # SVG icons
│       └── sounds/                 # Notification sounds
│
├── scripts/
│   └── create-icons.js            # Icon generator
│
└── package.json                    # Electron dependencies
```

**SwiftBar Plugin Location:**
`~/Documents/SwiftBar/pomodoro.1s.sh` (custom folder - NOT the default location)

---

## 🎮 Gamification Rules

### Focus Sessions
- Standard focus: 25 minutes
- Completing a focus session = 1 successful session counted
- 4 successful sessions = 1 long break (15 min)

### Forfeit
- User can forfeit anytime
- Optional reason prompt (for self-reflection)
- Forfeited sessions are NOT counted as successful

### Extend Focus (Phase 2)
- If in the zone, user can extend focus time
- Every +5 minutes of focus = +1 minute added to upcoming break
- Maximum extension: +25 minutes (earning +5 min extra break)

---

## 📊 Data Model

### State File (`~/.pomodoro/state.json`)
```json
{
  "status": "focus",
  "remaining": 1234,
  "total": 1500,
  "sessions_today": 3,
  "last_date": "2026-02-01",
  "type": "focus"
}
```

### History File (`~/.pomodoro/history.json`) - Phase 2
```json
{
  "sessions": [
    {
      "date": "2026-02-01",
      "completed": 4,
      "forfeited": 1,
      "total_focus_minutes": 100
    }
  ]
}
```

---

## 🔊 Sound Design

- **Focus Start**: macOS "Glass" sound (built-in)
- **Focus End**: macOS "Glass" sound with notification
- **Break End**: macOS notification sound
- Keep sounds minimal, calming, non-jarring

---

## 📝 Notes

- Light mode only (aligns with calm, daytime productivity aesthetic)
- Full-screen break window should feel like a "pause" not a "block"
- All animations should be slow, breathing-paced (4-7-8 rhythm)
- SwiftBar plugin refreshes every 1 second for smooth countdown

---

## 🚀 Running the App

### Start SwiftBar
```bash
open -a SwiftBar
```

### Plugin Location
The plugin auto-runs from:
```
~/Documents/SwiftBar/pomodoro.1s.sh
```
**Note**: This is a custom plugin folder, NOT the default location.

### View/Reset State
```bash
cat ~/.pomodoro/state.json     # View current state
rm ~/.pomodoro/state.json      # Reset everything
```

---

*Last updated: February 1, 2026*
