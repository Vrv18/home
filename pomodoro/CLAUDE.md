# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A macOS menu bar Pomodoro timer using SwiftBar for menu bar integration and Electron for the Break Sanctuary full-screen break experience. Inspired by Indian Hoysala temple aesthetics with a focus on calm, thoughtful design.

## Build & Development Commands

```bash
npm run build           # Compile TypeScript to dist/
npm run dev             # Watch mode + live Electron (concurrent)
npm run start           # Build + run Electron app
npm run break           # Run Break Sanctuary electron app
npm run break:test      # Run Break Sanctuary in test mode
npm run dist            # Build distributable DMG
./installer/build-dmg.sh # Build DMG installer (~85MB)
```

## Architecture

```
┌─────────────────────────────────────┐
│   SwiftBar Plugin (Menu Bar)        │
│   ~/Documents/SwiftBar/pomodoro.1s.sh
└─────────────────────────────────────┘
              ↓ reads/writes
┌─────────────────────────────────────┐
│   ~/.pomodoro/ (JSON State)         │
│   - state.json (current session)    │
│   - history.json (stats, 30 days)   │
└─────────────────────────────────────┘
              ↓ triggers
┌─────────────────────────────────────┐
│   Break Sanctuary (Electron)        │
│   src/break-screen/                 │
└─────────────────────────────────────┘
```

**Key insight**: Electron's Tray API is broken on macOS 15+. SwiftBar handles menu bar; Electron handles rich UI only.

## Critical Paths

- **Live SwiftBar script**: `~/Documents/SwiftBar/pomodoro.1s.sh` (NOT the default SwiftBar location)
- **Repo source**: `./pomodoro.1s.sh` (sync back after editing live file)
- **State files**: `~/.pomodoro/state.json`, `~/.pomodoro/history.json`

## Key Technical Truths (Don't Re-discover)

1. **SwiftBar folder is custom**: `~/Documents/SwiftBar/` - edits to wrong path are invisible
2. **Bash path quoting**: Must quote `"$0"` when re-invoking scripts (paths contain spaces)
3. **Timer drift fix**: Calculate remaining from `start_time`, don't decrement
4. **SF Symbols**: Cannot be colored in menu bars (macOS limitation)
5. **SwiftBar dropdown freeze**: Content freezes while open (unfixable limitation)
6. **Gatekeeper**: Fix "damaged" apps with `xattr -cr /path/to/app`
7. **GitHub file limit**: 100MB max - large DMGs go to GitHub Releases

## Memory Architecture

This project uses a 4-file memory system for agent continuity:

| File | Purpose |
|------|---------|
| `DNA-MEMORY.md` | Immutable technical truths |
| `JATI-MEMORY.md` | Agent lineage and contributions |
| `AGENT-SOUL.md` | Current agent's living thoughts |
| `PLAN.md` | Roadmap and task status |

**Read DNA-MEMORY.md first** when starting work - it contains hard-won lessons.

## Testing

- Menu bar updates every 1 second automatically
- Reset state: `rm ~/.pomodoro/state.json`
- Force SwiftBar refresh: `pkill -x SwiftBar` then reopen SwiftBar
- Check state: `cat ~/.pomodoro/state.json`

## Project Status

- **Phase 1 (Core MVP)**: Complete - SwiftBar integration, timer, persistence
- **Phase 2 (Focus Enhancements)**: In progress - history tracking done, stats UI pending
- **Phase 3 (Break Experience)**: Largely complete - Break Sanctuary working

See `PLAN.md` for detailed roadmap and `ISSUES.md` for bug tracking.

## Documentation Hygiene

Update these documents as you work, not just at the end:

| File | When to Update |
|------|----------------|
| `PLAN.md` | Mark tasks complete, add new phases, update technical notes |
| `ISSUES.md` | Add new issues found, mark resolved with `[x]` and brief note |
| `HUMAN-INSTRUCTIONS.md` | Add pending human actions, decisions needed |

Guidelines:
- When you fix something, mark it `[x]` in ISSUES.md with a one-line summary
- When you complete a Phase item, mark it `[x]` in PLAN.md
- Don't defer documentation to "later" — update as you go
