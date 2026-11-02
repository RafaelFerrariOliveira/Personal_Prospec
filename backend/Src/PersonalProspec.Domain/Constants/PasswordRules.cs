namespace PersonalProspec.Domain.Constants;

// Só tamanho mínimo, sem regra de composição: a força vem de Argon2id e do bloqueio por tentativas
// (decisão deliberada da nota backend-seguranca-identity; não "fortalecer" sem pedido).
public static class PasswordRules
{
    public const int MinLength = 8;
}
