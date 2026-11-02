using System.Security.Claims;
using PersonalProspec.Domain.Constants;

namespace PersonalProspec.Api.Extensions;

public static class ClaimsPrincipalExtension
{
    extension(ClaimsPrincipal principal)
    {
        // Guid.Empty quando o claim falta: o service então não encontra nada (mesma resposta de "outro tenant").
        public Guid GetBusinessUnitId() =>
            Guid.TryParse(principal.FindFirstValue(CustomClaim.BusinessUnit), out var id) ? id : Guid.Empty;

        public Guid GetUserId() =>
            Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;
    }
}
