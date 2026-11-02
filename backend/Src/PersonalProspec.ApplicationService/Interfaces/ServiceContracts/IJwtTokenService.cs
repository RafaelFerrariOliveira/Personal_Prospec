using PersonalProspec.Domain.Entities.Identity;

namespace PersonalProspec.ApplicationService.Interfaces.ServiceContracts;

// Implementado na Api (usa o pacote do JwtBearer).
public interface IJwtTokenService
{
    string CreateAccessToken(User user, string role);

    // Raw vai para o cookie; Hash (SHA-256 em hexadecimal) é o que o banco guarda.
    (string Raw, string Hash) CreateRefreshToken();

    string HashToken(string rawToken);
}
