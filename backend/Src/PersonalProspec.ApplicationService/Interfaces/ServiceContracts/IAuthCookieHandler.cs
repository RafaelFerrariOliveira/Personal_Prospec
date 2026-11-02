namespace PersonalProspec.ApplicationService.Interfaces.ServiceContracts;

// Implementado na Api (depende de HttpContext). Token nunca vai no corpo da resposta: só em cookie.
public interface IAuthCookieHandler
{
    void SetSession(string accessToken, string refreshToken);
    void ClearSession();
    string? GetRefreshToken();
}
