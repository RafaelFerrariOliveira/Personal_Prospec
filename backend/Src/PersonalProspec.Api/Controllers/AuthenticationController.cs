using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PersonalProspec.Api.Extensions;
using PersonalProspec.Api.Settings.Handlers;
using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Request;
using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Response;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.UserPolicies;

namespace PersonalProspec.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthenticationController(
    IAuthenticationCommandService authenticationCommandService,
    IAuthenticationQueryService authenticationQueryService)
    : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("generate_access_token")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> GenerateAccessToken([FromBody] LoginRequest request) =>
        authenticationCommandService.LoginAsync(request);

    [Authorize(Roles = Policy.Administrator)]
    [HttpPost("logout")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Logout() =>
        authenticationCommandService.LogoutAsync(User.GetUserId(), User.GetBusinessUnitId());

    // O refresh vem do cookie; por isso é anônimo (o access token pode já ter expirado).
    [AllowAnonymous]
    [HttpPost("refresh_token")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> RefreshToken() =>
        authenticationCommandService.RefreshTokenAsync();

    [Authorize(Roles = Policy.Administrator)]
    [HttpGet("get_session")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SessionResponse))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<SessionResponse?> GetSession() =>
        authenticationQueryService.GetSessionAsync(User.GetUserId(), User.GetBusinessUnitId());
}
