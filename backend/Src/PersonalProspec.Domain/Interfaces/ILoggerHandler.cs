using PersonalProspec.Domain.Handlers.LoggerSettings;

namespace PersonalProspec.Domain.Interfaces;

public interface ILoggerHandler
{
    void CreateLogger(DomainLogger logger);
    bool HasLogger();
    void SaveLogs();
}
