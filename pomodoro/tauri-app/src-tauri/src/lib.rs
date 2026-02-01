mod timer;
mod persistence;

use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuBuilder, MenuItem, SubmenuBuilder},
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    Manager, AppHandle, Emitter, Runtime, LogicalSize, Size, WebviewWindow
};
use timer::{TimerState, Status, TimerType};
use persistence::History;
use chrono::Local;

#[tauri::command]
fn hide_window(app_handle: tauri::AppHandle) {
    if let Some(window) = app_handle.get_webview_window("main") {
        let _ = window.set_fullscreen(false);
        let _ = window.hide();
    }
}

#[tauri::command]
fn hide_stats_window(app_handle: tauri::AppHandle) {
    if let Some(window) = app_handle.get_webview_window("stats") {
        let _ = window.hide();
    }
}

#[tauri::command]
fn get_history() -> History {
    persistence::load_history()
}

#[tauri::command]
fn open_stats(app_handle: tauri::AppHandle) {
    if let Some(window) = app_handle.get_webview_window("stats") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn get_state(state: tauri::State<Arc<Mutex<TimerState>>>) -> TimerState {
    let mut timer = state.lock().unwrap();
    timer.calculate_remaining(false);
    timer.clone()
}

#[tauri::command]
fn toggle_timer(state: tauri::State<Arc<Mutex<TimerState>>>, app: AppHandle) -> TimerState {
    let mut timer = state.lock().unwrap();
    timer.toggle();
    let result = timer.clone();
    persistence::save_state(&result);
    drop(timer);
    
    // State change -> Update everything (Menu + Title)
    update_tray_menu(&app, &result);
    update_tray_title(&app, &result);
    result
}

// Only updates the text/icon, DOES NOT rebuild the menu.
// Safe to call every second without closing the dropdown.
fn update_tray_title(app: &AppHandle, state: &TimerState) {
    if let Some(tray) = app.tray_by_id("main") {
        let title = format!("{} {}", state.get_icon(), state.format_time());
        let _ = tray.set_title(Some(&title));
    }
}

// Rebuilds the proper menu based on state.
// Only call this on valid state transitions.
fn update_tray_menu(app: &AppHandle, state: &TimerState) {
    if let Some(tray) = app.tray_by_id("main") {
        let menu = build_menu(app, state);
        let _ = tray.set_menu(Some(menu));
    }
}

fn generate_history_chart(history: &History) -> String {
    let mut chart = String::new();
    let days: Vec<String> = (0..7).rev().map(|i| {
        (Local::now() - chrono::Duration::days(i)).format("%Y-%m-%d").to_string()
    }).collect();
    
    // Calculate max for scale
    let max_minutes = history.sessions.iter()
        .filter(|s| days.contains(&s.date))
        .map(|s| s.total_focus_minutes)
        .max()
        .unwrap_or(0)
        .max(60); // Minimum scale 60m

    let blocks = [" ", " ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

    for day in days {
        let minutes = history.sessions.iter()
            .find(|s| s.date == day)
            .map(|s| s.total_focus_minutes)
            .unwrap_or(0);
            
        let index = ((minutes as f32 / max_minutes as f32) * 8.0).round() as usize;
        let index = index.min(8);
        chart.push_str(blocks[index]);
        chart.push(' '); // Spacing
    }
    
    chart
}

fn build_menu(app: &AppHandle, state: &TimerState) -> Menu<tauri::Wry> {
    let history = persistence::load_history();
    let chart = generate_history_chart(&history);
    
    // Get today's stats
    let today = Local::now().format("%Y-%m-%d").to_string();
    let sessions_today = history.sessions.iter()
        .find(|s| s.date == today)
        .map(|s| s.completed)
        .unwrap_or(0);

    let builder = MenuBuilder::new(app);
    
    // 1. Alternating Control
    // If Idle or Paused -> Show Start options
    // If Focus/Break (Running) -> Show Pause
    
    let builder = match state.status {
        Status::Focus | Status::Break => {
             builder.text("toggle", "Pause")
        },
        Status::Paused => {
             builder.text("toggle", "Resume")
        },
        Status::Idle => {
             // Start Focus Submenu
             let start_menu = tauri::menu::SubmenuBuilder::new(app, "Start Focus")
                .text("focus_25", "25 Minutes (Default)")
                .text("focus_5", "5 Minutes")
                .text("focus_15", "15 Minutes")
                .text("focus_45", "45 Minutes")
                .build().unwrap();
             
             builder.item(&start_menu)
        }
    };

    let builder = builder
        .text("forfeit", "Forfeit");

    // 3. Calm Mode Submenu
    let calm_menu = tauri::menu::SubmenuBuilder::new(app, "Calm Mode")
        .text("calm_5", "5 Minutes (Default)")
        .text("calm_15", "15 Minutes")
        .text("calm_45", "45 Minutes")
        .build().unwrap();
        
    builder
        .item(&calm_menu)
        
        // 4. Session Count (Disabled)
        .separator()
        .item(&MenuItem::with_id(app, "sessions", &format!("{} Full Sessions Today", sessions_today), false, None::<&str>).unwrap())
        
        // 5. Weekly History Chart (Disabled/Info)
        .item(&MenuItem::with_id(app, "history", &format!("History: {}", chart), false, None::<&str>).unwrap())
        
        // 6. How to Use
        .separator()
        .text("about", "How to Use")
        
        .separator()
        .text("quit", "Quit")
        .build()
        .unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let timer_state = Arc::new(Mutex::new(persistence::load_state()));
    let timer_for_setup = timer_state.clone();
    let timer_for_event = timer_state.clone();
    let timer_for_tick = timer_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(timer_state)
        .invoke_handler(tauri::generate_handler![get_state, toggle_timer, hide_window, hide_stats_window, get_history, open_stats])
        .setup(move |app| {
            let app_handle = app.handle().clone();
            let mut state = timer_for_setup.lock().unwrap();
            
            // Force Passive Startup: Always start fresh/idle
            state.reset();
            persistence::save_state(&state);
            
            // Explicitly hide main window and unset fullscreen (fixes macOS resume ghosting)
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.set_fullscreen(false);
                let _ = window.hide();
            }
            
            // Build initial menu and title
            let menu = build_menu(&app_handle, &state);
            let title = format!("{} {}", state.get_icon(), state.format_time());
            
            // Create system tray with ID first
            let _ = TrayIconBuilder::with_id("main")
                .menu(&menu)
                .title(&title)
                .show_menu_on_left_click(false)
                .on_tray_icon_event({
                    let timer = timer_for_event.clone();
                    let app_handle = app_handle.clone();
                    move |tray, event| {
                         match event {
                            TrayIconEvent::Click {
                                button: MouseButton::Left,
                                button_state: MouseButtonState::Up,
                                ..
                            } => {
                                // Left Click: Toggle Timer
                                let mut state = timer.lock().unwrap();
                                state.toggle();
                                
                                let _ = tray.set_title(Some(&format!("{} {}", state.get_icon(), state.format_time())));

                                let result = state.clone();
                                persistence::save_state(&result);
                                drop(state);
                                
                                // Update Menu structure (Pause <-> Resume)
                                update_tray_menu(&app_handle, &result);
                                update_tray_title(&app_handle, &result);
                            }
                            _ => {}
                        }
                    }
                })
                .on_menu_event({
                    let app_handle = app_handle.clone();
                    let timer = timer_for_setup.clone();
                    move |_tray, event| {
                        let mut state = timer.lock().unwrap();
                        match event.id.as_ref() {
                            // Start Focus Options
                            "focus_25" => state.start_focus(1500),
                            "focus_5" => state.start_focus(300),
                            "focus_15" => state.start_focus(900),
                            "focus_45" => state.start_focus(2700),
                            
                            // Calm Mode Options
                            "calm_5" => {
                                state.start_break(300);
                                state.timer_type = TimerType::Calm;
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.set_fullscreen(true);
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            },
                             "calm_15" => {
                                state.start_break(900);
                                state.timer_type = TimerType::Calm;
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.set_fullscreen(true);
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            },
                             "calm_45" => {
                                state.start_break(2700);
                                state.timer_type = TimerType::Calm;
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.set_fullscreen(true);
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            },
                            
                            // Controls
                            "toggle" => state.toggle(),
                            "forfeit" => {
                                let minutes = ((state.total - state.remaining) / 60) as u32;
                                state.forfeit();
                                persistence::log_session(false, minutes);
                            },
                            "reset" => state.reset(),
                            
                            // Links
                            "about" => {
                                let _ = open::that("https://vrushank.in/pomodoro#how-to-use");
                            },
                            "quit" => {
                                app_handle.exit(0);
                            }
                            _ => {}
                        }
                        let result = state.clone();
                        persistence::save_state(&result);
                        drop(state);
                        
                        // Menu Interaction: Update menu structure on command
                        update_tray_menu(&app_handle, &result);
                        update_tray_title(&app_handle, &result);
                    }
                })
                .build(app)?;
                
            // Background tick thread
            let app_handle_for_tick = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_millis(1000));
                    let mut state = timer_for_tick.lock().unwrap();
                    let old_time = state.format_time();
                    if let Some((completed, minutes)) = state.calculate_remaining(false) {
                        persistence::log_session(completed, minutes);
                        
                        // Session Finished -> Show Sanctuary (ONLY for Focus sessions)
                        if completed {
                            if let Some(window) = app_handle_for_tick.get_webview_window("main") {
                                let _ = window.set_fullscreen(true);
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                    let state_clone = state.clone();
                    let _ = app_handle_for_tick.emit("timer-tick", &state_clone);
                    
                    let new_time = state_clone.format_time();
                    
                    // ONLY update title on tick, never menu structure (prevents closing bug)
                    if old_time != new_time {
                        persistence::save_state(&state_clone);
                        update_tray_title(&app_handle_for_tick, &state_clone);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
