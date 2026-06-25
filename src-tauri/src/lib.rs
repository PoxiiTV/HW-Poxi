mod commands;
mod elevation;
mod sidecar;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if !elevation::ensure_admin() {
        return;
    }

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::save_settings,
            commands::set_always_on_top,
            commands::set_window_mode,
            commands::set_window_position,
            commands::get_window_position,
            commands::save_mini_position,
            commands::export_csv,
            commands::reset_min_max,
        ])
        .setup(|app| {
            // Sidecar PRIMERO — no puede fallar por culpa del tray
            sidecar::spawn_sidecar(app.handle().clone(), 1000);

            // Tray — no es fatal si falla (ej. sin acceso al sistema)
            if let Err(e) = setup_tray(app) {
                log::warn!("System tray no disponible: {e}");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al ejecutar HW Poxi");
}

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    use tauri::{
        menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
        tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
        Emitter, Manager,
    };

    let show_i = MenuItemBuilder::with_id("show", "Mostrar").build(app)?;
    let mini_i = MenuItemBuilder::with_id("mini", "Modo Mini").build(app)?;
    let sep    = PredefinedMenuItem::separator(app)?;
    let quit_i = MenuItemBuilder::with_id("quit", "Salir").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&show_i, &mini_i, &sep, &quit_i])
        .build()?;

    let icon = app
        .default_window_icon()
        .cloned()
        .ok_or("No se encontró el ícono de la app")?;

    TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .tooltip("HW Poxi")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.unminimize();
                    let _ = win.set_focus();
                }
            }
            "mini" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.unminimize();
                    let _ = win.set_focus();
                    let _ = app.emit("tray_set_mini", ());
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window("main") {
                    if win.is_visible().unwrap_or(false) {
                        let _ = win.hide();
                    } else {
                        let _ = win.show();
                        let _ = win.unminimize();
                        let _ = win.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
