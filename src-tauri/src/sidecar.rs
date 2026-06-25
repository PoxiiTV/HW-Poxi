use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

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
    let needs_extract = path
        .metadata()
        .map(|m| m.len() != SIDECAR_BYTES.len() as u64)
        .unwrap_or(true);

    if needs_extract {
        // Si el archivo está en uso, intentamos de todas formas
        if let Err(e) = std::fs::write(&path, SIDECAR_BYTES) {
            if path.exists() {
                // Archivo existe pero no se puede sobreescribir (en uso):
                // usamos la versión que hay — puede ser de una sesión anterior
                log::warn!("No se pudo actualizar sidecar ({e}), usando versión existente");
            } else {
                return Err(e.into());
            }
        }
    }
    Ok(path)
}

pub fn spawn_sidecar(app: AppHandle, interval_ms: u32) {
    match try_spawn(&app, interval_ms) {
        Ok(()) => {}
        Err(e) => {
            let msg = e.to_string();
            log::error!("Sidecar no pudo iniciarse: {msg}");
            // Emitir con delay para que el frontend esté listo
            let app2 = app.clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(1500));
                let _ = app2.emit("sidecar_error", msg);
            });
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
        let mut received_any = false;

        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    let trimmed = line.trim().to_string();
                    if !trimmed.is_empty() {
                        received_any = true;
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
                    if !received_any {
                        let app2 = app.clone();
                        let code = status.code.unwrap_or(-1);
                        std::thread::spawn(move || {
                            std::thread::sleep(std::time::Duration::from_millis(500));
                            let _ = app2.emit(
                                "sidecar_error",
                                format!("El sidecar se cerró (código {code}). Puede ser bloqueado por el antivirus o falta de permisos."),
                            );
                        });
                    }
                }
                _ => {}
            }
        }
    });
    Ok(())
}
