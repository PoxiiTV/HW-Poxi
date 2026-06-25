use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};

#[derive(Serialize, Deserialize, Clone)]
pub struct Settings {
    pub always_on_top: bool,
    pub interval_ms: u32,
    pub unit: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            always_on_top: false,
            interval_ms: 1000,
            unit: "C".into(),
        }
    }
}

fn settings_path(app: &AppHandle) -> std::path::PathBuf {
    app.path()
        .app_data_dir()
        .unwrap_or_default()
        .join("settings.json")
}

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Settings {
    let path = settings_path(&app);
    fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: Settings) {
    let path = settings_path(&app);
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string_pretty(&settings) {
        let _ = fs::write(path, json);
    }
}

#[tauri::command]
pub fn set_always_on_top(window: WebviewWindow, enabled: bool) {
    let _ = window.set_always_on_top(enabled);
}

#[tauri::command]
pub fn set_window_mode(window: WebviewWindow, mode: String) {
    match mode.as_str() {
        "mini" => {
            let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: 340,
                height: 110,
            }));
            let _ = window.set_resizable(false);
        }
        _ => {
            let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: 860,
                height: 580,
            }));
            let _ = window.set_resizable(true);
        }
    }
}

#[tauri::command]
pub fn reset_min_max(app: AppHandle) {
    let _ = app.emit("reset_min_max", ());
}
