using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.Query;
using NodaTime;
using PersonalProspec.Domain.Entities.Identity;

namespace PersonalProspec.Domain.Interfaces.RepositoryContracts;

public interface IRefreshTokenRepository
{
    Task<bool> SaveAsync(RefreshToken refreshToken);

    Task<RefreshToken?> FindByPredicateAsync(
        Expression<Func<RefreshToken, bool>> predicate,
        Func<IQueryable<RefreshToken>, IIncludableQueryable<RefreshToken, object>>? include = null,
        bool toQuery = false);

    // refresh_token é anônimo: o tenant do contexto fica vazio. Os três métodos abaixo ignoram o
    // filtro global de tenant; o token (256 bits, único) já protege a busca e o tenant é conferido
    // depois, com o usuário carregado.
    Task<RefreshToken?> FindByTokenHashAsync(string hash);
    Task<int> RevokeAllByUserAsync(Guid userId, Instant now);
    Task<bool> RevokeByIdAsync(Guid id, Instant now);
}
