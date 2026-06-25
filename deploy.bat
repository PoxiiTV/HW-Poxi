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
echo [3/3] Copiando a deploy-hosting...
if not exist deploy-hosting mkdir deploy-hosting
if not exist deploy-hosting\portable mkdir deploy-hosting\portable

rem Instaladores
xcopy "src-tauri\target\release\bundle\nsis\*.exe" deploy-hosting\ /Y /Q
xcopy "src-tauri\target\release\bundle\msi\*.msi" deploy-hosting\ /Y /Q

rem Portable (los dos archivos necesarios juntos)
copy "src-tauri\target\release\app.exe" "deploy-hosting\portable\HW-Poxi.exe" /Y
copy "src-tauri\target\release\hw-sidecar.exe" "deploy-hosting\portable\hw-sidecar.exe" /Y

echo.
echo ============================================
echo  Listo. Archivos en deploy-hosting\
echo  - Portable:   portable\HW-Poxi.exe  (lleva hw-sidecar.exe al lado)
echo  - Instalador: HW Poxi_*_x64-setup.exe
echo  - MSI:        HW Poxi_*_x64_en-US.msi
echo ============================================
goto end

:error
echo.
echo ERROR en el build. Revisa los mensajes anteriores.
pause
exit /b 1

:end
pause
