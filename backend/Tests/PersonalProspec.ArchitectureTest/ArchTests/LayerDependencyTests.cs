using ArchUnitNET.Domain;
using ArchUnitNET.Fluent;
using ArchUnitNET.Loader;
using ArchUnitNET.xUnit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;
using Assembly = System.Reflection.Assembly;

namespace PersonalProspec.ArchitectureTest.ArchTests;

// Cadeia obrigatória: Domain <- Infra <- ApplicationService <- Api.
// PENDENTE: Main Sequence Distance por camada (Domain 0.6, App 0.25, Infra 0.25, Api 0.1).
public sealed class LayerDependencyTests
{
    private static readonly Assembly DomainAssembly = typeof(PersonalProspec.Domain.AssemblyMarker).Assembly;
    private static readonly Assembly InfraAssembly = typeof(PersonalProspec.Infra.AssemblyMarker).Assembly;
    private static readonly Assembly ApplicationServiceAssembly =
        typeof(PersonalProspec.ApplicationService.AssemblyMarker).Assembly;
    private static readonly Assembly ApiAssembly = typeof(PersonalProspec.Api.AssemblyMarker).Assembly;

    private static readonly Architecture Architecture = new ArchLoader()
        .LoadAssemblies(DomainAssembly, InfraAssembly, ApplicationServiceAssembly, ApiAssembly)
        .Build();

    private static readonly IObjectProvider<IType> DomainLayer =
        Types().That().ResideInAssembly(DomainAssembly).As("Domain");

    private static readonly IObjectProvider<IType> InfraLayer =
        Types().That().ResideInAssembly(InfraAssembly).As("Infra");

    private static readonly IObjectProvider<IType> ApplicationServiceLayer =
        Types().That().ResideInAssembly(ApplicationServiceAssembly).As("ApplicationService");

    private static readonly IObjectProvider<IType> ApiLayer =
        Types().That().ResideInAssembly(ApiAssembly).As("Api");

    [Fact]
    [Trait("Architecture", "Domain não depende de nenhuma camada")]
    public void Domain_ShouldNotDependOn_AnyOtherLayer()
    {
        IArchRule rule = Types().That().Are(DomainLayer)
            .Should().NotDependOnAny(InfraLayer)
            .AndShould().NotDependOnAny(ApplicationServiceLayer)
            .AndShould().NotDependOnAny(ApiLayer);

        rule.Check(Architecture);
    }

    [Fact]
    [Trait("Architecture", "Infra depende só de Domain")]
    public void Infra_ShouldNotDependOn_ApplicationServiceOrApi()
    {
        IArchRule rule = Types().That().Are(InfraLayer)
            .Should().NotDependOnAny(ApplicationServiceLayer)
            .AndShould().NotDependOnAny(ApiLayer);

        rule.Check(Architecture);
    }

    [Fact]
    [Trait("Architecture", "ApplicationService não depende de Api")]
    public void ApplicationService_ShouldNotDependOn_Api()
    {
        IArchRule rule = Types().That().Are(ApplicationServiceLayer)
            .Should().NotDependOnAny(ApiLayer);

        rule.Check(Architecture);
    }
}
