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

# Ensure state directory exists
mkdir -p "$STATE_DIR"

# Script path (properly quoted for paths with spaces)
SCRIPT_PATH="$0"

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

# Menu bar display with SF Symbol - click to toggle (start/pause/resume)
SF_SYMBOL=$(get_sf_symbol "$STATUS")
COLOR=$(get_color "$STATUS")

if [ "$STATUS" == "idle" ]; then
    # Show 25:00 greyed out, click to start
    echo "$(format_time $FOCUS_DURATION) | sfimage=$SF_SYMBOL color=$DIMMED bash=\"$SCRIPT_PATH\" param1=toggle terminal=false refresh=true"
elif [ "$STATUS" == "paused" ]; then
    TIME_STR=$(format_time $REMAINING)
    # Paused: dimmed text + lighter weight symbol, click to resume
    echo "$TIME_STR | sfimage=$SF_SYMBOL color=$COLOR sfweight=light bash=\"$SCRIPT_PATH\" param1=toggle terminal=false refresh=true"
else
    TIME_STR=$(format_time $REMAINING)
    # Running: click to pause
    echo "$TIME_STR | sfimage=$SF_SYMBOL color=$COLOR bash=\"$SCRIPT_PATH\" param1=toggle terminal=false refresh=true"
fi

echo "---"

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
elif [ "$STATUS" == "focus" ] || [ "$STATUS" == "break" ]; then
    echo "Pause | sfimage=pause.fill color=$ACTION_BLUE size=15 bash=\"$SCRIPT_PATH\" param1=pause terminal=false refresh=true"
    echo "Forfeit | sfimage=xmark.circle color=$ACTION_RED size=15 bash=\"$SCRIPT_PATH\" param1=forfeit terminal=false refresh=true"
elif [ "$STATUS" == "paused" ]; then
    echo "Resume | sfimage=play.fill color=$ACTION_GREEN size=15 bash=\"$SCRIPT_PATH\" param1=resume terminal=false refresh=true"
    echo "Forfeit | sfimage=xmark.circle color=$ACTION_RED size=15 bash=\"$SCRIPT_PATH\" param1=forfeit terminal=false refresh=true"
fi
echo "---"
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
        echo "{\"status\":\"idle\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\"}" > "$STATE_FILE"
        ;;
    "reset")
        echo "{\"status\":\"idle\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":0,\"last_date\":\"$TODAY\",\"type\":\"focus\"}" > "$STATE_FILE"
        ;;
    *)
        # Check for timer completion (remaining is calculated from start_time above, no decrementing needed)
        if [ "$STATUS" == "focus" ] || [ "$STATUS" == "break" ]; then
            if [ $REMAINING -le 0 ]; then
                # Timer complete!
                if [ "$STATUS" == "focus" ]; then
                    NEW_SESSIONS=$((SESSIONS + 1))
                    # Determine break type (long break every 4 sessions)
                    if [ $((NEW_SESSIONS % SESSIONS_FOR_LONG)) -eq 0 ]; then
                        BREAK_DUR=$LONG_BREAK
                    else
                        BREAK_DUR=$SHORT_BREAK
                    fi
                    echo "{\"status\":\"break\",\"remaining\":$BREAK_DUR,\"total\":$BREAK_DUR,\"sessions_today\":$NEW_SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"break\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
                else
                    # Break complete
                    echo "{\"status\":\"idle\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\"}" > "$STATE_FILE"
                fi
            fi
        fi
        ;;
esac
