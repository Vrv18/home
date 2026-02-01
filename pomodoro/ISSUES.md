# Issues

> A living list of bugs, UX issues, and improvements. Mark items as resolved with `[x]` and add a brief note on the fix or decision.

---

## Critical (Blocks Core Functionality)

- [x] **#5 - Buttons don't work**: Pause, Forfeit, Reset buttons silently fail when clicked.
  - *Root cause*: `$0` in the script expands to a path with spaces ("Application Support") but isn't quoted, causing bash to misinterpret the command.
  - *Fixed*: Added `SCRIPT_PATH="$0"` variable and used `bash="$SCRIPT_PATH"` with proper quoting.

- [x] **#10 - Pause button inconsistent**: Pause doesn't work every time. Sometimes clicking it does nothing.
  - *Root cause*: Was editing wrong file (see #12). Once correct file was updated, buttons work consistently.

---

## High (Degraded Experience)

- [x] **#2 - Timer display freezes on click**: When you click the menu bar item, the countdown display freezes on the current time while the dropdown is open. The timer continues in the background, but the display doesn't update until you close the dropdown.
  - *Workaround*: Added live timer to dropdown header (e.g., "Focusing — 23:20"). Shows current time when you open the menu.
  - *Note*: Dropdown content also freezes while open - this is a SwiftBar limitation, not fixable.

- [x] **#6 - Timer drift**: The script decrements `remaining` by 1 each second, but SwiftBar's 1-second refresh isn't perfectly accurate. Over a 25-minute session, drift could accumulate to several seconds.
  - *Fixed*: Now calculates remaining from `start_time` using `remaining = total - (now - start_time)`. No more accumulating drift.

---

## Medium (Visual / Polish)

- [x] **#1 - Orange color doesn't stand out**: The terracotta color (`#C67B5C`) for focus state doesn't have enough contrast against the macOS menu bar, especially in light mode.
  - *Fixed*: Changed to deeper burnt orange `#D35400`. Also darkened sage to `#5D6D4E`.
  - *Updated*: Changed menu bar text to white (`#FFFFFF`) for visibility on both light and dark backgrounds.

- [x] **#4 - Lotus icon needs redesign**: Current emoji/icon doesn't look clean. Pivot to a minimal geometric lotus SVG.
  - *Fixed*: Using SF Symbols — `scope` (focus), `leaf.fill` (break), `pause.circle` (paused), `circle.dashed` (idle).
  - *Updated*: Paused state now uses `sfweight=light` for thinner icon (can't color SF Symbols in menu bar - macOS limitation).
  - *Updated 2*: Changed to circle-based icons for consistent width: `play.circle` (idle), `circle.fill` (focus), `pause.circle` (paused), `moon.circle.fill` (break).

- [x] **#11 - Notification "Show" button opens Script Editor**: macOS quirk with `osascript` notifications - the "Show" button opens Script Editor instead of doing something useful.
  - *Fixed*: Removed all notifications. Relying on menu bar visual only.

- [x] **#13 - Menu bar quick actions**: Investigate ways to have Pause/Resume/Start accessible directly from the menu bar without opening the dropdown.
  - *Fixed*: Click on menu bar item now triggers toggle action (idle→start, running→pause, paused→resume). Dropdown still available for Forfeit, Reset, custom durations.
  - *Updated*: See #17 for improved two-plugin solution.

- [x] **#17 - Split menu bar into two plugins**: Single plugin caused UX issues — clicking to toggle also opened dropdown. Split into two separate SwiftBar plugins for cleaner interaction.
  - *Fixed*: `pomodoro-timer.125ms.sh` shows icon only (click to start/pause/resume), `pomodoro-menu.125ms.sh` shows time only (click to open dropdown with stats/controls).
  - *Details*: Using 125ms refresh for snappy updates. Monospace font (Menlo) for consistent time width. Circle-based icons for consistent icon width.

---

## Low (Nice to Have)

- [x] **#3 - Chunky action buttons**: Pause and Forfeit should feel more prominent, not like standard dropdown menu items.
  - *Fixed*: Replaced Unicode emojis with SF Symbols (play.fill, pause.fill, xmark.circle), added system colors (green for Start/Resume, blue for Pause, red for Forfeit), increased font size to 15.

- [x] **#7 - History file not implemented**: `HISTORY_FILE` is defined in the script but never written to. Needed for Phase 2 "Last 7 days stats" feature.
  - *Fixed*: Added `update_history` function that writes to `~/.pomodoro/history.json`. Tracks completed sessions, forfeited sessions, and total focus minutes per day. Keeps last 30 days of data.

- [x] **#14 - Info button in dropdown**: Add an "Info" button at the bottom of the dropdown menu. Clicking it should open a simple dialog box explaining how to use the timer (click to start/pause, dropdown for more options, etc.).
  - *Fixed*: Added "About" button with info.circle icon. Shows dialog explaining click-to-toggle, extend, forfeit, Break Sanctuary, and Calm Mode.

- [ ] **#15 - Installer Gatekeeper issues**: Downloaded DMG and installer app trigger macOS "damaged and can't be opened" warning. Requires `xattr -cr` or right-click → Open to bypass.
  - *Status*: Documented in README. Would need Apple Developer signing to fully fix (~$99/year).

- [ ] **#16 - Break Sanctuary size**: Electron bundle is 85MB (220MB uncompressed). Could be reduced to ~10MB with Tauri rewrite.
  - *Status*: Accepted for now. Tauri would require Rust expertise.

- [x] **#8 - Dead code cleanup**: The `tick` command case (lines 149-157) is never called. The default `*` case handles all timer updates. Should remove for clarity.
  - *Fixed*: Removed dead `tick` case. Timer now uses start_time-based calculation, no tick needed.

- [x] **#9 - No JSON error handling**: If `state.json` gets corrupted, Python parsing fails silently and causes unpredictable behavior. Should add validation/recovery.
  - *Fixed*: Added JSON validation before parsing. If corrupted, automatically resets to default state.

---

## Resolved

- [x] **#12 - Wrong plugin location in docs**: HANDOFF.md and PLAN.md referenced `~/Library/Application Support/SwiftBar/Plugins/` but SwiftBar is configured to use `~/Documents/SwiftBar/`. Edits were going to the wrong file.
  - *Fixed*: Updated docs, copied fixed script to correct location.

---

*Last updated: February 1, 2026 (Agent 10)*