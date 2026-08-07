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
            // Lógico, no físico: en pantallas con escalado (125/150 %) el tamaño
            // físico dejaba la vista aplastada bajo la barra de título.
            let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 340.0,
                height: 110.0,
            }));
            let _ = window.set_resizable(false);
        }
        _ => {
            let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 860.0,
                height: 580.0,
            }));
            let _ = window.set_resizable(true);
        }
    }
}

/// ¿Es (x, y) una posición visible en alguno de los monitores conectados?
/// Descarta coords de ventana minimizada (-32000) y posiciones huérfanas
/// tras cambiar de resolución o desconectar una pantalla.
fn position_is_visible(window: &WebviewWindow, x: i32, y: i32) -> bool {
    if x <= -30000 || y <= -30000 {
        return false;
    }
    let Ok(monitors) = window.available_monitors() else {
        return true; // sin datos de monitores, no bloqueamos al usuario
    };
    monitors.iter().any(|m| {
        let pos = m.position();
        let size = m.size();
        // Basta con que quepa la esquina superior izquierda + un margen
        // suficiente para agarrar la barra de título y arrastrarla.
        x >= pos.x
            && y >= pos.y
            && x + 80 <= pos.x + size.width as i32
            && y + 40 <= pos.y + size.height as i32
    })
}

#[tauri::command]
pub fn set_window_position(window: WebviewWindow, x: i32, y: i32) {
    if position_is_visible(&window, x, y) {
        let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
    } else {
        let _ = window.center();
    }
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
