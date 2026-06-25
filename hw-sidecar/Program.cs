using System.Text.Json;
using System.Text.Json.Serialization;
using HwSidecar;

Console.OutputEncoding = System.Text.Encoding.UTF8;

int intervalMs = 1000;
if (args.Length > 0 && int.TryParse(args[0], out var ms) && ms >= 100)
    intervalMs = ms;

var opts = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
};

// Intentar inicializar con timeout para detectar cuelgues de hardware
HardwareReader? reader = null;
var initTask = Task.Run(() => new HardwareReader());
try
{
    if (initTask.Wait(TimeSpan.FromSeconds(15)))
        reader = initTask.Result;
    else
        Console.Error.WriteLine("[hw] Timeout inicializando hardware (>15s)");
}
catch (Exception ex)
{
    Console.Error.WriteLine($"[hw] Error inicializando hardware: {ex.Message}");
}

if (reader == null)
{
    // Sin lector: emitir snapshots vacíos para que la app muestre error correcto
    Console.Error.WriteLine("[hw] Iniciando en modo degradado (sin datos de hardware)");
}

while (true)
{
    try
    {
        HwSnapshot snapshot;
        if (reader != null)
            snapshot = reader.Read();
        else
            snapshot = new HwSnapshot(null, null, null);

        Console.WriteLine(JsonSerializer.Serialize(snapshot, opts));
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[hw] Error leyendo sensores: {ex.Message}");
    }
    await Task.Delay(intervalMs);
}
