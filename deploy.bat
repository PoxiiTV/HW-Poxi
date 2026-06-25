@echo off
echo ============================================
echo  HW Poxi - Build y Deploy
echo ============================================

echo.
echo [1/3] Compilando sidecar C#...
cd hw-sidecar
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o publish
if errorlevel 1 goto error
cd ..
copy hw-sidecar\publish\hw-sidecar.exe "src-tauri\binaries\hw-sidecar-x86_64-pc-windows-msvc.exe" /Y

echo.
echo [2/3] Compilando HW Poxi...
cargo tauri build
if errorlevel 1 goto error

echo.
echo [3/3] Preparando deploy-hosting...
if not exist deploy-hosting mkdir deploy-hosting

rem Instaladores
xcopy "src-tauri\target\release\bundle\nsis\*.exe" deploy-hosting\ /Y /Q
xcopy "src-tauri\target\release\bundle\msi\*.msi" deploy-hosting\ /Y /Q

rem Portable (app.exe + sidecar en carpeta portable)
if not exist "deploy-hosting\portable" mkdir "deploy-hosting\portable"
copy "src-tauri\target\release\app.exe" "deploy-hosting\portable\HW-Poxi.exe" /Y
copy "src-tauri\binaries\hw-sidecar-x86_64-pc-windows-msvc.exe" "deploy-hosting\portable\hw-sidecar-x86_64-pc-windows-msvc.exe" /Y

echo.
echo ============================================
echo  Listo. Archivos en deploy-hosting\
echo  - Instalador NSIS: *.exe
echo  - Instalador MSI:  *.msi
echo  - Portable:        portable\HW-Poxi.exe
echo ============================================
goto end

:error
echo ERROR en el build.
pause
exit /b 1

:end
pause
