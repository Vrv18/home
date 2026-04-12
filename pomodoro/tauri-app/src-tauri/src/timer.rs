use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Idle,
    Focus,
    Break,
    Paused,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TimerType {
    Focus,
    Break,
    Calm,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub status: Status,
    pub remaining: u64,  // seconds
    pub total: u64,
    pub sessions_today: u32,
    pub last_date: String,
    #[serde(rename = "type")]
    pub timer_type: TimerType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start_time: Option<u64>,  // Unix timestamp
    #[serde(default)]
    pub earned_break: u64,
    #[serde(default)]
    pub extensions: u8,
    #[serde(default)]
    pub last_micro_break: u64,  // Track last micro-break timestamp (elapsed seconds into session)
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            status: Status::Idle,
            remaining: 1500,  // 25 minutes
            total: 1500,
            sessions_today: 0,
            last_date: String::new(),
            timer_type: TimerType::Focus,
            start_time: None,
            earned_break: 0,
            extensions: 0,
            last_micro_break: 0,
        }
    }
}

impl TimerState {
    /// Calculate actual remaining time based on start_time (prevents drift)
    /// Returns Some((completed, minutes)) if a session just finished
    /// Returns Some((false, 0)) if micro-break should trigger
    pub fn calculate_remaining(&mut self, is_offline_check: bool) -> Option<(bool, u32)> {
        self.check_date_reset();
        
        // Safety: If we are in Focus/Break but have no start time, this is an invalid state (e.g. from bad save).
        if (self.status == Status::Focus || self.status == Status::Break) && self.start_time.is_none() {
            self.reset();
            return None;
        }

        let mut result = None;
        if let Some(start) = self.start_time {
            if self.status == Status::Focus || self.status == Status::Break {
                let now = current_timestamp();
                // If start time is in the future (clock skew), reset
                if now < start {
                    self.reset();
                    return None;
                }
                
                let elapsed = now.saturating_sub(start);
                
                if elapsed >= self.total {
                    // Time is up
                    self.remaining = 0;
                    let minutes = (self.total / 60) as u32;
                    let completed = self.timer_type == TimerType::Focus;
                    
                    if is_offline_check {
                        // If we just launched and time is up, don't show window, just reset path
                        self.reset(); 
                    } else {
                        self.finish_session();
                        result = Some((completed, minutes));
                    }
                } else {
                    self.remaining = self.total.saturating_sub(elapsed);
                }
            }
        }
        result
    }
    
    /// Check if micro-break should trigger (every 5 minutes during focus)
    /// Returns true if a micro-break should be shown
    pub fn should_trigger_micro_break(&mut self) -> bool {
        if self.status != Status::Focus || self.timer_type != TimerType::Focus {
            return false;
        }
        
        if let Some(start) = self.start_time {
            let now = current_timestamp();
            let elapsed = now.saturating_sub(start);
            
            // Trigger every 5 minutes (300 seconds)
            let current_interval = elapsed / 300;
            let last_interval = self.last_micro_break / 300;
            
            // Only trigger if we've crossed into a new 5-minute interval
            // and we're not in the last 30 seconds of the session (to avoid overlap with full break)
            if current_interval > last_interval && self.remaining > 30 {
                self.last_micro_break = elapsed;
                return true;
            }
        }
        
        false
    }

    fn check_date_reset(&mut self) {
        let today = self.get_today_string();
        if self.last_date != today {
            self.last_date = today;
            self.sessions_today = 0;
        }
    }

    fn get_today_string(&self) -> String {
        chrono::Local::now().format("%Y-%m-%d").to_string()
    }

    fn finish_session(&mut self) {
        match self.timer_type {
            TimerType::Focus => {
                self.sessions_today += 1;
                // Transition to break or idle
                self.status = Status::Idle; // For now. Later Phase 3 will trigger Sanctuary
                self.start_time = None;
                self.remaining = 300; // Suggest 5m break
                self.total = 300;
                self.timer_type = TimerType::Break;
            }
            _ => {
                self.status = Status::Idle;
                self.start_time = None;
                self.remaining = 1500;
                self.total = 1500;
                self.timer_type = TimerType::Focus;
            }
        }
    }

    /// Toggle between start/pause/resume based on current status
    pub fn toggle(&mut self) {
        match self.status {
            Status::Idle => self.start_focus(1500),
            Status::Paused => self.resume(),
            _ => self.pause(),
        }
    }

    pub fn start_focus(&mut self, duration: u64) {
        self.status = Status::Focus;
        self.timer_type = TimerType::Focus;
        self.total = duration;
        self.remaining = duration;
        self.start_time = Some(current_timestamp());
        self.last_micro_break = 0; // Reset micro-break tracker
    }

    pub fn start_break(&mut self, duration: u64) {
        self.status = Status::Break;
        self.timer_type = TimerType::Break;
        self.total = duration;
        self.remaining = duration;
        self.start_time = Some(current_timestamp());
    }

    pub fn forfeit(&mut self) {
        self.status = Status::Idle;
        self.start_time = None;
        self.remaining = 1500;
        self.total = 1500;
    }

    pub fn reset(&mut self) {
        self.status = Status::Idle;
        self.start_time = None;
        self.remaining = 1500;
        self.total = 1500;
    }

    fn pause(&mut self) {
        self.calculate_remaining(false);
        self.status = Status::Paused;
        self.start_time = None;
    }

    fn resume(&mut self) {
        self.status = match self.timer_type {
            TimerType::Focus => Status::Focus,
            TimerType::Break | TimerType::Calm => Status::Break,
        };
        // Accurate resume: subtract consumed time from total
        self.start_time = Some(current_timestamp());
        self.total = self.remaining; 
    }

    /// Format remaining time as Monospace Unicode MM:SS
    pub fn format_time(&self) -> String {
        let mins = self.remaining / 60;
        let secs = self.remaining % 60;
        let time_str = format!("{:02}:{:02}", mins, secs);
        convert_to_active_monospace(&time_str)
    }

    /// Get Unicode Symbol based on status for Menu Bar text
    pub fn get_icon(&self) -> &'static str {
        match self.status {
            Status::Focus => "⦿",    // Circled Bullet
            Status::Break => "🪷",    // Lotus
            Status::Paused => "⏸",   // Pause
            Status::Idle => "○",     // Circle
        }
    }

    /// Get color based on status (for UI)
    pub fn get_color(&self) -> &'static str {
        match self.status {
            Status::Paused => "#AAAAAA",  // Dimmed
            _ => "#FFFFFF",               // White
        }
    }
}

fn convert_to_active_monospace(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            '0' => '𝟶',
            '1' => '𝟷',
            '2' => '𝟸',
            '3' => '𝟹',
            '4' => '𝟺',
            '5' => '𝟻',
            '6' => '𝟼',
            '7' => '𝟽',
            '8' => '𝟾',
            '9' => '𝟿',
            ':' => ':',
            _ => c,
        })
        .collect()
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_state() {
        let state = TimerState::default();
        assert_eq!(state.status, Status::Idle);
        assert_eq!(state.remaining, 1500);
        assert_eq!(state.sessions_today, 0);
    }

    #[test]
    fn test_finish_focus_session() {
        let mut state = TimerState::default();
        state.timer_type = TimerType::Focus;
        state.finish_session();
        assert_eq!(state.sessions_today, 1);
        assert_eq!(state.status, Status::Idle);
        assert_eq!(state.timer_type, TimerType::Break);
        assert_eq!(state.remaining, 300);
    }

    #[test]
    fn test_date_reset() {
        let mut state = TimerState {
            sessions_today: 5,
            last_date: "2020-01-01".to_string(),
            ..Default::default()
        };
        state.check_date_reset(); // Should reset if today is not 2020-01-01
        assert_eq!(state.sessions_today, 0);
        assert!(state.last_date != "2020-01-01");
    }

    #[test]
    fn test_auto_finish_in_calculate_remaining() {
        let mut state = TimerState {
            status: Status::Focus,
            timer_type: TimerType::Focus,
            remaining: 1,
            total: 1500,
            start_time: Some(current_timestamp() - 1500),
            ..Default::default()
        };
        let result = state.calculate_remaining();
        assert!(result.is_some());
        let (completed, minutes) = result.unwrap();
        assert!(completed);
        assert_eq!(minutes, 25);
        assert_eq!(state.status, Status::Idle);
    }
}
