using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;

namespace PersonalProspec.Api.Extensions;

public static class AntiforgeryExtension
{
    extension(IAntiforgery antiforgery)
    {
        // O CsrfValidationMiddleware roda ANTES da autenticação (ordem do padrão), então na validação o
        // usuário ainda é anônimo. Um token amarrado ao usuário autenticado nunca seria aceito. Por isso o
        // token é gerado com identidade anônima: continua sendo um par cookie mais token, que um site de
        // terceiros não consegue ler, e vale antes e depois do login.
        public string GetAnonymousRequestToken(HttpContext context)
        {
            var original = context.User;
            context.User = new ClaimsPrincipal(new ClaimsIdentity());

            try
            {
                return antiforgery.GetAndStoreTokens(context).RequestToken!;
            }
            finally
            {
                context.User = original;
            }
        }
    }
}
