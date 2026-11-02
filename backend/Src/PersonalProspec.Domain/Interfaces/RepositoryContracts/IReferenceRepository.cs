using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.Domain.Interfaces.RepositoryContracts;

public interface IReferenceRepository
{
    Task<PageList<Municipality>> GetMunicipalitiesAsync(string state, string? search, PageParams pageParams);

    Task<IReadOnlyList<Cnae>> SearchCnaeAsync(string search, int limit);

    // Devolvem só os códigos que existem; quem chama compara com o que pediu.
    Task<IReadOnlyList<Cnae>> FindCnaesByCodesAsync(IReadOnlyCollection<string> codes);

    Task<IReadOnlyList<Municipality>> FindMunicipalitiesByCodesAsync(IReadOnlyCollection<string> codes);
}
