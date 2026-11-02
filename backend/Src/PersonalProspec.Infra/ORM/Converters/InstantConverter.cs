using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NodaTime;

namespace PersonalProspec.Infra.ORM.Converters;

// Instant (NodaTime) <-> datetime2 em UTC. Sem pacote novo: o provedor do SQL Server não mapeia Instant.
public sealed class InstantConverter() : ValueConverter<Instant, DateTime>(
    instant => instant.ToDateTimeUtc(),
    dateTime => Instant.FromDateTimeUtc(DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)));
