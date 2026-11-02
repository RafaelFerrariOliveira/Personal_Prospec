namespace PersonalProspec.Domain.ValueObjects;

// Parâmetros do Argon2id, versionados por byte no início do hash (rehash transparente).
// V1: perfil mínimo da OWASP Password Storage Cheat Sheet (m=19456 KiB = 19 MiB, t=2, p=1).
// Tamanhos de sal e de hash (16 e 32 bytes) são escolha de implementação, fora da fonte OWASP.
public sealed record ArgonParameters(
    byte Version,
    int MemoryKiB,
    int Iterations,
    int Parallelism,
    int SaltLength,
    int HashLength)
{
    public static readonly ArgonParameters V1 = new(1, 19456, 2, 1, 16, 32);
}
