using FluentValidation;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Handlers.ValidationSettings;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.Domain.EntitiesValidation;

public sealed class CampaignValidation : Validate<Campaign>
{
    private const int CnaeCodeLength = 7;

    private readonly CampaignOptions _options;

    public CampaignValidation(CampaignOptions options)
    {
        _options = options;
        SetRules();
    }

    private void SetRules()
    {
        RequiredText(c => c.Name, "Nome", _options.NameMaxLength);
        RequiredText(c => c.Objective, "Objetivo", _options.ObjectiveMaxLength);
        RequiredText(c => c.Segment, "Segmento", _options.SegmentMaxLength);

        OptionalText(c => c.IdealProfile, "Perfil de empresa ideal");
        OptionalText(c => c.Services, "Serviços");
        OptionalText(c => c.Differentials, "Diferenciais");
        OptionalText(c => c.ValueProposition, "Proposta de valor");

        RuleFor(c => c.TargetLeadCount)
            .InclusiveBetween(1, _options.MaxTargetLeadCount)
            .WithMessage(EMessage.OutOfRange.GetDescription()
                .FormatTo("Quantidade de leads", 1, _options.MaxTargetLeadCount));

        RuleFor(c => c.Locations)
            .Must(l => l.Count >= 1 && l.Count <= _options.MaxCitiesPerCampaign)
            .WithMessage(EMessage.ItemCountOutOfRange.GetDescription()
                .FormatTo("Localização", 1, _options.MaxCitiesPerCampaign))
            .DependentRules(() =>
            {
                RuleFor(c => c.Locations)
                    .Must(l => l.All(x => BrazilianStates.IsValid(x.State)))
                    .WithMessage(EMessage.InvalidFormat.GetDescription().FormatTo("UF"));

                RuleFor(c => c.Locations)
                    .Must(l => l.Select(x => x.State).Distinct().Count() == 1)
                    .WithMessage(EMessage.LocationsMustShareState.GetDescription());

                RuleFor(c => c.Locations)
                    .Must(l => l.Select(x => x.MunicipalityCode).Distinct().Count() == l.Count)
                    .WithMessage(EMessage.DuplicateItem.GetDescription().FormatTo("Cidade"));
            });

        RuleFor(c => c.Cnaes)
            .Must(n => n.Count >= 1 && n.Count <= _options.MaxCnaePerCampaign)
            .WithMessage(EMessage.ItemCountOutOfRange.GetDescription()
                .FormatTo("CNAE", 1, _options.MaxCnaePerCampaign))
            .DependentRules(() =>
            {
                RuleFor(c => c.Cnaes)
                    .Must(n => n.All(x => x.CnaeCode.Length == CnaeCodeLength && x.CnaeCode.All(char.IsAsciiDigit)))
                    .WithMessage(EMessage.InvalidFormat.GetDescription().FormatTo("CNAE"));

                RuleFor(c => c.Cnaes)
                    .Must(n => n.Select(x => x.CnaeCode).Distinct().Count() == n.Count)
                    .WithMessage(EMessage.DuplicateItem.GetDescription().FormatTo("CNAE"));
            });
    }

    private void RequiredText(System.Linq.Expressions.Expression<Func<Campaign, string>> property, string label, int max)
    {
        RuleFor(property)
            .Must(v => !string.IsNullOrWhiteSpace(v))
            .WithMessage(EMessage.Required.GetDescription().FormatTo(label))
            .MaximumLength(max)
            .WithMessage(EMessage.MoreExpected.GetDescription().FormatTo(label, $"até {max}"));
    }

    private void OptionalText(System.Linq.Expressions.Expression<Func<Campaign, string?>> property, string label)
    {
        RuleFor(property)
            .MaximumLength(_options.LongTextMaxLength)
            .WithMessage(EMessage.MoreExpected.GetDescription().FormatTo(label, $"até {_options.LongTextMaxLength}"));
    }
}
