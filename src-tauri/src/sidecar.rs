use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

pub fn spawn_sidecar(app: AppHandle, interval_ms: u32) {
    match try_spawn(&app, interval_ms) {
        Ok(()) => {}
        Err(e) => {
            log::error!("Sidecar no pudo iniciarse: {e}");
            // Emitir evento de error para que el frontend lo muestre
            let _ = app.emit("sidecar_error", e.to_string());
        }
    }
}

fn try_spawn(app: &AppHandle, interval_ms: u32) -> Result<(), Box<dyn std::error::Error>> {
    let sidecar_cmd = app
        .shell()
        .sidecar("hw-sidecar")?
        .args([interval_ms.to_string()]);

    let (mut rx, _child) = sidecar_cmd.spawn()?;

    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    let trimmed = line.trim().to_string();
                    if !trimmed.is_empty() {
                        let _ = app.emit("sensor_data", trimmed);
                    }
                }
                CommandEvent::Stderr(err_bytes) => {
                    let msg = String::from_utf8_lossy(&err_bytes);
                    log::warn!("Sidecar stderr: {}", msg.trim());
                }
                CommandEvent::Error(e) => {
                    log::error!("Sidecar error: {e}");
                }
                CommandEvent::Terminated(status) => {
                    log::warn!("Sidecar terminó con código: {:?}", status.code);
                }
                _ => {}
            }
        }
    });

    Ok(())
}
