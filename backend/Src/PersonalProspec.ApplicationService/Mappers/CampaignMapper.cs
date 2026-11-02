using NodaTime;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.ApplicationService.Interfaces.MapperContracts;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.ApplicationService.Mappers;

public sealed class CampaignMapper(IClock clock) : ICampaignMapper
{
    public Campaign CreateRequestToDomain(CreateCampaignRequest dto, Guid businessUnitId)
    {
        var id = Guid.NewGuid();
        var now = clock.GetCurrentInstant();

        return new Campaign
        {
            Id = id,
            RequestId = dto.RequestId,
            Name = Required(dto.Name),
            Objective = Required(dto.Objective),
            IdealProfile = Optional(dto.IdealProfile),
            Segment = Required(dto.Segment),
            Services = Optional(dto.Services),
            Differentials = Optional(dto.Differentials),
            ValueProposition = Optional(dto.ValueProposition),
            TargetLeadCount = dto.TargetLeadCount,
            Status = ECampaignStatus.Draft,
            CreatedAt = now,
            UpdatedAt = now,
            BusinessUnitId = businessUnitId,
            Locations = ToLocations(dto.Locations, id, businessUnitId),
            Cnaes = ToCnaes(dto.CnaeCodes, id, businessUnitId)
        };
    }

    public Campaign UpdateRequestToCandidate(UpdateCampaignRequest dto, Guid businessUnitId) =>
        new()
        {
            Id = dto.Id,
            Name = Required(dto.Name),
            Objective = Required(dto.Objective),
            IdealProfile = Optional(dto.IdealProfile),
            Segment = Required(dto.Segment),
            Services = Optional(dto.Services),
            Differentials = Optional(dto.Differentials),
            ValueProposition = Optional(dto.ValueProposition),
            TargetLeadCount = dto.TargetLeadCount,
            BusinessUnitId = businessUnitId,
            Locations = ToLocations(dto.Locations, dto.Id, businessUnitId),
            Cnaes = ToCnaes(dto.CnaeCodes, dto.Id, businessUnitId)
        };

    public bool IsEquivalent(Campaign existing, CreateCampaignRequest dto) =>
        existing.Name == Required(dto.Name)
        && existing.Objective == Required(dto.Objective)
        && existing.IdealProfile == Optional(dto.IdealProfile)
        && existing.Segment == Required(dto.Segment)
        && existing.Services == Optional(dto.Services)
        && existing.Differentials == Optional(dto.Differentials)
        && existing.ValueProposition == Optional(dto.ValueProposition)
        && existing.TargetLeadCount == dto.TargetLeadCount
        && SameSet(existing.Locations.Select(l => l.State + l.MunicipalityCode),
            dto.Locations.Select(l => l.State.Trim().ToUpperInvariant() + l.MunicipalityCode.Trim()))
        && SameSet(existing.Cnaes.Select(n => n.CnaeCode), dto.CnaeCodes);

    public IReadOnlyList<string> GetChangedFields(Campaign campaign, UpdateCampaignRequest dto)
    {
        var changed = new List<string>();

        if (campaign.Name != Required(dto.Name)) changed.Add(nameof(Campaign.Name));
        if (campaign.Objective != Required(dto.Objective)) changed.Add(nameof(Campaign.Objective));
        if (campaign.IdealProfile != Optional(dto.IdealProfile)) changed.Add(nameof(Campaign.IdealProfile));
        if (campaign.Segment != Required(dto.Segment)) changed.Add(nameof(Campaign.Segment));
        if (campaign.Services != Optional(dto.Services)) changed.Add(nameof(Campaign.Services));
        if (campaign.Differentials != Optional(dto.Differentials)) changed.Add(nameof(Campaign.Differentials));
        if (campaign.ValueProposition != Optional(dto.ValueProposition)) changed.Add(nameof(Campaign.ValueProposition));
        if (campaign.TargetLeadCount != dto.TargetLeadCount) changed.Add(nameof(Campaign.TargetLeadCount));

        if (!SameSet(campaign.Locations.Select(l => l.State + l.MunicipalityCode),
                dto.Locations.Select(l => l.State.Trim().ToUpperInvariant() + l.MunicipalityCode.Trim())))
            changed.Add(nameof(Campaign.Locations));

        if (!SameSet(campaign.Cnaes.Select(n => n.CnaeCode), dto.CnaeCodes))
            changed.Add(nameof(Campaign.Cnaes));

        return changed;
    }

    public void ApplyUpdate(Campaign campaign, UpdateCampaignRequest dto)
    {
        campaign.Name = Required(dto.Name);
        campaign.Objective = Required(dto.Objective);
        campaign.IdealProfile = Optional(dto.IdealProfile);
        campaign.Segment = Required(dto.Segment);
        campaign.Services = Optional(dto.Services);
        campaign.Differentials = Optional(dto.Differentials);
        campaign.ValueProposition = Optional(dto.ValueProposition);
        campaign.TargetLeadCount = dto.TargetLeadCount;
        campaign.UpdatedAt = clock.GetCurrentInstant();
    }

    public List<CampaignLocation> ToLocations(IEnumerable<LocationRequest> dto, Guid campaignId, Guid businessUnitId) =>
        dto.Select(l => new CampaignLocation
        {
            Id = Guid.NewGuid(),
            CampaignId = campaignId,
            State = l.State.Trim().ToUpperInvariant(),
            MunicipalityCode = l.MunicipalityCode.Trim(),
            BusinessUnitId = businessUnitId
        }).ToList();

    public List<CampaignCnae> ToCnaes(IEnumerable<string> codes, Guid campaignId, Guid businessUnitId) =>
        codes.Select(c => new CampaignCnae
        {
            Id = Guid.NewGuid(),
            CampaignId = campaignId,
            CnaeCode = c.Trim(),
            BusinessUnitId = businessUnitId
        }).ToList();

    public CampaignListItemResponse DomainToListItemResponse(Campaign campaign) =>
        new()
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Segment = campaign.Segment,
            LocationSummary = LocationSummary(campaign.Locations),
            Status = campaign.Status,
            CreatedAt = campaign.CreatedAt.ToDateTimeUtc()
        };

    public PageList<CampaignListItemResponse> DomainToPageResponse(PageList<Campaign> campaigns) =>
        new(campaigns.Items.Select(DomainToListItemResponse).ToList(),
            campaigns.TotalCount, campaigns.PageNumber, campaigns.PageSize);

    public CampaignDetailResponse DomainToDetailResponse(
        Campaign campaign,
        IReadOnlyList<Municipality> municipalities,
        IReadOnlyList<Cnae> cnaes)
    {
        var municipalityNames = municipalities.ToDictionary(m => m.Code, m => m.Name);
        var cnaeDescriptions = cnaes.ToDictionary(c => c.Code, c => c.Description);

        return new CampaignDetailResponse
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Objective = campaign.Objective,
            IdealProfile = campaign.IdealProfile,
            Segment = campaign.Segment,
            Services = campaign.Services,
            Differentials = campaign.Differentials,
            ValueProposition = campaign.ValueProposition,
            TargetLeadCount = campaign.TargetLeadCount,
            Locations = campaign.Locations
                .Select(l => new LocationResponse
                {
                    State = l.State,
                    MunicipalityCode = l.MunicipalityCode,
                    MunicipalityName = municipalityNames.GetValueOrDefault(l.MunicipalityCode, l.MunicipalityCode)
                })
                .OrderBy(l => l.MunicipalityName)
                .ToList(),
            Cnaes = campaign.Cnaes
                .Select(n => new CnaeResponse
                {
                    Code = n.CnaeCode,
                    Description = cnaeDescriptions.GetValueOrDefault(n.CnaeCode, n.CnaeCode)
                })
                .OrderBy(n => n.Code)
                .ToList(),
            Status = campaign.Status,
            CreatedAt = campaign.CreatedAt.ToDateTimeUtc(),
            UpdatedAt = campaign.UpdatedAt.ToDateTimeUtc()
        };
    }

    public PageList<CampaignEventResponse> EventsToPageResponse(PageList<Event> events) =>
        new(events.Items
                .Select(e => new CampaignEventResponse
                {
                    Type = e.Type,
                    Description = e.Description,
                    OccurredAt = e.OccurredAt.ToDateTimeUtc()
                })
                .ToList(),
            events.TotalCount, events.PageNumber, events.PageSize);

    private static string Required(string? value) => (value ?? string.Empty).Trim();

    private static string? Optional(string? value)
    {
        var trimmed = value?.Trim();

        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static bool SameSet(IEnumerable<string> left, IEnumerable<string> right) =>
        left.Order().SequenceEqual(right.Select(v => v.Trim()).Order());

    // Exemplo: "SP, 3 cidades". Toda cidade da campanha é da mesma UF (validado na criação e na edição).
    private static string LocationSummary(IReadOnlyCollection<CampaignLocation> locations)
    {
        if (locations.Count == 0)
            return string.Empty;

        var state = locations.First().State;

        return locations.Count == 1 ? $"{state}, 1 cidade" : $"{state}, {locations.Count} cidades";
    }
}
