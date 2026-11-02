using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests;

public sealed class RefreshTokenTests : AuthenticationControllerSetup
{
    private const string ActionName = nameof(AuthenticationController.RefreshToken);

    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void RefreshToken_Metadata_IsAnonymousPostWithRateLimitAndRoute()
    {
        Assert.Equal("refresh_token", RouteTemplate(ActionName));
        Assert.Equal("POST", HttpVerb(ActionName));
        Assert.True(IsAnonymous(ActionName));
        Assert.Null(AuthorizedRoles(ActionName));
        Assert.Equal(ExpectedRateLimitPolicy, RateLimitPolicy(ActionName));
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task RefreshToken_Called_DelegatesToCommandService()
    {
        CommandService.Setup(s => s.RefreshTokenAsync()).ReturnsAsync(true);

        var result = await Controller.RefreshToken();

        Assert.True(result);
        CommandService.Verify(s => s.RefreshTokenAsync(), Times.Once);
    }
}
