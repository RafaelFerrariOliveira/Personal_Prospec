using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Request;

namespace PersonalProspec.UnitTest.Builders;

public sealed class LoginRequestBuilderTest
{
    private string _email = "teste@exemplo.test";
    private string _password = "senha-ficticia-123";

    public static LoginRequestBuilderTest NewObject() => new();

    public LoginRequest Build() => new() { Email = _email, Password = _password };

    public LoginRequestBuilderTest WithEmail(string email) { _email = email; return this; }
    public LoginRequestBuilderTest WithPassword(string password) { _password = password; return this; }
}
