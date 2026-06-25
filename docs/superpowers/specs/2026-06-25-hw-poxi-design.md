# HW Poxi — Diseño técnico

**Fecha:** 2026-06-25
**Proyecto:** F:\HW-Poxi
**Referencia visual:** PoxiOptimizer (C:\Users\Alexis\Downloads\Poxi-Optimizer)

---

## 1. Visión general

Aplicación de escritorio para Windows orientada a gaming que monitoriza en tiempo real los sensores de CPU y GPU (temperaturas, frecuencias, voltajes, potencia). Muestra valores Actual / Mínimo / Máximo como HWMonitor, con dos modos de ventana: **Full** (vista completa) y **Mini** (overlay compacto con solo las temps de package).

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| UI | React 18 + TypeScript + Tailwind CSS v4 |
| Shell de escritorio | Tauri 2 (Rust) |
| Lectura de sensores | C# sidecar con LibreHardwareMonitorLib |
| Animaciones | Framer Motion |
| Tema visual | Glassmorphism oscuro azul/morado (idéntico a PoxiOptimizer) |

---

## 3. Arquitectura

```
┌─────────────────────────────────────┐
│  React UI (Tauri WebView)           │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ MiniView │  │   FullView       │ │
│  │ CPU+GPU  │  │ CPU card + GPU   │ │
│  │ Package  │  │ card, per-core   │ │
│  └──────────┘  └──────────────────┘ │
└────────────┬────────────────────────┘
             │ Tauri events (sensor_data)
┌────────────▼────────────────────────┐
│  Tauri backend (Rust)               │
│  - Spawna y gestiona hw-sidecar     │
│  - Lee stdout del sidecar (JSON)    │
│  - Emite eventos al frontend        │
│  - Controla resize mini/full        │
│  - Controla always-on-top           │
└────────────┬────────────────────────┘
             │ stdin/stdout (JSON lines)
┌────────────▼────────────────────────┐
│  hw-sidecar.exe (C# .NET 8)        │
│  - LibreHardwareMonitorLib          │
│  - Corre como admin (UAC)           │
│  - Poll cada 1s (configurable)      │
│  - Emite JSON por stdout            │
└─────────────────────────────────────┘
```

---

## 4. Protocolo sidecar

El sidecar emite una línea JSON por stdout en cada intervalo:

```json
{
  "cpu": {
    "name": "AMD Ryzen 9 7900X",
    "package": {
      "temp": { "value": 65.2, "min": 42.0, "max": 82.0 },
      "power": { "value": 95.3, "min": 12.0, "max": 142.0 }
    },
    "cores": [
      {
        "id": 0,
        "temp": { "value": 63.1, "min": 40.0, "max": 80.0 },
        "clock": { "value": 4800.0, "min": 400.0, "max": 5200.0 },
        "voltage": { "value": 1.25, "min": 0.9, "max": 1.4 }
      }
    ]
  },
  "gpu": {
    "name": "NVIDIA GeForce RTX 4080",
    "temp": { "value": 72.0, "min": 35.0, "max": 88.0 },
    "coreClock": { "value": 2505.0, "min": 0.0, "max": 2750.0 },
    "memoryClock": { "value": 10000.0, "min": 0.0, "max": 10500.0 },
    "voltage": { "value": 1.05, "min": 0.65, "max": 1.1 },
    "power": { "value": 280.0, "min": 5.0, "max": 320.0 },
    "vramUsed": 8192,
    "vramTotal": 16384
  }
}
```

Valores no disponibles en el hardware del usuario → `null` (la UI muestra `—`).

El Rust backend parsea estas líneas y emite el evento `sensor_data` al frontend.

---

## 5. Modos de ventana

### Full (~860×580 px)

```
┌─── HW Poxi ─────────────────────── [⊞Mini] [─] [×] ┐
│                                                       │
│  ┌── CPU: AMD Ryzen 9 7900X ──┐  ┌── GPU: RTX 4080 ─┐│
│  │ [Paquete] [Por core]       │  │                   ││
│  │ Sensor     Actual Min Max  │  │ Sensor  Act Min Max││
│  │ Temp Pkg   65°C   42  82  │  │ Temp    72°  35  88││
│  │ Potencia   95W    12  142  │  │ Core    2505 0  2750││
│  │ ── Core 0 ──               │  │ Mem     10000 0 10500││
│  │ Temp       63°C   40  80  │  │ Voltaje 1.05 ..  ..││
│  │ Freq       4800   400 5200│  │ Potencia 280W ..  ..││
│  │ Voltaje    1.25V  0.9 1.4 │  │ VRAM   8/16 GB     ││
│  └────────────────────────────┘  └───────────────────┘│
│  [⚙ Ajustes]         Actualiza cada: [1s ▼]   [Reset Min/Max]│
└───────────────────────────────────────────────────────┘
```

- Toggle Paquete/Por core aplica solo a la card de CPU
- Temperaturas coloreadas: verde (<60°) / amarillo (60-80°) / rojo (>80°)
- Ajustes: panel deslizante desde abajo (always-on-top toggle, intervalo refresco, °C/°F)

### Mini (~340×110 px)

```
┌─── HW Poxi ──────────────── [⊞] [📌] [─] [×] ┐
│  CPU  65°C   MAX 82°C  │  GPU  72°C  MAX 88°C  │
└────────────────────────────────────────────────┘
```

- Glassmorphism compacto, sin scroll
- Solo temps de package + max alcanzado
- [📌] indica always-on-top activo (se puede togglear aquí también)
- Click en [⊞] → expande a Full con animación Framer Motion

---

## 6. Ajustes

| Ajuste | Tipo | Default |
|--------|------|---------|
| Always-on-top | Toggle | Off |
| Intervalo refresco | Select: 0.5s / 1s / 2s | 1s |
| Unidad temperatura | Toggle: °C / °F | °C |
| Reset Min/Max | Botón | — |

Persistidos en el archivo de configuración de Tauri (`AppData\Local\HWPoxi\config.json`).

---

## 7. Permisos y admin

- La app detecta si no corre como admin → muestra un banner de aviso: _"Ejecuta como administrador para ver voltajes y frecuencias por core"_
- Los sensores que requieren admin y no están disponibles muestran `—` sin crashear
- El sidecar **no** se relanza automáticamente como admin — el usuario debe abrir la app elevada

---

## 8. Estructura de archivos

```
F:\HW-Poxi\
├── src/
│   ├── App.tsx
│   ├── index.css              ← tema glassmorphism (clonado de PoxiOptimizer)
│   ├── main.tsx
│   ├── store.ts               ← Zustand: sensor data, settings, window mode
│   ├── components/
│   │   ├── TitleBar.tsx
│   │   ├── SensorTable.tsx    ← tabla Actual/Min/Max reutilizable
│   │   └── TempBadge.tsx      ← badge con color reactivo
│   └── views/
│       ├── FullView.tsx
│       ├── MiniView.tsx
│       └── SettingsPanel.tsx
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── sidecar.rs         ← spawn + lectura stdout sidecar
│   │   └── commands.rs        ← toggle always-on-top, resize ventana
│   └── tauri.conf.json
├── hw-sidecar/                ← proyecto C# .NET 8
│   ├── Program.cs
│   ├── HardwareReader.cs
│   ├── Models.cs
│   └── hw-sidecar.csproj
├── start.bat
├── deploy.bat
└── docs/
    └── superpowers/specs/
        └── 2026-06-25-hw-poxi-design.md
```

---

## 9. Build y distribución

- **Sidecar:** compilado a `hw-sidecar.exe` (self-contained, .NET 8, x64) y copiado a `src-tauri/binaries/`
- **Tauri build:** genera instalador NSIS + portable `.exe`
- **deploy.bat:** copia el instalador y el portable a `deploy-hosting/`, excluye node_modules / dist / devfiles

---

## 10. Fuera de scope (v1)

- Gráficas históricas de temperatura
- Overlay in-game (DirectX hook)
- Monitorización de red / RAM / disco
- Notificaciones de temperatura crítica
- Múltiples GPUs simultáneas
