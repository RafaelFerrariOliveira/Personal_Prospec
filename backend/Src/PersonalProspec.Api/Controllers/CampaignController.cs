using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PersonalProspec.Api.Extensions;
using PersonalProspec.Api.Settings.Handlers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings.Filters;
using PersonalProspec.Domain.UserPolicies;

namespace PersonalProspec.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CampaignController(
    ICampaignCommandService campaignCommandService,
    ICampaignQueryService campaignQueryService)
    : ControllerBase
{
    [Authorize(Roles = Policy.Administrator)]
    [HttpPost("create_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Create([FromBody] CreateCampaignRequest request) =>
        campaignCommandService.CreateCampaignAsync(request, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpPut("update_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Update([FromBody] UpdateCampaignRequest request) =>
        campaignCommandService.UpdateCampaignAsync(request, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpPost("start_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Start([FromBody] CampaignIdRequest request) =>
        campaignCommandService.StartCampaignAsync(request.Id, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpPost("pause_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Pause([FromBody] CampaignIdRequest request) =>
        campaignCommandService.PauseCampaignAsync(request.Id, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpPost("resume_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Resume([FromBody] CampaignIdRequest request) =>
        campaignCommandService.ResumeCampaignAsync(request.Id, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpPost("cancel_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Cancel([FromBody] CampaignIdRequest request) =>
        campaignCommandService.CancelCampaignAsync(request.Id, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpGet("get_by_id_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CampaignDetailResponse))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<CampaignDetailResponse?> GetById([FromQuery] Guid id) =>
        campaignQueryService.GetByIdCampaignAsync(id, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpGet("get_all_with_pagination_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PageList<CampaignListItemResponse>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<PageList<CampaignListItemResponse>> GetAllWithPagination([FromQuery] CampaignPageParams pageParams) =>
        campaignQueryService.GetAllWithPaginationCampaignAsync(pageParams, User.GetBusinessUnitId());

    [Authorize(Roles = Policy.Administrator)]
    [HttpGet("get_history_campaign")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PageList<CampaignEventResponse>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<PageList<CampaignEventResponse>> GetHistory([FromQuery] CampaignHistoryPageParams pageParams) =>
        campaignQueryService.GetHistoryCampaignAsync(pageParams, User.GetBusinessUnitId());
}
