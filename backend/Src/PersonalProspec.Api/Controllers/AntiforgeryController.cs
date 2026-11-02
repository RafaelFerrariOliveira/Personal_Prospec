using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PersonalProspec.Api.Extensions;
using PersonalProspec.Api.Settings.Handlers;
using PersonalProspec.ApplicationService.Dtos.AntiforgeryDtos.Response;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AntiforgeryController(IAntiforgery antiforgery) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("token")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AntiforgeryTokenResponse))]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public AntiforgeryTokenResponse GetToken() =>
        new() { Token = antiforgery.GetAnonymousRequestToken(HttpContext) };
}
