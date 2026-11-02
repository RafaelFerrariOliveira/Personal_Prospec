using System.Reflection;
using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Infra.ORM.Seeds;

// Idempotente. Carrega as listas públicas de CNAE e município (instantâneo de 2026-10 da Receita) e grava só o
// que falta. Os arquivos são recursos embutidos: UTF-8, separados por tabulação, sem cabeçalho.
public sealed class ReferenceSeed(ApplicationContext context)
{
    private const string CnaeResource = "cnae.tsv";
    private const string MunicipalityResource = "municipios.tsv";

    public async Task RunAsync()
    {
        await EnsureCnaeAsync();
        await EnsureMunicipalitiesAsync();
    }

    private async Task EnsureCnaeAsync()
    {
        var existing = (await context.Set<Cnae>().AsNoTracking().Select(c => c.Code).ToListAsync()).ToHashSet();

        var missing = ReadRows(CnaeResource, 2)
            .Where(r => !existing.Contains(r[0]))
            .Select(r => new Cnae { Code = r[0], Description = r[1] })
            .ToList();

        if (missing.Count == 0)
            return;

        await context.Set<Cnae>().AddRangeAsync(missing);
        await context.SaveChangesAsync();
    }

    private async Task EnsureMunicipalitiesAsync()
    {
        var existing = (await context.Set<Municipality>().AsNoTracking().Select(m => m.Code).ToListAsync())
            .ToHashSet();

        var missing = ReadRows(MunicipalityResource, 3)
            .Where(r => !existing.Contains(r[0]))
            .Select(r => new Municipality { Code = r[0], State = r[1], Name = r[2] })
            .ToList();

        if (missing.Count == 0)
            return;

        await context.Set<Municipality>().AddRangeAsync(missing);
        await context.SaveChangesAsync();
    }

    private static List<string[]> ReadRows(string resourceName, int expectedColumns)
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName)
                           ?? throw new InvalidOperationException($"Recurso embutido {resourceName} não encontrado.");
        using var reader = new StreamReader(stream);

        var rows = new List<string[]>();
        var lineNumber = 0;

        while (reader.ReadLine() is { } line)
        {
            lineNumber++;

            if (line.Length == 0)
                continue;

            var columns = line.Split('\t');

            if (columns.Length != expectedColumns)
                throw new InvalidOperationException(
                    $"{resourceName}, linha {lineNumber}: esperadas {expectedColumns} colunas e encontradas {columns.Length}.");

            rows.Add(columns);
        }

        return rows;
    }
}
