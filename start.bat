@echo off
echo Compilando sidecar C#...
cd hw-sidecar
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o publish
if errorlevel 1 pause & exit /b 1
cd ..
echo Iniciando dev...
npm run tauri dev
