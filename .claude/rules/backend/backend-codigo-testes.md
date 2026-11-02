---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-codigo-testes.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

**REGRA do [padrao-projeto-csharp](./padrao-projeto-csharp.md):** todo teste segue este código-modelo (abreviado com `// ...`). Convenções gerais: [backend-testes-padrao](./backend-testes-padrao.md). Código testado: [backend-codigo-application](./backend-codigo-application.md), [backend-codigo-api](./backend-codigo-api.md).

## Builder: `UnitTest/Builders/CustomerBuilderTest.cs`

```csharp
namespace Projeto.UnitTest.Builders;

public sealed class CustomerBuilderTest
{
    private Guid _id = Guid.NewGuid();
    private EPurpose _purpose = EPurpose.Personal;
    private string _document = "52998224725";
    private string _name = "Test Customer";
    private Guid _businessUnitId = Guid.NewGuid();
    // ...

    public static CustomerBuilderTest NewObject() => new();

    public Customer Build() =>
        new()
        {
            Id = _id,
            Purpose = _purpose,
            Document = _document,
            Name = _name,
            BusinessUnitId = _businessUnitId,
            // ...
        };

    public CustomerBuilderTest WithId(Guid id) { _id = id; return this; }
    public CustomerBuilderTest WithBusinessUnitId(Guid businessUnitId) { _businessUnitId = businessUnitId; return this; }
    // ...
}
```

## Setup: `UnitTest/ApplicationService/Services/CustomerServices/Base/CustomerQueryServiceSetup.cs`

```csharp
public abstract class CustomerQueryServiceSetup
{
    protected readonly Mock<ICustomerRepository> CustomerRepository;
    protected readonly Mock<ICustomerMapper> CustomerMapper;
    protected readonly CustomerQueryService CustomerQueryService;

    protected CustomerQueryServiceSetup()
    {
        CustomerRepository = new Mock<ICustomerRepository>();
        CustomerMapper = new Mock<ICustomerMapper>();

        CustomerQueryService = new CustomerQueryService(
            CustomerRepository.Object,
            CustomerMapper.Object);
    }
}
```

## Unitário (1 arquivo por método): `.../CustomerServices/GetAllCustomersAsyncTests.cs`

```csharp
public sealed class GetAllCustomersAsyncTests : CustomerQueryServiceSetup
{
    [Fact]
    [Trait("Query", "Perfect setting")]
    public async Task GetAllCustomersAsync_PerfectSetting_ReturnsMappedList()
    {
        var businessUnitId = Guid.NewGuid();
        List<Customer> customers = [CustomerBuilderTest.NewObject().WithBusinessUnitId(businessUnitId).Build()];
        List<CustomerListResponse> response = [new CustomerListResponse { Id = Guid.NewGuid(), Name = "Customer A" }];

        CustomerRepository
            .Setup(x => x.FindAllAsync(businessUnitId))
            .ReturnsAsync(customers);

        CustomerMapper
            .Setup(x => x.DomainToListResponse(customers))
            .Returns(response);

        var result = await CustomerQueryService.GetAllCustomersAsync(businessUnitId);

        Assert.Same(response, result);
    }
    // GetAllCustomersAsync_NoCustomers_ReturnsEmptyList ...
}
```

## Integração (1 arquivo por endpoint): `IntegrationTest/Executions/CustomerControllerTests/GetAllCustomers.cs`

```csharp
public sealed class GetAllCustomers(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string EndPointGetUrl = "api/Customer/get_all_customers";

    [Fact]
    [Trait("e2e", "Security: cross business unit must not leak data")]
    public async Task GetAllCustomers_CustomersFromOtherBusinessUnit_AreNeverReturned()
    {
        var otherBusinessUnitId = await CreateBusinessUnitAsync();
        var ownCustomer = await CreateCustomerAsync(SystemSeedIdTools.BusinessUnitId);
        var otherBusinessCustomer = await CreateCustomerAsync(otherBusinessUnitId);

        var client = await CreateAuthenticatedClientWithCsrfAsync(Policy.Administrator);

        var response = await client.GetAsync(EndPointGetUrl, TestContext.Current.CancellationToken);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<List<CustomerListResponse>>(
            JsonOptions, TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.Contains(result, c => c.Id == ownCustomer.Id);
        Assert.DoesNotContain(result, c => c.Id == otherBusinessCustomer.Id);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task GetAllCustomers_RequesterWithoutPermissionRole_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync(Policy.Viewer);

        var response = await client.GetAsync(EndPointGetUrl, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
    // GetAllCustomers_CustomersInRequesterBusinessUnit_ReturnsThem, CreateCustomerAsync ...
}
```

## Regras

- Nome `Metodo_Cenario_ResultadoEsperado` + `[Trait("Categoria", "Descrição")]`; classe de teste `sealed` herdando o Setup.
- Builder fluente (`NewObject()` + `WithXxx()` + `Build()`) em `UnitTest/Builders/`, reaproveitado pelo IntegrationTest.
- Unitário: Moq nas dependências, 1 arquivo por método de service.
- Integração: 1 arquivo por endpoint; sempre cobrir caminho feliz, **isolamento de tenant** e **403 por role**; client via `CreateAuthenticatedClientWithCsrfAsync` (CSRF real); `TestContext.Current.CancellationToken` (xUnit v3).
- Dados de teste fictícios; nunca segredo real ([backend-regra-segredos](./backend-regra-segredos.md)).

**Why:** Código-modelo que o Rafael definiu como obrigatório para todo projeto C# (2026-10-19).
**How to apply:** Gerar e revisar testes a partir deste modelo, trocando `Projeto`, roles e entidades de exemplo; granularidade e infraestrutura em [backend-testes-padrao](./backend-testes-padrao.md).
