# Agent Handoff

## Overview
Prepare a thorough handoff before ending your session. Update all documentation so the next agent can continue seamlessly.

## Steps

1. **Update ISSUES.md**
   - Mark resolved issues with `[x]` and one-line fix summary
   - Add any new issues discovered (with severity)
   - Move fully resolved items to "Resolved" section if needed

2. **Update HANDOFF.md**
   - Add a new "Session Notes" section at the bottom
   - Document what you worked on
   - Note key decisions and why
   - Record anything that didn't work (save next agent time)

3. **Update HUMAN-INSTRUCTIONS.md**
   - Add pending actions for the human
   - Mark completed items as done
   - Note any decisions that need human input

4. **Update PLAN.md**
   - Mark completed Phase items with `[x]`
   - Add any new tasks discovered

5. **Sync SwiftBar script**
   ```bash
   cp ~/Documents/SwiftBar/pomodoro.1s.sh ~/Documents/GitHub/home-repo/pomodoro/pomodoro.1s.sh
   ```

6. **Provide summary to user**
   - What was accomplished
   - What's still pending
   - Suggested next priorities
