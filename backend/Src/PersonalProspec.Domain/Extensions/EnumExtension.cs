using System.ComponentModel;
using System.Reflection;

namespace PersonalProspec.Domain.Extensions;

public static class EnumExtension
{
    extension<T>(T enumValue) where T : Enum
    {
        public string GetDescription() =>
            enumValue.GetType().GetField(enumValue.ToString())?.GetCustomAttribute<DescriptionAttribute>()?.Description
            ?? enumValue.ToString();
    }
}
