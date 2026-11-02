using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Providers;
using PersonalProspec.Domain.UserPolicies;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Infra.ORM.Seeds;

// Idempotente. Cria a role fixa e, SÓ se não existir nenhuma conta, a conta única a partir de
// SeedOptions (user-secrets). Nunca registra o e-mail nem a senha em log.
public sealed class InitialSeed(
    ApplicationContext context,
    IPasswordHasher<User> passwordHasher,
    SeedOptions seedOptions,
    IClock clock)
{
    public async Task RunAsync()
    {
        await EnsureRoleAsync();
        await EnsureAccountAsync();
    }

    private async Task EnsureRoleAsync()
    {
        var exists = await context.Set<Role>().AnyAsync(r => r.Id == SystemSeedId.AdministratorRoleId);
        if (exists)
            return;

        context.Set<Role>().Add(new Role
        {
            Id = SystemSeedId.AdministratorRoleId,
            Name = Policy.Administrator,
            NormalizedName = Policy.Administrator.ToUpperInvariant()
        });

        await context.SaveChangesAsync();
    }

    private async Task EnsureAccountAsync()
    {
        var hasAnyUser = await context.Set<User>().IgnoreQueryFilters().AnyAsync();
        if (hasAnyUser)
            return;

        var email = seedOptions.Email.Trim().ToLowerInvariant();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            PasswordHash = string.Empty,
            SecurityStamp = Guid.NewGuid().ToString("N"),
            RoleId = SystemSeedId.AdministratorRoleId,
            CreatedAt = clock.GetCurrentInstant(),
            BusinessUnitId = SystemSeedId.BusinessUnitId
        };

        user.PasswordHash = passwordHasher.HashPassword(user, seedOptions.Password);

        context.Set<User>().Add(user);
        await context.SaveChangesAsync();
    }
}
