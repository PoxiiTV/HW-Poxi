use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

// Bytes del sidecar incrustados (en crate separada con opt-level=0 para evitar OOM en LLVM)
use sidecar_data::BYTES as SIDECAR_BYTES;

fn sidecar_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let dir = std::env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir())
        .join("HWPoxi");
    std::fs::create_dir_all(&dir)?;
    Ok(dir.join("hw-sidecar.exe"))
}

fn extract_sidecar() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let path = sidecar_path()?;
    // Re-extrae solo si el tamaño difiere (indica nueva versión)
    let needs_extract = path
        .metadata()
        .map(|m| m.len() != SIDECAR_BYTES.len() as u64)
        .unwrap_or(true);
    if needs_extract {
        std::fs::write(&path, SIDECAR_BYTES)?;
    }
    Ok(path)
}

pub fn spawn_sidecar(app: AppHandle, interval_ms: u32) {
    match try_spawn(&app, interval_ms) {
        Ok(()) => {}
        Err(e) => {
            log::error!("Sidecar no pudo iniciarse: {e}");
            let _ = app.emit("sidecar_error", e.to_string());
        }
    }
}

fn try_spawn(app: &AppHandle, interval_ms: u32) -> Result<(), Box<dyn std::error::Error>> {
    let exe_path = extract_sidecar()?;
    let exe_str = exe_path.to_str().ok_or("ruta inválida para sidecar")?;

    let (mut rx, _child) = app
        .shell()
        .command(exe_str)
        .args([interval_ms.to_string()])
        .spawn()?;

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
                    log::warn!(
                        "Sidecar stderr: {}",
                        String::from_utf8_lossy(&err_bytes).trim()
                    );
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
