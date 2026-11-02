using Microsoft.AspNetCore.Identity;
using Moq;
using PersonalProspec.ApplicationService.Services.AuthenticationServices;
using PersonalProspec.Domain.Entities.Identity;

namespace PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices.Base;

public abstract class AuthenticationQueryServiceSetup
{
    protected readonly Mock<UserManager<User>> UserManager;
    protected readonly AuthenticationQueryService AuthenticationQueryService;

    protected AuthenticationQueryServiceSetup()
    {
        UserManager = new Mock<UserManager<User>>(
            Mock.Of<IUserStore<User>>(), null!, null!, null!, null!, null!, null!, null!, null!);

        AuthenticationQueryService = new AuthenticationQueryService(UserManager.Object);
    }
}
