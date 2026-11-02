using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Response;
using PersonalProspec.Domain.UserPolicies;
using PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests;

public sealed class GetSessionTests : AuthenticationControllerSetup
{
    private const string ActionName = nameof(AuthenticationController.GetSession);

    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GetSession_Metadata_RequiresAdministratorAndIsGetWithRateLimit()
    {
        Assert.Equal("get_session", RouteTemplate(ActionName));
        Assert.Equal("GET", HttpVerb(ActionName));
        Assert.False(IsAnonymous(ActionName));
        Assert.Equal(Policy.Administrator, AuthorizedRoles(ActionName));
        Assert.Equal(ExpectedRateLimitPolicy, RateLimitPolicy(ActionName));
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GetSession_AuthenticatedUser_PassesClaimsAndReturnsServiceResult()
    {
        var response = new SessionResponse { Email = "conta@exemplo.test" };
        QueryService.Setup(s => s.GetSessionAsync(UserId, BusinessUnitId)).ReturnsAsync(response);

        var result = await Controller.GetSession();

        Assert.Same(response, result);
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GetSession_ServiceReturnsNull_ReturnsNull()
    {
        QueryService.Setup(s => s.GetSessionAsync(UserId, BusinessUnitId)).ReturnsAsync((SessionResponse?)null);

        var result = await Controller.GetSession();

        Assert.Null(result);
    }
}
