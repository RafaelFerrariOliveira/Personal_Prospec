using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests.Base;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests;

public sealed class GenerateAccessTokenTests : AuthenticationControllerSetup
{
    private const string ActionName = nameof(AuthenticationController.GenerateAccessToken);

    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GenerateAccessToken_Metadata_IsAnonymousPostWithRateLimitAndRoute()
    {
        Assert.Equal("api/[controller]", ControllerRoute);
        Assert.Equal("generate_access_token", RouteTemplate(ActionName));
        Assert.Equal("POST", HttpVerb(ActionName));
        Assert.True(IsAnonymous(ActionName));
        Assert.Null(AuthorizedRoles(ActionName));
        Assert.Equal(ExpectedRateLimitPolicy, RateLimitPolicy(ActionName));
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GenerateAccessToken_ValidRequest_DelegatesToLoginAndReturnsItsResult()
    {
        var request = LoginRequestBuilderTest.NewObject().Build();
        CommandService.Setup(s => s.LoginAsync(request)).ReturnsAsync(true);

        var result = await Controller.GenerateAccessToken(request);

        Assert.True(result);
        CommandService.Verify(s => s.LoginAsync(request), Times.Once);
    }
}
