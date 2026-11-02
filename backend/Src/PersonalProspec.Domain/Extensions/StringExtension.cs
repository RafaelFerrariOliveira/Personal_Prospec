namespace PersonalProspec.Domain.Extensions;

public static class StringExtension
{
    extension(string message)
    {
        public string FormatTo(params object[] args) =>
            string.Format(message, args);
    }
}
