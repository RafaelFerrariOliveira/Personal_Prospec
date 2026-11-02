using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Infra.Identity;

// Identity customizado: POCOs no Domain, sem IdentityDbContext. Toda busca ignora o filtro de tenant,
// porque o login ainda não tem tenant. UserName é o próprio e-mail.
public sealed class UserStore(ApplicationContext context) :
    IUserStore<User>,
    IUserPasswordStore<User>,
    IUserEmailStore<User>,
    IUserLockoutStore<User>,
    IUserRoleStore<User>,
    IUserSecurityStampStore<User>
{
    private DbSet<User> Users => context.Set<User>();

    public void Dispose()
    {
    }

    // IUserStore

    public Task<string> GetUserIdAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult(user.Id.ToString());

    public Task<string?> GetUserNameAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.Email);

    public Task SetUserNameAsync(User user, string? userName, CancellationToken cancellationToken)
    {
        user.Email = userName ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task<string?> GetNormalizedUserNameAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.NormalizedEmail);

    public Task SetNormalizedUserNameAsync(User user, string? normalizedName, CancellationToken cancellationToken)
    {
        user.NormalizedEmail = normalizedName ?? string.Empty;
        return Task.CompletedTask;
    }

    public async Task<IdentityResult> CreateAsync(User user, CancellationToken cancellationToken)
    {
        await Users.AddAsync(user, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> UpdateAsync(User user, CancellationToken cancellationToken)
    {
        Users.Update(user);
        await context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> DeleteAsync(User user, CancellationToken cancellationToken)
    {
        Users.Remove(user);
        await context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<User?> FindByIdAsync(string userId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var id))
            return null;

        return await Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken) =>
        await FindByEmailAsync(normalizedUserName, cancellationToken);

    // IUserPasswordStore

    public Task SetPasswordHashAsync(User user, string? passwordHash, CancellationToken cancellationToken)
    {
        user.PasswordHash = passwordHash ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task<string?> GetPasswordHashAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.PasswordHash);

    public Task<bool> HasPasswordAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult(!string.IsNullOrEmpty(user.PasswordHash));

    // IUserEmailStore (sem confirmação de e-mail: a conta nasce do seed)

    public Task SetEmailAsync(User user, string? email, CancellationToken cancellationToken)
    {
        user.Email = email ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task<string?> GetEmailAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.Email);

    public Task<bool> GetEmailConfirmedAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult(true);

    public Task SetEmailConfirmedAsync(User user, bool confirmed, CancellationToken cancellationToken) =>
        Task.CompletedTask;

    public async Task<User?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
        await Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

    public Task<string?> GetNormalizedEmailAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.NormalizedEmail);

    public Task SetNormalizedEmailAsync(User user, string? normalizedEmail, CancellationToken cancellationToken)
    {
        user.NormalizedEmail = normalizedEmail ?? string.Empty;
        return Task.CompletedTask;
    }

    // IUserLockoutStore

    public Task<DateTimeOffset?> GetLockoutEndDateAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult(user.LockoutEnd?.ToDateTimeOffset());

    public Task SetLockoutEndDateAsync(User user, DateTimeOffset? lockoutEnd, CancellationToken cancellationToken)
    {
        user.LockoutEnd = lockoutEnd is null ? null : Instant.FromDateTimeOffset(lockoutEnd.Value);
        return Task.CompletedTask;
    }

    public Task<int> IncrementAccessFailedCountAsync(User user, CancellationToken cancellationToken)
    {
        user.AccessFailedCount++;
        return Task.FromResult(user.AccessFailedCount);
    }

    public Task ResetAccessFailedCountAsync(User user, CancellationToken cancellationToken)
    {
        user.AccessFailedCount = 0;
        return Task.CompletedTask;
    }

    public Task<int> GetAccessFailedCountAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult(user.AccessFailedCount);

    public Task<bool> GetLockoutEnabledAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult(user.LockoutEnabled);

    public Task SetLockoutEnabledAsync(User user, bool enabled, CancellationToken cancellationToken)
    {
        user.LockoutEnabled = enabled;
        return Task.CompletedTask;
    }

    // IUserSecurityStampStore

    public Task SetSecurityStampAsync(User user, string stamp, CancellationToken cancellationToken)
    {
        user.SecurityStamp = stamp;
        return Task.CompletedTask;
    }

    public Task<string?> GetSecurityStampAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.SecurityStamp);

    // IUserRoleStore (uma role por usuário: Role é navegação única)

    public async Task AddToRoleAsync(User user, string roleName, CancellationToken cancellationToken)
    {
        var role = await context.Set<Role>().FirstOrDefaultAsync(r => r.NormalizedName == roleName, cancellationToken)
                   ?? throw new InvalidOperationException("Role não encontrada.");

        user.RoleId = role.Id;
        user.Role = role;
    }

    public Task RemoveFromRoleAsync(User user, string roleName, CancellationToken cancellationToken) =>
        throw new NotSupportedException("A conta tem exatamente uma role.");

    public async Task<IList<string>> GetRolesAsync(User user, CancellationToken cancellationToken)
    {
        var role = user.Role ?? await context.Set<Role>().FirstOrDefaultAsync(r => r.Id == user.RoleId, cancellationToken);

        return role is null ? [] : [role.Name];
    }

    public async Task<bool> IsInRoleAsync(User user, string roleName, CancellationToken cancellationToken)
    {
        var roles = await GetRolesAsync(user, cancellationToken);

        return roles.Any(r => string.Equals(r, roleName, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IList<User>> GetUsersInRoleAsync(string roleName, CancellationToken cancellationToken) =>
        await Users.IgnoreQueryFilters()
            .Where(u => u.Role!.NormalizedName == roleName)
            .ToListAsync(cancellationToken);
}
