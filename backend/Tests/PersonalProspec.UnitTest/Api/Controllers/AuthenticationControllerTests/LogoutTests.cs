using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.Domain.UserPolicies;
using PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests;

public sealed class LogoutTests : AuthenticationControllerSetup
{
    private const string ActionName = nameof(AuthenticationController.Logout);

    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void Logout_Metadata_RequiresAdministratorAndIsPostWithRateLimit()
    {
        Assert.Equal("logout", RouteTemplate(ActionName));
        Assert.Equal("POST", HttpVerb(ActionName));
        Assert.False(IsAnonymous(ActionName));
        Assert.Equal(Policy.Administrator, AuthorizedRoles(ActionName));
        Assert.Equal(ExpectedRateLimitPolicy, RateLimitPolicy(ActionName));
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task Logout_AuthenticatedUser_PassesUserAndBusinessUnitFromClaims()
    {
        CommandService.Setup(s => s.LogoutAsync(UserId, BusinessUnitId)).ReturnsAsync(true);

        var result = await Controller.Logout();

        Assert.True(result);
        CommandService.Verify(s => s.LogoutAsync(UserId, BusinessUnitId), Times.Once);
    }
}
