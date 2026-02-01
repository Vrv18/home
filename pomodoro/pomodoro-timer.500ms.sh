#!/bin/bash

# Pomodoro Timer - TIMER DISPLAY (Click to Toggle)
# Part 1 of 2: Shows time, click to start/pause/resume

# Configuration
FOCUS_DURATION=1500      # 25 minutes in seconds

# State file (shared with menu plugin)
STATE_DIR="$HOME/.pomodoro"
STATE_FILE="$STATE_DIR/state.json"

# Ensure state directory exists
mkdir -p "$STATE_DIR"

# Script path
SCRIPT_PATH="$0"

# Default state
DEFAULT_STATE='{"status":"idle","remaining":1500,"total":1500,"sessions_today":0,"last_date":"","type":"focus"}'

# Initialize state file if it doesn't exist
if [ ! -f "$STATE_FILE" ]; then
    echo "$DEFAULT_STATE" > "$STATE_FILE"
fi

# Read current state with JSON error handling
STATE=$(cat "$STATE_FILE")
if ! echo "$STATE" | /usr/bin/python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
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

# Calculate accurate remaining time from start_time
if [ "$STATUS" == "focus" ] || [ "$STATUS" == "break" ]; then
    if [ "$START_TIME" -gt 0 ] 2>/dev/null; then
        NOW=$(date +%s)
        ELAPSED=$((NOW - START_TIME))
        REMAINING=$((TOTAL - ELAPSED))
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

# SF Symbols - all circle-based for consistent width
get_sf_symbol() {
    case "$1" in
        "focus")  echo "circle.fill" ;;           # Active/recording (filled circle)
        "break")  echo "moon.circle.fill" ;;      # Rest/break
        "paused") echo "pause.circle" ;;          # Paused
        *)        echo "play.circle" ;;           # Idle - ready to start
    esac
}

# Colors
WHITE="#FFFFFF"
DIMMED="#AAAAAA"

get_color() {
    case "$1" in
        "paused") echo "$DIMMED" ;;
        *)        echo "$WHITE" ;;
    esac
}

# === MENU BAR: Icon only (click to toggle) ===
SF_SYMBOL=$(get_sf_symbol "$STATUS")
COLOR=$(get_color "$STATUS")

if [ "$STATUS" == "idle" ]; then
    # Idle: dimmed icon, click to start
    echo "| sfimage=$SF_SYMBOL sfsize=14 color=$DIMMED bash=\"$SCRIPT_PATH\" param1=toggle terminal=false refresh=true"
elif [ "$STATUS" == "paused" ]; then
    # Paused: dimmed icon, click to resume
    echo "| sfimage=$SF_SYMBOL sfsize=14 color=$COLOR sfweight=light bash=\"$SCRIPT_PATH\" param1=toggle terminal=false refresh=true"
else
    # Running: bright icon, click to pause
    echo "| sfimage=$SF_SYMBOL sfsize=14 color=$COLOR bash=\"$SCRIPT_PATH\" param1=toggle terminal=false refresh=true"
fi

# Handle toggle command
if [ "$1" == "toggle" ]; then
    if [ "$STATUS" == "idle" ]; then
        echo "{\"status\":\"focus\",\"remaining\":$FOCUS_DURATION,\"total\":$FOCUS_DURATION,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"focus\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
    elif [ "$STATUS" == "paused" ]; then
        echo "{\"status\":\"$TYPE\",\"remaining\":$REMAINING,\"total\":$REMAINING,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"$TYPE\",\"start_time\":$(date +%s)}" > "$STATE_FILE"
    else
        echo "{\"status\":\"paused\",\"remaining\":$REMAINING,\"total\":$TOTAL,\"sessions_today\":$SESSIONS,\"last_date\":\"$TODAY\",\"type\":\"$TYPE\"}" > "$STATE_FILE"
    fi
fi
