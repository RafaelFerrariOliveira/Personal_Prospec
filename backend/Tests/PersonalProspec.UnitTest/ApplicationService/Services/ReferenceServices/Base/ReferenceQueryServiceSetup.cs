using Moq;
using PersonalProspec.ApplicationService.Services.ReferenceServices;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.UnitTest.ApplicationService.Services.ReferenceServices.Base;

public abstract class ReferenceQueryServiceSetup
{
    protected readonly Mock<IReferenceRepository> ReferenceRepository = new();
    protected readonly ReferenceQueryService ReferenceQueryService;

    protected ReferenceQueryServiceSetup()
    {
        ReferenceQueryService = new ReferenceQueryService(ReferenceRepository.Object);
    }
}
