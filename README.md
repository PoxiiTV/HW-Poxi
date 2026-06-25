<div align="center">

# 🖥️ HW Poxi

**Monitor de hardware gaming — temperatura, frecuencia, carga, RAM y ventiladores en tiempo real.**
**Gaming hardware monitor — temperature, frequency, load, RAM and fans in real time.**

[![Version](https://img.shields.io/badge/versión-1.0.0-brightgreen)](#-historial-de-versiones--changelog)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-1.77-000000?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![CSharp](https://img.shields.io/badge/C%23-.NET%208-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com)
[![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-0078D6?logo=windows&logoColor=white)](#)
[![License](https://img.shields.io/badge/license-MIT-9b5cf6)](LICENSE)

*Interfaz glassmorphism · ejecutable único · datos reales del hardware*

</div>

---

## 🇪🇸 Español

**HW Poxi** es un monitor de hardware orientado a gaming para Windows 10 y 11. Muestra en tiempo real temperatura, frecuencia, voltaje, consumo, carga GPU, RAM y ventiladores de tu CPU y GPU con valores mínimo, actual y máximo — como HWMonitor, pero con interfaz moderna, gráficas de historial y bandeja del sistema.

### ✨ Características

| Función | Descripción |
|---------|-------------|
| 🌡️ **Temperaturas reales** | Paquete y por core (Intel y AMD Ryzen), actualización cada 0,5–2 s |
| 📈 **Gráficas de historial** | Línea de tiempo de CPU + GPU de los últimos 60 s (estilo GPU-Z) |
| 🔔 **Alertas de temperatura** | Aviso en app cuando CPU o GPU supera el umbral configurable (91 °C por defecto) |
| ⚡ **Frecuencias** | MHz por core en CPU y core/memoria en GPU |
| 🔋 **Potencia** | Vatios de paquete CPU y GPU con decimales |
| 🔌 **Voltajes** | Por core en CPU, core en GPU (requiere admin) |
| 🎮 **VRAM** | Uso / total en MB para la GPU |
| 💾 **RAM** | Usada / total GB con porcentaje y barra de progreso |
| 🌀 **Carga GPU** | Porcentaje de utilización de la GPU |
| 🌬️ **Ventiladores** | RPM del ventilador GPU (y CPU si el hardware lo expone) |
| 📊 **Min / Actual / Máx** | Seguimiento automático de valores históricos de sesión |
| 🖥️ **Vista Paquete / Por core** | Alterna entre datos globales y detalle por core individual |
| 📌 **Modo Mini** | Overlay compacto 340×110 px — temperatura CPU + GPU + RAM opcional |
| 📐 **Modo Completo** | Vista expandida 860×580 px con todas las métricas y gráficas |
| 🎨 **Temas de color** | Azul (por defecto), Rojo gaming, Verde, Blanco |
| 🖱️ **Drag & drop mini** | Recuerda la posición de la ventana mini entre sesiones |
| 🔲 **Bandeja del sistema** | Minimiza a tray; clic izquierdo muestra/oculta, menú derecho para modo mini o salir |
| 🔝 **Siempre encima** | Mantén la ventana sobre cualquier juego o app |
| 📥 **Exportar CSV** | Guarda el historial de sensores en Descargas |
| 🛡️ **UAC automático** | Solicita permisos de administrador al abrir para acceso completo |
| 📦 **Un solo .exe** | El sidecar C# va embebido — sin archivos extra que distribuir |

### 🚀 Instalación

**Opción A — Instalador (recomendado):**
1. Descarga `HW-Poxi_1.0.0_x64-setup.exe` desde [Releases](../../releases).
2. Ejecútalo y sigue el asistente.
3. Abre **HW Poxi** y acepta el prompt de administrador.

**Opción B — Portable:**
1. Descarga `HW-Poxi.exe` desde [Releases](../../releases).
2. Ejecútalo directamente — no requiere instalación.

> Requiere **Windows 10/11 x64**. El runtime de .NET 8 va incluido en el ejecutable.

> **Nota tray en Windows 11:** Al pulsar la X, la app se minimiza a la bandeja del sistema (no se cierra). Si no ves el icono, búscalo en el menú de desbordamiento del tray (la flecha `^` junto al reloj) y fíjalo para tenerlo siempre visible.

### 📊 Sensores disponibles

| Sensor | Intel CPU | AMD Ryzen | NVIDIA GPU | AMD GPU |
|--------|:---------:|:---------:|:----------:|:-------:|
| Temp. paquete | ✅ | ✅ | ✅ | ✅ |
| Temp. por core | ✅ | ✅ | — | — |
| Frecuencia por core | ✅ | ✅ | — | — |
| Frecuencia GPU core/mem | — | — | ✅ | ✅ |
| Voltaje por core | ✅ | ✅ | — | — |
| Potencia paquete | ✅ | ✅ | ✅ | ✅ |
| Carga GPU % | — | — | ✅ | ✅ |
| Ventilador GPU RPM | — | — | ✅ | ✅ |
| VRAM | — | — | ✅ | ✅ |
| RAM sistema | ✅ | ✅ | ✅ | ✅ |

> Los voltajes y algunos datos por core requieren ejecutar como **administrador**.

### 🧑‍💻 Compilar desde el código

Requisitos: [Node.js](https://nodejs.org), [Rust](https://rustup.rs), [.NET 8 SDK](https://dotnet.microsoft.com/download) y Visual Studio C++ Build Tools.

```bash
# 1. Instala dependencias frontend
npm install

# 2. Compilar y lanzar en modo desarrollo
start.bat           # compila el sidecar C# + arranca tauri dev

# 3. Generar instalador + portable
deploy.bat          # compila todo y copia a deploy-hosting/
```

---

## 🇬🇧 English

**HW Poxi** is a gaming-oriented hardware monitor for Windows 10 and 11. Displays real-time temperature, frequency, voltage, power, GPU load, RAM and fan speeds for your CPU and GPU with min, current and max values — like HWMonitor, but with a modern interface, history charts and system tray support.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🌡️ **Real temperatures** | Package and per-core (Intel & AMD Ryzen), updated every 0.5–2 s |
| 📈 **History charts** | 60-second CPU + GPU temperature timeline (GPU-Z style) |
| 🔔 **Temperature alerts** | In-app notification when CPU or GPU exceeds configurable threshold (91°C default) |
| ⚡ **Frequencies** | MHz per core on CPU and core/memory on GPU |
| 🔋 **Power** | Package watts for CPU and GPU with decimals |
| 🔌 **Voltages** | Per-core on CPU, core on GPU (requires admin) |
| 🎮 **VRAM** | Used / total in MB for the GPU |
| 💾 **RAM** | Used / total GB with percentage and progress bar |
| 🌀 **GPU Load** | GPU utilization percentage |
| 🌬️ **Fans** | GPU fan RPM (and CPU fan if exposed by hardware) |
| 📊 **Min / Current / Max** | Automatic session tracking of historical values |
| 🖥️ **Package / Per-core view** | Switch between global data and individual core detail |
| 📌 **Mini mode** | Compact 340×110 px overlay — CPU + GPU temp + optional RAM |
| 📐 **Full mode** | Expanded 860×580 px view with all metrics and charts |
| 🎨 **Color themes** | Blue (default), Red gaming, Green, White |
| 🖱️ **Mini drag & drop** | Remembers mini window position between sessions |
| 🔲 **System tray** | Minimize to tray; left-click toggle, right-click for mini mode or quit |
| 🔝 **Always on top** | Keep the window above any game or app |
| 📥 **Export CSV** | Save sensor history to Downloads folder |
| 🛡️ **Auto UAC** | Requests admin permissions on launch for full sensor access |
| 📦 **Single .exe** | The C# sidecar is embedded — no extra files to distribute |

### 🚀 Installation

**Option A — Installer (recommended):**
1. Download `HW-Poxi_1.0.0_x64-setup.exe` from [Releases](../../releases).
2. Run it and follow the wizard.
3. Open **HW Poxi** and accept the administrator prompt.

**Option B — Portable:**
1. Download `HW-Poxi.exe` from [Releases](../../releases).
2. Run it directly — no installation required.

> Requires **Windows 10/11 x64**. .NET 8 Runtime is bundled in the portable executable.

> **Windows 11 tray note:** Pressing X minimizes the app to the system tray (does not close it). If you don't see the icon, look in the tray overflow menu (the `^` arrow near the clock) and pin it to keep it always visible.

### 🧑‍💻 Build from source

Requirements: [Node.js](https://nodejs.org), [Rust](https://rustup.rs), [.NET 8 SDK](https://dotnet.microsoft.com/download) and Visual Studio C++ Build Tools.

```bash
# 1. Install frontend dependencies
npm install

# 2. Build and launch in dev mode
start.bat           # compiles C# sidecar + starts tauri dev

# 3. Generate installer + portable
deploy.bat          # builds everything and copies to deploy-hosting/
```

---

## 🧩 Stack

- **Tauri 2** (Rust) — ventana nativa, IPC, UAC, bandeja / native window, IPC, UAC, tray
- **React 18 + TypeScript + Vite** — interfaz / UI
- **Tailwind CSS 4 + Framer Motion** — diseño y animaciones / design & animations
- **Zustand** — estado global / global state
- **C# .NET 8** — sidecar de lectura de sensores / sensor reading sidecar
- **LibreHardwareMonitor 0.9.4** — acceso directo al hardware / direct hardware access

## 🙏 Créditos / Credits

Motor de sensores basado en / Sensor engine based on:
[LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) — el mismo motor que usa HWMonitor / the same engine HWMonitor uses.

---

## 📋 Historial de versiones / Changelog

### v1.0.0 — Lanzamiento inicial / Initial release

**🇪🇸 Español**

- **Vista completa** — CPU y GPU con temperaturas, frecuencias, voltajes, potencia, carga y ventiladores
- **Vista por core** — detalle individual de cada core de CPU (temperatura, frecuencia, voltaje)
- **Gráficas de historial** — línea de tiempo CPU + GPU de los últimos 60 segundos, estilo GPU-Z
- **RAM del sistema** — usada / total en GB con porcentaje y barra de progreso (vía Windows API directa)
- **Alertas de temperatura** — aviso in-app cuando CPU o GPU supera el umbral configurable (91 °C por defecto, cooldown de 30 s)
- **Modo Mini** — overlay compacto siempre encima, con RAM opcional activable en ajustes
- **Posición mini persistente** — recuerda dónde dejaste la ventana mini al cerrar
- **Bandeja del sistema** — la X minimiza a tray; clic izquierdo muestra/oculta; menú derecho con Mostrar / Modo Mini / Salir
- **Temas de color** — Azul (por defecto), Rojo gaming, Verde, Blanco
- **Exportar CSV** — guarda el historial de sensores de la sesión en Descargas
- **Ejecutable único** — el sidecar C# va embebido; sin archivos extra que distribuir
- **UAC automático** — solicita permisos de administrador al abrir para acceso completo al hardware

**🇬🇧 English**

- **Full view** — CPU and GPU with temperatures, clocks, voltages, power, load and fans
- **Per-core view** — individual core detail for CPU (temperature, clock, voltage)
- **History charts** — 60-second CPU + GPU temperature timeline, GPU-Z style
- **System RAM** — used / total GB with percentage and progress bar (via direct Windows API)
- **Temperature alerts** — in-app notification when CPU or GPU exceeds configurable threshold (91°C default, 30 s cooldown)
- **Mini mode** — compact always-on-top overlay with optional RAM toggle in settings
- **Persistent mini position** — remembers where you left the mini window on close
- **System tray** — X minimizes to tray; left-click toggles; right-click menu: Show / Mini mode / Quit
- **Color themes** — Blue (default), Red gaming, Green, White
- **Export CSV** — saves session sensor history to Downloads
- **Single executable** — C# sidecar is embedded; no extra files to distribute
- **Auto UAC** — requests admin permissions on launch for full hardware access

<div align="center">

Hecho con 💜 por **Poxi**

</div>
