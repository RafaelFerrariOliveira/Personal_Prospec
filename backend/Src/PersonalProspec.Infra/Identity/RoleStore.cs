using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Infra.Identity;

// Role não é ITenantOwned (a conta tem uma role fixa), então não há filtro de tenant a ignorar.
public sealed class RoleStore(ApplicationContext context) : IRoleStore<Role>
{
    private DbSet<Role> Roles => context.Set<Role>();

    public void Dispose()
    {
    }

    public Task<string> GetRoleIdAsync(Role role, CancellationToken cancellationToken) =>
        Task.FromResult(role.Id.ToString());

    public Task<string?> GetRoleNameAsync(Role role, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(role.Name);

    public Task SetRoleNameAsync(Role role, string? roleName, CancellationToken cancellationToken)
    {
        role.Name = roleName ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task<string?> GetNormalizedRoleNameAsync(Role role, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(role.NormalizedName);

    public Task SetNormalizedRoleNameAsync(Role role, string? normalizedName, CancellationToken cancellationToken)
    {
        role.NormalizedName = normalizedName ?? string.Empty;
        return Task.CompletedTask;
    }

    public async Task<IdentityResult> CreateAsync(Role role, CancellationToken cancellationToken)
    {
        await Roles.AddAsync(role, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> UpdateAsync(Role role, CancellationToken cancellationToken)
    {
        Roles.Update(role);
        await context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> DeleteAsync(Role role, CancellationToken cancellationToken)
    {
        Roles.Remove(role);
        await context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<Role?> FindByIdAsync(string roleId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(roleId, out var id))
            return null;

        return await Roles.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<Role?> FindByNameAsync(string normalizedRoleName, CancellationToken cancellationToken) =>
        await Roles.FirstOrDefaultAsync(r => r.NormalizedName == normalizedRoleName, cancellationToken);
}
