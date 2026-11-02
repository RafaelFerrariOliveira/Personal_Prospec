using System.Net;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.ReferenceControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GetStatesReference(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = "api/Reference/get_states_reference";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task GetStatesReference_Authenticated_ReturnsTwentySevenStates()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJsonAsync(response);
        Assert.Equal(27, body.GetArrayLength());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task GetStatesReference_WithoutSession_ReturnsUnauthorized()
    {
        var response = await CreateRawClient().GetAsync(Url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task GetStatesReference_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
