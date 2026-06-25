use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};

fn default_interval() -> u32 { 1000 }
fn default_unit()     -> String { "C".into() }
fn default_theme()    -> String { "blue".into() }
fn default_alert_enabled() -> bool { true }
fn default_alert_temp()    -> u32  { 91 }

#[derive(Serialize, Deserialize, Clone)]
pub struct Settings {
    #[serde(default)]
    pub always_on_top: bool,
    #[serde(default = "default_interval")]
    pub interval_ms: u32,
    #[serde(default = "default_unit")]
    pub unit: String,
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default = "default_alert_enabled")]
    pub alert_enabled: bool,
    #[serde(default = "default_alert_temp")]
    pub alert_temp_c: u32,
    #[serde(default)]
    pub mini_show_ram: bool,
    #[serde(default)]
    pub mini_x: Option<i32>,
    #[serde(default)]
    pub mini_y: Option<i32>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            always_on_top: false,
            interval_ms: default_interval(),
            unit: default_unit(),
            theme: default_theme(),
            alert_enabled: default_alert_enabled(),
            alert_temp_c: default_alert_temp(),
            mini_show_ram: false,
            mini_x: None,
            mini_y: None,
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
pub fn set_window_position(window: WebviewWindow, x: i32, y: i32) {
    let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
}

#[tauri::command]
pub fn get_window_position(window: WebviewWindow) -> (i32, i32) {
    window
        .outer_position()
        .map(|p| (p.x, p.y))
        .unwrap_or((100, 100))
}

#[tauri::command]
pub fn save_mini_position(app: AppHandle, x: i32, y: i32) {
    let path = settings_path(&app);
    let mut settings: Settings = fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default();
    settings.mini_x = Some(x);
    settings.mini_y = Some(y);
    if let Ok(json) = serde_json::to_string_pretty(&settings) {
        let _ = fs::write(path, json);
    }
}

#[tauri::command]
pub fn export_csv(csv: String) -> Result<String, String> {
    let home = std::env::var("USERPROFILE").map_err(|e| e.to_string())?;
    let downloads = std::path::PathBuf::from(home).join("Downloads");
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let filename = format!("hw-poxi-{ts}.csv");
    let path = downloads.join(&filename);
    std::fs::write(&path, csv.as_bytes()).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn reset_min_max(app: AppHandle) {
    let _ = app.emit("reset_min_max", ());
}
