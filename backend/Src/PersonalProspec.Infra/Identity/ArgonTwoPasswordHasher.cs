using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using PersonalProspec.Domain.Providers;
using PersonalProspec.Domain.ValueObjects;

namespace PersonalProspec.Infra.Identity;

// Argon2id com pepper (HMAC-SHA256 da senha com PepperOptions.Secret). Formato do hash em base64:
// [1 byte de versão dos parâmetros][sal][hash]. A versão permite rehash transparente quando os
// parâmetros mudam. Nunca remover uma versão antiga do mapa sem confirmar que não há hash dela no banco.
public sealed class ArgonTwoPasswordHasher<TUser>(PepperOptions pepperOptions) : IPasswordHasher<TUser>
    where TUser : class
{
    private static readonly ArgonParameters Current = ArgonParameters.V1;

    private static readonly Dictionary<byte, ArgonParameters> Versions = new()
    {
        [ArgonParameters.V1.Version] = ArgonParameters.V1
    };

    public string HashPassword(TUser user, string password)
    {
        var salt = RandomNumberGenerator.GetBytes(Current.SaltLength);
        var hash = ComputeHash(password, salt, Current);

        var payload = new byte[1 + salt.Length + hash.Length];
        payload[0] = Current.Version;
        salt.CopyTo(payload, 1);
        hash.CopyTo(payload, 1 + salt.Length);

        return Convert.ToBase64String(payload);
    }

    public PasswordVerificationResult VerifyHashedPassword(TUser user, string hashedPassword, string providedPassword)
    {
        byte[] payload;
        try
        {
            payload = Convert.FromBase64String(hashedPassword);
        }
        catch (FormatException)
        {
            return PasswordVerificationResult.Failed;
        }

        if (payload.Length < 2 || !Versions.TryGetValue(payload[0], out var parameters))
            return PasswordVerificationResult.Failed;

        var expectedLength = 1 + parameters.SaltLength + parameters.HashLength;
        if (payload.Length != expectedLength)
            return PasswordVerificationResult.Failed;

        var salt = payload.AsSpan(1, parameters.SaltLength).ToArray();
        var storedHash = payload.AsSpan(1 + parameters.SaltLength).ToArray();
        var computed = ComputeHash(providedPassword, salt, parameters);

        if (!CryptographicOperations.FixedTimeEquals(computed, storedHash))
            return PasswordVerificationResult.Failed;

        return parameters.Version == Current.Version
            ? PasswordVerificationResult.Success
            : PasswordVerificationResult.SuccessRehashNeeded;
    }

    private byte[] ComputeHash(string password, byte[] salt, ArgonParameters parameters)
    {
        var peppered = HMACSHA256.HashData(Encoding.UTF8.GetBytes(pepperOptions.Secret), Encoding.UTF8.GetBytes(password));

        using var argon = new Argon2id(peppered)
        {
            Salt = salt,
            MemorySize = parameters.MemoryKiB,
            Iterations = parameters.Iterations,
            DegreeOfParallelism = parameters.Parallelism
        };

        return argon.GetBytes(parameters.HashLength);
    }
}
