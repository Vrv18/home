use std::fs;
use std::path::PathBuf;
use crate::timer::TimerState;
use chrono;
use serde::{Serialize, Deserialize};

pub fn get_pomodoro_dir() -> PathBuf {
    let mut path = home::home_dir().expect("Could not find home directory");
    path.push(".pomodoro");
    if !path.exists() {
        fs::create_dir_all(&path).expect("Could not create .pomodoro directory");
    }
    path
}

pub fn save_state(state: &TimerState) {
    let mut path = get_pomodoro_dir();
    path.push("state.json");
    let json = serde_json::to_string_pretty(state).expect("Could not serialize state");
    fs::write(path, json).expect("Could not write state.json");
}

pub fn load_state() -> TimerState {
    let mut path = get_pomodoro_dir();
    path.push("state.json");
    if path.exists() {
        let json = fs::read_to_string(path).expect("Could not read state.json");
        serde_json::from_str(&json).unwrap_or_else(|_| TimerState::default())
    } else {
        TimerState::default()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub date: String,
    pub completed: u32,
    pub forfeited: u32,
    pub total_focus_minutes: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct History {
    pub sessions: Vec<HistoryEntry>,
}

pub fn load_history() -> History {
    let mut path = get_pomodoro_dir();
    path.push("history.json");
    
    if path.exists() {
        let json = fs::read_to_string(&path).expect("Could not read history.json");
        serde_json::from_str(&json).unwrap_or_else(|_| History::default())
    } else {
        History::default()
    }
}

pub fn log_session(completed: bool, minutes: u32) {
    let mut path = get_pomodoro_dir();
    path.push("history.json");
    
    let mut history = load_history();

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    
    if let Some(entry) = history.sessions.iter_mut().find(|e| e.date == today) {
        if completed {
            entry.completed += 1;
            entry.total_focus_minutes += minutes;
        } else {
            entry.forfeited += 1;
        }
    } else {
        history.sessions.push(HistoryEntry {
            date: today,
            completed: if completed { 1 } else { 0 },
            forfeited: if completed { 0 } else { 1 },
            total_focus_minutes: if completed { minutes } else { 0 },
        });
    }

    // Keep only last 30 days
    if history.sessions.len() > 30 {
        history.sessions.remove(0);
    }

    let json = serde_json::to_string_pretty(&history).expect("Could not serialize history");
    fs::write(path, json).expect("Could not write history.json");
}
