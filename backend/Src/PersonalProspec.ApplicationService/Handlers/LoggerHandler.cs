using Microsoft.Extensions.Logging;
using PersonalProspec.Domain.Handlers.LoggerSettings;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.ApplicationService.Handlers;

// Coleta os DomainLogger da requisição e grava no log da aplicação.
// PENDENTE: persistir a trilha de auditoria em banco (mapping + repositório) se o projeto precisar.
public sealed class LoggerHandler(ILogger<LoggerHandler> logger) : ILoggerHandler
{
    private readonly List<DomainLogger> _loggers = [];

    public void CreateLogger(DomainLogger domainLogger)
    {
        _loggers.Add(domainLogger);
    }

    public bool HasLogger() => _loggers.Count > 0;

    public void SaveLogs()
    {
        foreach (var item in _loggers)
            logger.LogInformation(
                "Auditoria: {Action} em {EntityName} ({EntityId}) por {UserId}",
                item.Action, item.EntityName, item.EntityId, item.UserId);

        _loggers.Clear();
    }
}
