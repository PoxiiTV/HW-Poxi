use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

pub fn spawn_sidecar(app: AppHandle, interval_ms: u32) -> Result<(), Box<dyn std::error::Error>> {
    let sidecar_cmd = app
        .shell()
        .sidecar("hw-sidecar")?
        .args([interval_ms.to_string()]);

    let (mut rx, _child) = sidecar_cmd.spawn()?;

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let line = String::from_utf8_lossy(&line_bytes);
                let trimmed = line.trim().to_string();
                if !trimmed.is_empty() {
                    let _ = app.emit("sensor_data", trimmed);
                }
            }
        }
    });

    Ok(())
}
