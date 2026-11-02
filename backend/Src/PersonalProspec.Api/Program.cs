using PersonalProspec.Api.IoC;
using PersonalProspec.Api.Settings;
using PersonalProspec.Api.Settings.Handlers;

var builder = WebApplication.CreateBuilder(args);
IConfiguration configuration = builder.Configuration;

builder.Services.AddInversionOfControlHandler();
builder.Services.AddSettingsControl(configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks();

var app = builder.Build();

app.AddWebApplication(configuration);
await app.MigrateDatabaseAsync();
app.Run();

namespace PersonalProspec.Api
{
    public abstract partial class Program { } // exposto p/ WebApplicationFactory
}
