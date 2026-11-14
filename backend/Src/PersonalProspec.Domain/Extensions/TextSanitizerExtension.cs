using System.Buffers;
using System.Globalization;
using System.Text;

namespace PersonalProspec.Domain.Extensions;

// Texto livre que chega da tela e alimenta os agentes de IA: nada invisível pode passar adiante.
public static class TextSanitizerExtension
{
    private const int TagBlockStart = 0xE0000;
    private const int TagBlockEnd = 0xE007F;

    extension(string? value)
    {
        public string SanitizeRequired() => Sanitize(value);

        public string? SanitizeOptional()
        {
            var sanitized = Sanitize(value);

            return sanitized.Length == 0 ? null : sanitized;
        }
    }

    private static string Sanitize(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return string.Empty;

        StringBuilder? builder = null;
        var index = 0;

        while (index < value.Length)
        {
            var status = Rune.DecodeFromUtf16(value.AsSpan(index), out var rune, out var consumed);
            // Surrogate solto também sai: além de inválido, faria o Normalize lançar exceção.
            var keep = status == OperationStatus.Done && !IsInvisible(rune);

            if (!keep && builder is null)
                builder = new StringBuilder(value.Length).Append(value, 0, index);
            else if (keep && builder is not null)
                builder.Append(value, index, consumed);

            index += consumed;
        }

        var cleaned = builder?.ToString() ?? value;

        return cleaned.Normalize(NormalizationForm.FormC).Trim();
    }

    // shortcut: remove todo Cf, inclusive o ZWJ de emojis compostos; liberar o U+200D se o produto passar a aceitar emoji.
    private static bool IsInvisible(Rune rune) =>
        rune.Value is >= TagBlockStart and <= TagBlockEnd
        || Rune.GetUnicodeCategory(rune) switch
        {
            UnicodeCategory.Control => rune.Value is not ('\n' or '\r' or '\t'),
            UnicodeCategory.Format => true,
            _ => false
        };
}
