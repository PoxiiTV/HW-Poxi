// Los bytes del sidecar se incrustan aquí con opt-level=0 para evitar OOM en LLVM
pub static BYTES: &[u8] = include_bytes!("../../../hw-sidecar/publish/hw-sidecar.exe");
