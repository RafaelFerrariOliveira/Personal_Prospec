using Microsoft.AspNetCore.Identity;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Infra.Identity;

namespace PersonalProspec.Api.Settings.Handlers;

public static class IdentitySettings
{
    // Valores das notas do padrão (backend-seguranca-identity): senha mínima de 8 e bloqueio de
    // 5 tentativas por 5 minutos. Sem regra de composição: a força vem de Argon2id e do bloqueio.
    private const int MaxFailedAccessAttempts = 5;
    private const int LockoutMinutes = 5;

    public static void AddIdentitySettings(this IServiceCollection services)
    {
        services.AddIdentityCore<User>(options =>
            {
                options.Password.RequiredLength = PasswordRules.MinLength;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredUniqueChars = 1;

                options.Lockout.AllowedForNewUsers = true;
                options.Lockout.MaxFailedAccessAttempts = MaxFailedAccessAttempts;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(LockoutMinutes);

                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<Role>()
            .AddUserStore<UserStore>()
            .AddRoleStore<RoleStore>();

        // Registrado depois do AddIdentityCore para substituir o hasher padrão.
        services.AddScoped<IPasswordHasher<User>, ArgonTwoPasswordHasher<User>>();
    }
}
