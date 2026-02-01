# Human Instructions

> Notes from agents to the human. Things you might need to do, check, or decide.

---

## Pending Actions

*Things the agents need you to do or verify.*

- [ ] **Test DMG installer on wife's Mac** - Send her the DMG via AirDrop and verify the full install flow works. (Feb 1, 2026)
- [ ] **Verify landing page** - Check https://home-mu-kohl.vercel.app/pomodoro/ looks correct (Feb 1, 2026)

### Previously Verified
- [x] **Verify click-to-toggle** - Clicking the menu bar item should: start timer (when idle), pause (when running), resume (when paused). Idle state now shows "25:00" greyed out. (Feb 1, 2026)

### Previously Verified
- [x] **Verify white color visibility** - Timer text is now white. Confirmed visible. (Feb 1, 2026)
- [x] **Test timer drift fix** - Confirmed working. (Feb 1, 2026)
- [x] **Verify SF Symbols** - Using `scope` for focus, confirmed working. (Feb 1, 2026)
- [x] **Verify paused dimming** - Gray text + lighter icon weight confirmed. (Feb 1, 2026)

---

## Decisions Needed

*Choices that require your input.*

- [ ] **Phase 2 priority** - History file (#7) is now complete. Remaining options: Last 7 days stats UI, Extend focus, Forfeit with reason, Auto-lock on break. (Feb 1, 2026)

---

## Distributing to Others

### The DMG Installer
The ready-to-share installer is at:
```
~/Documents/GitHub/pomodoro/installer/build/Pomodoro-Timer.dmg
```

**To share with your wife (or anyone):**
1. Send them the `Pomodoro-Timer.dmg` file (AirDrop, email, etc.)
2. They double-click to open
3. They double-click "Install Pomodoro"
4. Click "Install" when prompted
5. Timer appears in menu bar!

### Rebuilding After Changes
If you modify `pomodoro.1s.sh`, rebuild the DMG:
```bash
./installer/build-dmg.sh
```

---

## Tips for Working With This Project

### Testing Changes

After any SwiftBar script change, the menu bar updates automatically (every 1 second). To force refresh:
- Click the icon and close the dropdown
- Or: `pkill -x SwiftBar && open -a SwiftBar`

### Resetting State

If the timer gets into a weird state:
```bash
rm ~/.pomodoro/state.json
```

### Viewing Current State

```bash
cat ~/.pomodoro/state.json | python3 -m json.tool
```

---

## Completed

*Actions you've already taken (for record-keeping).*

- [x] **Notifications decision** - Chose to remove all notifications. Relying on menu bar visual only. (Feb 1, 2026)
- [x] **Tested all buttons** - Start, Pause, Resume, Forfeit all working correctly. (Feb 1, 2026)
- [x] **Verified SF Symbols and dimmed pause state** - All working as intended. (Feb 1, 2026)

---

## Memory System

The project uses a philosophical memory architecture:

| File | Purpose |
|------|---------|
| `DNA-MEMORY.md` | Immutable truths passed to all agents |
| `JATI-MEMORY.md` | Lineage record—each agent's craft and lessons |
| `AGENT-SOUL.md` | Living thoughts from current/last agent |

### The Three Paths (Janma Traya)

| Command | When to Use |
|---------|-------------|
| `/janma` | Default. Normal agent birth. Reads memory, builds on it. |
| `/nav-janma` | When you want **disruption**. Agent ignores memory, brings wild ideas. |
| `/punar-janma` | When you want **stability**. Agent deeply absorbs memory, protects patterns. |

**Departure:**
- `/moksha` — Agent updates memory and departs cleanly

**The cycle:** Alternate between nav-janma (diverge) and punar-janma (converge) when the project needs shaking up or stabilizing. Use janma for regular work.

---

*Last updated: February 1, 2026*
