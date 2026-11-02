using Moq;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.UnitTest.Builders;
using PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices;

public sealed class GetSessionAsyncTests : AuthenticationQueryServiceSetup
{
    private readonly User _user = UserBuilderTest.NewObject().WithEmail("conta@exemplo.test").Build();

    [Fact]
    [Trait("Session", "Perfect setting")]
    public async Task GetSessionAsync_UserInSameBusinessUnit_ReturnsEmail()
    {
        UserManager.Setup(u => u.FindByIdAsync(_user.Id.ToString())).ReturnsAsync(_user);

        var result = await AuthenticationQueryService.GetSessionAsync(_user.Id, _user.BusinessUnitId);

        Assert.NotNull(result);
        Assert.Equal("conta@exemplo.test", result.Email);
    }

    [Fact]
    [Trait("Session", "Not found")]
    public async Task GetSessionAsync_UnknownUser_ReturnsNull()
    {
        UserManager.Setup(u => u.FindByIdAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        var result = await AuthenticationQueryService.GetSessionAsync(Guid.NewGuid(), _user.BusinessUnitId);

        Assert.Null(result);
    }

    [Fact]
    [Trait("Session", "Security: other tenant")]
    public async Task GetSessionAsync_UserOfAnotherBusinessUnit_ReturnsNullLikeUnknownUser()
    {
        UserManager.Setup(u => u.FindByIdAsync(_user.Id.ToString())).ReturnsAsync(_user);

        var result = await AuthenticationQueryService.GetSessionAsync(_user.Id, Guid.NewGuid());

        Assert.Null(result);
    }
}
