namespace PersonalProspec.ApplicationService.Traces;

public static class AuthenticationTrace
{
    public const string Login = "Entrada no sistema";
    public const string Logout = "Saída do sistema";
    public const string RefreshToken = "Renovação de sessão";
    public const string GetSession = "Consulta de sessão";
}
