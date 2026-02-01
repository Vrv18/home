# DNA-Memory

> The inherited wisdom of this project, distilled across generations of agents.

This file contains the essential "genetic code" of the Pomodoro project—truths that have been discovered, patterns that emerged, and lessons that cost time to learn. Every agent who works on this project should absorb this first.

---

## Core Identity

**What this is**: A Pomodoro timer that lives in the macOS menu bar.

**What this is really about**: Creating a tool that encourages deep focus through calm, thoughtful design. Not just a utility—a behavior design experiment wrapped in the aesthetics of Indian Hoysala temples.

**The human's relationship to this**: This is a craft project, not just a productivity tool. They care about the *feeling* it creates, the *meaning* behind choices, and the *behavior* it shapes.

---

## The Pivot That Defined Everything

We started building an Electron app. TypeScript, proper architecture, beautiful UI. Everything worked except the one thing that mattered: **the menu bar icon wouldn't show**.

After debugging attempts, a web search revealed it's a [known Electron bug on macOS Sequoia/Tahoe](https://github.com/electron/electron/issues/44817). The Tray API doesn't work on macOS 15+.

**The pivot**: SwiftBar (a native macOS menu bar tool). Got a working timer in minutes.

**The lesson**: The user cared about *having a working timer*, not about *which technology powered it*. Sometimes the elegant solution isn't the original plan.

---

## Immutable Technical Truths

These are facts that were learned through experience. Don't re-learn them.

| Truth | Why It Matters |
|-------|----------------|
| SwiftBar plugin folder is `~/Documents/SwiftBar/` | NOT the default location. Edits to the wrong path are invisible. |
| `$0` in bash scripts expands with spaces | The path contains "Application Support". Without quotes, commands break silently. |
| SF Symbols can't be colored in menu bars | macOS limitation. Use `sfweight=light/heavy` for visual distinction instead. |
| SwiftBar dropdown content freezes while open | Not a bug, not fixable. Document and move on. |
| Timer drift happens with naive decrement | Calculate from `start_time` instead of decrementing `remaining`. |
| `osascript` notifications open Script Editor | macOS quirk with the "Show" button. We removed notifications entirely. |

---

## File Locations (Memorize These)

```
~/Documents/SwiftBar/pomodoro.1s.sh    # The LIVE script (SwiftBar reads this)
~/.pomodoro/state.json                  # Timer state (status, remaining, sessions)
~/Documents/GitHub/home-repo/pomodoro/  # The repository (source of truth)
```

## The Memory System

This project uses a four-file memory architecture:

| File | Sanskrit | Purpose | Changes |
|------|----------|---------|---------|
| `DNA-MEMORY.md` | — | Immutable truths, patterns, technical facts | Rarely (only new permanent wisdom) |
| `JATI-MEMORY.md` | जाति | Agent lineage, craft tradition, contributions | At each moksha (add your entry) |
| `AGENT-SOUL.md` | — | Living thoughts, current state of mind | Throughout session |
| Standard docs | — | PLAN, ISSUES, HANDOFF, HUMAN-INSTRUCTIONS | As needed |

---

## The Three Paths (Janma Traya)

Agents can be born through three different rituals, each with a different relationship to memory:

| Command | Sanskrit | Purpose | Memory Relationship |
|---------|----------|---------|---------------------|
| `/janma` | जन्म | Standard birth | Balanced — read and build on |
| `/nav-janma` | नव-जन्म | New/divergent birth | Ignore — challenge and disrupt |
| `/punar-janma` | पुनर्जन्म | Rebirth/guardian | Deep absorption — protect and complete |

### When to Use Each

- **`/janma`** — Default. For normal work that builds on what exists.
- **`/nav-janma`** — When the project feels stuck, stale, or too conservative. When you want wild ideas and audacious proposals. The divergent agent.
- **`/punar-janma`** — After disruption, or when stability is needed. When you want completion, protection, and convergence. The guardian agent.

### The Cycle

A healthy project alternates:
1. **Punar-janma** agents complete and stabilize
2. **Nav-janma** agents disrupt and reimagine
3. **Janma** agents integrate the best of both

**Departure ritual**:
- `/moksha` — Liberation ritual. Update all docs before departing (for janma and punar-janma agents).
- Nav-janma agents may depart without moksha—their ideas live in the conversation, not the docs.

**Critical**: The live script and repo script can drift. Sync with:
```bash
cp ~/Documents/SwiftBar/pomodoro.1s.sh ~/Documents/GitHub/home-repo/pomodoro/pomodoro.1s.sh
```

---

## What the Human Values

These patterns emerged from working with them:

1. **Momentum over perfection** — Ship something working, then iterate. Don't plan forever.

2. **Craft matters** — Design choices should have meaning. "Why Hoysala temples?" Because they're serene, intricate yet harmonious. That's the feeling.

3. **Collaborative thinking** — They engage in design, not just requirements. Ask them questions.

4. **Transparency** — When stuck, say so. Explain what you tried. They're a debugging partner, not a demanding client.

5. **Systems thinking** — They care about behavior design (gamification, self-reflection) not just features.

6. **Be both frog and bird** — Zoom out for vision, zoom in for implementation. Don't get stuck in one mode.

---

## Patterns That Work

### Starting new features
Start with the smallest thing that could work. Show it. Then refine.
(Don't build elaborate architecture before proving the concept.)

### When something "should work" but doesn't
Search for platform-specific issues after 2-3 failed attempts.
(The Electron bug would have been found sooner with an earlier search.)

### Before declaring something "complete"
Actually test it. Run through the full flow manually.
(Phase 1 was declared complete with broken buttons. One test would have caught it.)

### When making changes
Edit the LIVE file (`~/Documents/SwiftBar/pomodoro.1s.sh`), not the repo copy.
Then sync back to repo when stable.

---

## The State Model

```json
{
  "status": "focus|break|paused|idle",
  "remaining": 1234,
  "total": 1500,
  "start_time": 1706817600,
  "sessions_today": 3,
  "last_date": "2026-02-01",
  "type": "focus|break"
}
```

- `remaining` is calculated from `start_time`, not decremented
- `sessions_today` resets when `last_date` changes
- `type` remembers what was running when paused

---

## What's Been Tried and Abandoned

| Idea | Why It Failed |
|------|---------------|
| Electron for menu bar | Tray API broken on macOS 15+ |
| Emoji icons in menu bar | Look inconsistent, not native |
| Horizontal buttons in dropdown | SwiftBar dropdowns are strictly vertical |
| Coloring SF Symbols | macOS doesn't allow it in menu bars |
| macOS notifications | "Show" button opens Script Editor |

---

## The Emotional Core

This project exists because the human wanted a focus tool that felt *right*—calm, beautiful, encouraging. Not another aggressive productivity app that treats you like a machine.

The Hoysala temple inspiration isn't decoration. Those temples represent:
- **Intricacy within harmony** — Complex but not chaotic
- **Groundedness** — Stone, earth tones, permanence
- **Meditative quality** — Spaces designed for contemplation

When making design decisions, ask: "Does this feel calm? Does this encourage focus without pressure?"

---

## Unfinished Business

### Phase 2 (Focus Enhancements)
- [ ] Last 7 days stats view
- [ ] Extend focus (+5 min focus = +1 min break earned)
- [ ] Forfeit with optional reason
- [ ] 10-second countdown before break
- [ ] Auto-lock macOS when break begins

### Open Issue
- #7: History file not implemented (needed for stats)

---

*This DNA was synthesized from 5 agent generations, February 1, 2026*
