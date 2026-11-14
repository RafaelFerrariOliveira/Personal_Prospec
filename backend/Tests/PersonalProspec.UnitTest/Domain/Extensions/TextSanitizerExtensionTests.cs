using PersonalProspec.Domain.Extensions;

namespace PersonalProspec.UnitTest.Domain.Extensions;

public sealed class TextSanitizerExtensionTests
{
    [Fact]
    [Trait("Extension", "Perfect setting")]
    public void SanitizeRequired_CleanText_ReturnsSameInstanceWithoutAllocating()
    {
        const string text = "Campanha Varejo SP";

        var result = text.SanitizeRequired();

        Assert.Same(text, result);
    }

    [Theory]
    [Trait("Extension", "Invisible characters")]
    [InlineData("Nome​", "Nome")]
    [InlineData("﻿Nome", "Nome")]
    [InlineData("No‍me", "Nome")]
    [InlineData("abc‮def", "abcdef")]
    [InlineData("Nome\u0000\u0007\u001B", "Nome")]
    [InlineData("  Nome  ", "Nome")]
    public void SanitizeRequired_TextWithInvisibleOrControlChars_RemovesThem(string input, string expected)
    {
        var result = input.SanitizeRequired();

        Assert.Equal(expected, result);
    }

    [Fact]
    [Trait("Extension", "Invisible characters")]
    public void SanitizeRequired_TagCharactersOutsideBmp_RemovesWholeBlock()
    {
        var hidden = char.ConvertFromUtf32(0xE0000) + char.ConvertFromUtf32(0xE0049) + char.ConvertFromUtf32(0xE007F);

        var result = ("Oi" + hidden + "!").SanitizeRequired();

        Assert.Equal("Oi!", result);
    }

    [Fact]
    [Trait("Extension", "Invisible characters")]
    public void SanitizeRequired_LoneSurrogate_RemovesItWithoutThrowing()
    {
        var result = "Nome\uD800".SanitizeRequired();

        Assert.Equal("Nome", result);
    }

    [Fact]
    [Trait("Extension", "Perfect setting")]
    public void SanitizeRequired_LineBreakTabAndEmoji_KeepsThem()
    {
        const string text = "Linha 1\r\nLinha 2\tFim 🚀";

        var result = text.SanitizeRequired();

        Assert.Equal(text, result);
    }

    [Fact]
    [Trait("Extension", "Unicode normalization")]
    public void SanitizeRequired_DecomposedAccent_NormalizesToNfc()
    {
        var result = "Café".SanitizeRequired();

        Assert.Equal("Café", result);
    }

    [Fact]
    [Trait("Extension", "Unicode normalization")]
    public void SanitizeRequired_InvisibleBetweenLetterAndAccent_ComposesAfterRemoval()
    {
        var result = "Cafe​́".SanitizeRequired();

        Assert.Equal("Café", result);
    }

    [Theory]
    [Trait("Extension", "Empty text")]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("​​")]
    [InlineData(" ​ ﻿ ")]
    public void SanitizeRequired_NullEmptyOrOnlyInvisible_ReturnsEmpty(string? input)
    {
        var result = input.SanitizeRequired();

        Assert.Equal(string.Empty, result);
    }

    [Theory]
    [Trait("Extension", "Empty text")]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("​​")]
    [InlineData(" ​ ﻿ ")]
    public void SanitizeOptional_NullEmptyOrOnlyInvisible_ReturnsNull(string? input)
    {
        var result = input.SanitizeOptional();

        Assert.Null(result);
    }

    [Fact]
    [Trait("Extension", "Perfect setting")]
    public void SanitizeOptional_TextWithInvisibleChars_ReturnsCleanText()
    {
        var result = " Serviços​ ".SanitizeOptional();

        Assert.Equal("Serviços", result);
    }
}
