using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PersonalProspec.Api.Settings.Handlers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.UserPolicies;

namespace PersonalProspec.Api.Controllers;

// Dados públicos de referência (UF, municípios e CNAE): sem tenant, mas só com sessão.
[ApiController]
[Route("api/[controller]")]
public sealed class ReferenceController(IReferenceQueryService referenceQueryService) : ControllerBase
{
    [Authorize(Roles = Policy.Administrator)]
    [HttpGet("get_states_reference")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IReadOnlyList<StateResponse>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public IReadOnlyList<StateResponse> GetStates() =>
        referenceQueryService.GetStates();

    [Authorize(Roles = Policy.Administrator)]
    [HttpGet("get_municipalities_reference")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PageList<MunicipalityResponse>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<PageList<MunicipalityResponse>> GetMunicipalities(
        [FromQuery] string state,
        [FromQuery] string? search,
        [FromQuery] PageParams pageParams) =>
        referenceQueryService.GetMunicipalitiesAsync(state, search, pageParams);

    [Authorize(Roles = Policy.Administrator)]
    [HttpGet("search_cnae_reference")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IReadOnlyList<CnaeResponse>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<IReadOnlyList<CnaeResponse>> SearchCnae([FromQuery] string? search) =>
        referenceQueryService.SearchCnaeAsync(search);
}
