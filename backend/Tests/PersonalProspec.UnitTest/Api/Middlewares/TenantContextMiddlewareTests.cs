using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using PersonalProspec.Api.Middlewares;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Handlers.TenantSettings;

namespace PersonalProspec.UnitTest.Api.Middlewares;

public sealed class TenantContextMiddlewareTests
{
    private bool _nextCalled;

    private TenantContextMiddleware NewMiddleware() =>
        new(_ =>
        {
            _nextCalled = true;
            return Task.CompletedTask;
        });

    private static DefaultHttpContext NewContext(params Claim[] claims) =>
        new() { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "teste")) };

    [Fact]
    [Trait("Categoria", "Tenant")]
    public async Task InvokeAsync_BusinessUnitClaimPresent_FillsTenantContext()
    {
        var businessUnitId = Guid.NewGuid();
        var tenant = new CurrentTenantContext();
        var context = NewContext(new Claim(CustomClaim.BusinessUnit, businessUnitId.ToString()));

        await NewMiddleware().InvokeAsync(context, tenant);

        Assert.True(tenant.IsSet);
        Assert.Equal(businessUnitId, tenant.BusinessUnitId);
        Assert.True(_nextCalled);
    }

    [Fact]
    [Trait("Categoria", "Tenant")]
    public async Task InvokeAsync_BusinessUnitClaimAbsent_LeavesTenantContextEmpty()
    {
        var tenant = new CurrentTenantContext();

        await NewMiddleware().InvokeAsync(NewContext(), tenant);

        Assert.False(tenant.IsSet);
        Assert.Equal(Guid.Empty, tenant.BusinessUnitId);
        Assert.True(_nextCalled);
    }

    [Theory]
    [Trait("Categoria", "Tenant")]
    [InlineData("")]
    [InlineData("nao-e-guid")]
    [InlineData("00000000-0000-0000-0000-000000000000")]
    public async Task InvokeAsync_InvalidBusinessUnitClaim_LeavesTenantContextEmpty(string claimValue)
    {
        var tenant = new CurrentTenantContext();
        var context = NewContext(new Claim(CustomClaim.BusinessUnit, claimValue));

        await NewMiddleware().InvokeAsync(context, tenant);

        Assert.False(tenant.IsSet);
        Assert.Equal(Guid.Empty, tenant.BusinessUnitId);
        Assert.True(_nextCalled);
    }
}
