mod commands;
mod elevation;
mod sidecar;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Comprueba admin ANTES de crear ventana — si no hay permisos,
    // lanza UAC y cierra este proceso (el nuevo ya arranca elevado).
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
            commands::reset_min_max,
        ])
        .setup(|app| {
            sidecar::spawn_sidecar(app.handle().clone(), 1000);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al ejecutar HW Poxi");
}
