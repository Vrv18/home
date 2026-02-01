#!/bin/bash

# Pomodoro Timer for SwiftBar
# Hoysala-inspired minimal design

# Configuration
FOCUS_DURATION=1500      # 25 minutes in seconds
SHORT_BREAK=300          # 5 minutes
LONG_BREAK=900           # 15 minutes
SESSIONS_FOR_LONG=4      # Long break after 4 sessions

# State file
STATE_DIR="$HOME/.pomodoro"
STATE_FILE="$STATE_DIR/state.json"
HISTORY_FILE="$STATE_DIR/history.json"

# Break Sanctuary app
# The app is installed alongside the plugin in ~/Documents/SwiftBar/
SWIFTBAR_DIR="$HOME/Documents/SwiftBar"
BREAK_SANCTUARY_APP="$SWIFTBAR_DIR/Break Sanctuary.app"
# Fallback to dev mode (npm run break) if app not found
POMODORO_PROJECT="$HOME/Documents/GitHub/home-repo/pomodoro"
BREAK_SCREEN_ENABLED=true

# Ensure state directory exists
mkdir -p "$STATE_DIR"

# Script path (properly quoted for paths with spaces)
SCRIPT_PATH="$0"

# Launch the break sanctuary screen
launch_break_screen() {
    if [ "$BREAK_SCREEN_ENABLED" != true ]; then
        return
    fi
    
    # Try standalone app first (installed version)
    if [ -d "$BREAK_SANCTUARY_APP" ]; then
        open "$BREAK_SANCTUARY_APP" &
        return
    fi
    
    # Fallback to dev mode (npm run break)
    if [ -d "$POMODORO_PROJECT" ] && [ -f "$POMODORO_PROJECT/src/break-screen/main.js" ]; then
        cd "$POMODORO_PROJECT" && npm run break >/dev/null 2>&1 &
    fi
}

# Update history file with session data
# Usage: update_history <type> [minutes]
#   type: "completed" or "forfeited"
#   minutes: focus minutes completed (only for "completed" type)
update_history() {
    local TYPE="$1"
    local MINUTES="${2:-0}"
    local TODAY=$(date +%Y-%m-%d)
    
    # Initialize history file if it doesn't exist
    if [ ! -f "$HISTORY_FILE" ]; then
        echo '{"sessions":[]}' > "$HISTORY_FILE"
    fi
    
    # Read and update history using Python for reliable JSON handling
    /usr/bin/python3 << PYTHON_EOF
import json
import os

history_file = "$HISTORY_FILE"
today = "$TODAY"
update_type = "$TYPE"
minutes = int("$MINUTES") if "$MINUTES" else 0

# Read current history
try:
    with open(history_file, 'r') as f:
        history = json.load(f)
except (json.JSONDecodeError, FileNotFoundError):
    history = {"sessions": []}

# Ensure sessions list exists
if "sessions" not in history:
    history["sessions"] = []

# Find today's entry or create it
today_entry = None
for session in history["sessions"]:
    if session.get("date") == today:
        today_entry = session
        break

if today_entry is None:
    today_entry = {
        "date": today,
        "completed": 0,
        "forfeited": 0,
        "total_focus_minutes": 0
    }
    history["sessions"].append(today_entry)

# Update based on type
if update_type == "completed":
    today_entry["completed"] = today_entry.get("completed", 0) + 1
    today_entry["total_focus_minutes"] = today_entry.get("total_focus_minutes", 0) + minutes
elif update_type == "forfeited":
    today_entry["forfeited"] = today_entry.get("forfeited", 0) + 1

# Keep only last 30 days of history to prevent unbounded growth
history["sessions"] = sorted(history["sessions"], key=lambda x: x["date"], reverse=True)[:30]

# Write back
with open(history_file, 'w') as f:
    json.dump(history, f, indent=2)
PYTHON_EOF
}

# Default state for initialization or recovery
DEFAULT_STATE='{"status":"idle","remaining":1500,"total":1500,"sessions_today":0,"last_date":"","type":"focus"}'

# Initialize state file if it doesn't exist
if [ ! -f "$STATE_FILE" ]; then
    echo "$DEFAULT_STATE" > "$STATE_FILE"
fi

# Read current state with JSON error handling (#9)
STATE=$(cat "$STATE_FILE")
if ! echo "$STATE" | /usr/bin/python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
    # JSON is corrupted - reset to default state
    echo "$DEFAULT_STATE" > "$STATE_FILE"
    STATE="$DEFAULT_STATE"
fi

STATUS=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','idle'))")
REMAINING=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('remaining',1500))")
TOTAL=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('total',1500))")
SESSIONS=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sessions_today',0))")
LAST_DATE=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('last_date',''))")
TYPE=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('type','focus'))")
START_TIME=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('start_time',0))")
EARNED_BREAK=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('earned_break',0))")
EXTENSIONS=$(echo "$STATE" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('extensions',0))")

# Calculate accurate remaining time from start_time (fixes timer drift)
if [ "$STATUS" == "focus" ] || [ "$STATUS" == "break" ]; then
    if [ "$START_TIME" -gt 0 ] 2>/dev/null; then
        NOW=$(date +%s)
        ELAPSED=$((NOW - START_TIME))
        REMAINING=$((TOTAL - ELAPSED))
        # Clamp to 0 if negative
        if [ $REMAINING -lt 0 ]; then
            REMAINING=0
        fi
    fi
fi

# Reset sessions if new day
TODAY=$(date +%Y-%m-%d)
if [ "$LAST_DATE" != "$TODAY" ]; then
    SESSIONS=0
fi

# Format time as MM:SS
format_time() {
    local secs=$1
    printf "%02d:%02d" $((secs / 60)) $((secs % 60))
}

# SF Symbols for menu bar icon
get_sf_symbol() {
    case "$1" in
        "focus")  echo "scope" ;;           # Focus - target/aim
        "break")  echo "leaf.fill" ;;       # Break - rest/nature
        "paused") echo "pause.circle" ;;    # Paused (outline, not filled)
        *)        echo "circle.dashed" ;;   # Idle - ready state
    esac
}

# Colors
WHITE="#FFFFFF"
DIMMED="#AAAAAA"      # Medium gray - visible on dark, dimmer than white
SAGE="#7A9A6D"        # Softer green for break (dropdown)
STONE="#666666"       # Neutral gray for dropdown
EARTH="#4A4238"

# Menu bar color based on state
get_color() {
    case "$1" in
        "paused") echo "$DIMMED" ;;   # Dimmed when paused
        *)        echo "$WHITE" ;;    # Bright white when active
    esac
}

# Menu bar display - time only (icon is handled by pomodoro-timer.1s.sh)
# Using monospace font to prevent width changes as digits change
COLOR=$(get_color "$STATUS")

if [ "$STATUS" == "idle" ]; then
    echo "$(format_time $FOCUS_DURATION) | color=$DIMMED size=13 font=Menlo"
elif [ "$STATUS" == "paused" ]; then
    TIME_STR=$(format_time $REMAINING)
    echo "$TIME_STR | color=$DIMMED size=13 font=Menlo"
else
    TIME_STR=$(format_time $REMAINING)
    echo "$TIME_STR | color=$COLOR size=13 font=Menlo"
fi
echo "---"

# Stats Visualization (The Mirror)
# Generates a sparkline of the last 7 days
STATS_VIEW=$(/usr/bin/python3 << PYTHON_EOF
import json
import datetime
import os
import sys

history_file = "$HISTORY_FILE"
try:
    with open(history_file, 'r') as f:
        history = json.load(f)
except (json.JSONDecodeError, FileNotFoundError):
    history = {"sessions": []}

# Process history into a dict day -> count
sessions_map = {}
for s in history.get("sessions", []):
    sessions_map[s["date"]] = s.get("completed", 0)

# Last 7 days
today = datetime.date.today()
days = []
counts = []
labels = []
max_count = 0

for i in range(6, -1, -1):
    day = today - datetime.timedelta(days=i)
    fmt_date = day.isoformat()
    count = sessions_map.get(fmt_date, 0)
    days.append(day)
    counts.append(count)
    if count > max_count:
        max_count = count
    
    # Label: Mon, Tue...
    labels.append(day.strftime("%a")[0]) # First letter

# Sparkline logic
# Blocks:  ▂ ▃ ▄ ▅ ▆ ▇ █
blocks = [" ", " ", "▂", "▃", "▄", "▅", "▆", "▇", "█"]
sparkline = ""

if max_count == 0:
    sparkline = "       " # 7 spaces
else:
    for c in counts:
        if c == 0:
            sparkline += "_"
        else:
            # Normalize to 1-8 scale (index 1-8 in blocks)
            # 0 is handled by "_"
            idx = int((c / max_count) * 8)
            if idx == 0 and c > 0: idx = 1 # Show at least something if count > 0
            if idx > 8: idx = 8
            sparkline += blocks[idx]

# Get today's stats
today_str = today.isoformat()
today_completed = sessions_map.get(today_str, 0)
today_minutes = 0
for s in history.get("sessions", []):
    if s["date"] == today_str:
        today_minutes = s.get("total_focus_minutes", 0)
        break

# Week totals
week_sessions = sum(counts)
week_minutes = 0
for s in history.get("sessions", []):
    if s["date"] in [d.isoformat() for d in days]:
        week_minutes += s.get("total_focus_minutes", 0)

# Output SwiftBar format
# Today's progress (most important)
if today_completed > 0:
    hrs = today_minutes // 60
    mins = today_minutes % 60
    if hrs > 0:
        time_str = f"{hrs}h {mins}m"
    else:
        time_str = f"{mins} min"
    print(f"Today: {today_completed} sessions • {time_str} | size=13")
else:
    print("Today: No sessions yet | size=13 color=#8E8E93")

# Sparkline header
print("---")
print("Last 7 Days | size=11 color=#8E8E93")
# Chart line (sparkline)
print(f"{''.join(labels)} | font='Menlo' size=10 trim=false")
print(f"{sparkline} | font='Menlo' size=10 trim=false")

# Week summary (subtle)
if week_sessions > 0:
    w_hrs = week_minutes // 60
    w_mins = week_minutes % 60
    if w_hrs > 0:
        w_time = f"{w_hrs}h {w_mins}m"
    else:
        w_time = f"{w_mins} min"
    print(f"Week: {week_sessions} sessions • {w_time} | size=10 color=#8E8E93")
print("---")
PYTHON_EOF
)

# Output Stats View
echo "$STATS_VIEW"

# Dropdown header - only show when timer is active
if [ "$STATUS" == "focus" ]; then
    echo "Focusing — $(format_time $REMAINING) | size=14"
    echo "---"
elif [ "$STATUS" == "break" ]; then
    echo "Break — $(format_time $REMAINING) | color=$SAGE size=14"
    echo "---"
elif [ "$STATUS" == "paused" ]; then
    echo "Paused — $(format_time $REMAINING) | color=$DIMMED size=14"
    echo "---"
fi

# Button colors
ACTION_GREEN="#34C759"   # Start, Resume
ACTION_RED="#FF3B30"     # Forfeit
ACTION_BLUE="#007AFF"    # Pause
ACTION_GRAY="#8E8E93"    # Reset

# Controls - only show what's needed per state
if [ "$STATUS" == "idle" ]; then
    echo "Start | sfimage=play.fill color=$ACTION_GREEN size=15 bash=\"$SCRIPT_PATH\" param1=start terminal=false refresh=true"
    echo "-- 15 min | bash=\"$SCRIPT_PATH\" param1=start param2=15 terminal=false refresh=true"
    echo "-- 5 min | bash=\"$SCRIPT_PATH\" param1=start param2=5 terminal=false refresh=true"
    echo "Reset | sfimage=arrow.counterclockwise color=$ACTION_GRAY size=15 bash=\"$SCRIPT_PATH\" param1=reset terminal=false refresh=true"
elif [ "$STATUS" == "focus" ]; then
    echo "Pause | sfimage=pause.fill color=$ACTION_BLUE size=15 bash=\"$SCRIPT_PATH\" param1=pause terminal=false refresh=true"
    # Extend focus: +5 min focus = +1 min break (max 5 extensions = +25 min focus, +5 min break)
    if [ "$EXTENSIONS" -lt 5 ] 2>/dev/null; then
        EARNED_MIN=$((EARNED_BREAK / 60))
        if [ "$EARNED_MIN" -gt 0 ]; then
            echo "Extend +5 min (+${EARNED_MIN}m break earned) | sfimage=plus.circle color=#FF9500 size=15 bash=\"$SCRIPT_PATH\" param1=extend terminal=false refresh=true"
        else
            echo "Extend +5 min | sfimage=plus.circle color=#FF9500 size=15 bash=\"$SCRIPT_PATH\" param1=extend terminal=false refresh=true"
        fi
    else
        echo "Extended +25 min (+5m break) | color=$ACTION_GRAY size=13"
    fi
    echo "Forfeit | sfimage=xmark.circle color=$ACTION_RED size=15 bash=\"$SCRIPT_PATH\" param1=forfeit terminal=false refresh=true"
elif [ "$STATUS" == "break" ]; then
    echo "Pause | sfimage=pause.fill color=$ACTION_BLUE size=15 bash=\"$SCRIPT_PATH\" param1=pause terminal=false refresh=true"
    echo "Forfeit | sfimage=xmark.circle color=$ACTION_RED size=15 bash=\"$SCRIPT_PATH\" param1=forfeit terminal=false refresh=true"
elif [ "$STATUS" == "paused" ]; then
    echo "Resume | sfimage=play.fill color=$ACTION_GREEN size=15 bash=\"$SCRIPT_PATH\" param1=resume terminal=false refresh=true"
    echo "Forfeit | sfimage=xmark.circle color=$ACTION_RED size=15 bash=\"$SCRIPT_PATH\" param1=forfeit terminal=false refresh=true"
fi
echo "---"
# Calm mode - launch the break sanctuary
if [ "$BREAK_SCREEN_ENABLED" = true ]; then
    if [ "$STATUS" == "break" ]; then
        # During a break, open the full-screen sanctuary
        echo "Open Sanctuary | sfimage=leaf.fill color=$SAGE size=15 bash=\"$SCRIPT_PATH\" param1=open_sanctuary terminal=false"
    else
        # When idle or in focus, offer calm mode as a quick mental reset
        echo "Calm Mode | sfimage=sparkles color=#8B7355 size=15 bash=\"$SCRIPT_PATH\" param1=calm_mode terminal=false"
        echo "-- 1 min | bash=\"$SCRIPT_PATH\" param1=calm_mode param2=1 terminal=false"
        echo "-- 3 min | bash=\"$SCRIPT_PATH\" param1=calm_mode param2=3 terminal=false"
        echo "-- 5 min | bash=\"$SCRIPT_PATH\" param1=calm_mode param2=5 terminal=false"
    fi
fi
echo "---"
echo "About | sfimage=info.circle color=#8E8E93 size=13 bash=\"$SCRIPT_PATH\" param1=about terminal=false"
echo "Quit SwiftBar | bash='pkill' param1='-x' param2='SwiftBar' terminal=false"

# Handle commands
case "$1" in
    "toggle")
        # Smart toggle: idle→start, running→pause, paused→resume
        if [ "$STATUS" == "idle" ]; then
            echo "{\"status\":\"focus\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
        elif [ "$STATUS" == "paused" ]; then
            echo "{\"status\":\"$TYPE\",\"remaining\":$REMAINING,\"total\":$REMAINING,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"$TYPE\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
        else
            echo "{\"status\":\"paused\",\"remaining\":$REMAINING,\"total\":$TOTAL,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"$TYPE\"}" > "$STATE_FILE"
        fi
        ;;
    "start")
        DURATION=${2:-25}
        SECS=$((DURATION * 60))
        echo "{\"status\":\"focus\",\"remaining\":$SECS,\"total\":$SECS,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
        ;;
    "pause")
        echo "{\"status\":\"paused\",\"remaining\":$REMAINING,\"total\":$TOTAL,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"$TYPE\"}" > "$STATE_FILE"
        ;;
    "resume")
        # Set total to remaining so start_time calculation works correctly after pause
        echo "{\"status\":\"$TYPE\",\"remaining\":$REMAINING,\"total\":$REMAINING,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"$TYPE\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
        ;;
    "forfeit")
        # Track forfeited session in history (only if we were in focus, not break)
        if [ "$TYPE" == "focus" ] && [ "$STATUS" != "idle" ]; then
            update_history "forfeited"
        fi
        echo "{\"status\":\"idle\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\"}" > "$STATE_FILE"
        ;;
    "extend")
        # Extend focus by 5 minutes, earn 1 minute of break (max 5 extensions)
        if [ "$STATUS" == "focus" ] && [ "$EXTENSIONS" -lt 5 ] 2>/dev/null; then
            NEW_TOTAL=$((TOTAL + 300))  # +5 minutes
            NEW_EARNED=$((EARNED_BREAK + 60))  # +1 minute break
            NEW_EXT=$((EXTENSIONS + 1))
            echo "{\"status\":\"focus\",\"remaining\":$NEW_TOTAL,\"total\":$NEW_TOTAL,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\",\"start_time\":$START_TIME,\"earned_break\":$NEW_EARNED,\"extensions\":$NEW_EXT}" > "$STATE_FILE"
        fi
        ;;
    "reset")
        echo "{\"status\":\"idle\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":0,\"last_date\":\"$TODAY\",\"type\":\"focus\"}" > "$STATE_FILE"
        ;;
    "preview_break")
        # Create a temporary break state for preview (30 seconds)
        PREVIEW_DUR=30
        echo "{\"status\":\"break\",\"remaining\":$PREVIEW_DUR,\"total\":$PREVIEW_DUR,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"break\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
        launch_break_screen
        ;;
    "calm_mode")
        # Enter calm mode - a standalone sanctuary moment (doesn't affect timer)
        CALM_MINUTES=${2:-2}
        CALM_SECS=$((CALM_MINUTES * 60))
        # Save current state to restore after
        cp "$STATE_FILE" "$STATE_DIR/state_backup.json" 2>/dev/null || true
        # Create calm mode state
        echo "{\"status\":\"break\",\"remaining\":$CALM_SECS,\"total\":$CALM_SECS,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"calm\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
        launch_break_screen
        # Note: state will be restored when break screen reads non-break status or closes
        ;;
    "open_sanctuary")
        # Open the sanctuary during an existing break
        launch_break_screen
        ;;
    "about")
        # Show info dialog
        osascript -e 'display dialog "Pomodoro Timer

Click the timer to start/pause/resume.

During focus:
• Extend +5 min to earn +1 min break (max 5x)
• Forfeit to end early

Break Sanctuary launches automatically when focus completes.

Calm Mode: Enter stillness anytime.

Inspired by Hoysala temple serenity." with title "Pomodoro Timer" buttons {"OK"} default button "OK" with icon note' 2>/dev/null &
        ;;
    *)
        # Check for timer completion (remaining is calculated from start_time above, no decrementing needed)
        if [ "$STATUS" == "focus" ] || [ "$STATUS" == "break" ]; then
            if [ $REMAINING -le 0 ]; then
                # Timer complete!
                if [ "$STATUS" == "focus" ]; then
                    NEW_SESSIONS=$((SESSIONS + 1))
                    # Calculate focus minutes completed and record in history
                    FOCUS_MINUTES=$((TOTAL / 60))
                    update_history "completed" "$FOCUS_MINUTES"
                    # Determine break type (long break every 4 sessions)
                    if [ $((NEW_SESSIONS % SESSIONS_FOR_LONG)) -eq 0 ]; then
                        BREAK_DUR=$LONG_BREAK
                    else
                        BREAK_DUR=$SHORT_BREAK
                    fi
                    # Add earned break time from extensions
                    if [ "$EARNED_BREAK" -gt 0 ] 2>/dev/null; then
                        BREAK_DUR=$((BREAK_DUR + EARNED_BREAK))
                    fi
                    echo "{\"status\":\"break\",\"remaining\":$BREAK_DUR,\"total\":$BREAK_DUR,\"sessions_today\":$NEW_SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"break\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
                    # Launch the break sanctuary
                    launch_break_screen
                else
                    # Break complete
                    echo "{\"status\":\"idle\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\"}" > "$STATE_FILE"
                fi
            fi
        fi
        ;;
esac
