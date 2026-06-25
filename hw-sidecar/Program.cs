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

using var reader = new HardwareReader();

while (true)
{
    try
    {
        var snapshot = reader.Read();
        Console.WriteLine(JsonSerializer.Serialize(snapshot, opts));
    }
    catch
    {
        // Continuar en el siguiente ciclo si hay error puntual de lectura
    }
    await Task.Delay(intervalMs);
}
