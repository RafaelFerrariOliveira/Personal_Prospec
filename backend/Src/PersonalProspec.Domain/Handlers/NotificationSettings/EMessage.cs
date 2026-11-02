using System.ComponentModel;

namespace PersonalProspec.Domain.Handlers.NotificationSettings;

public enum EMessage : byte
{
    [Description("O campo {0} é obrigatório.")]
    Required = 1,
    [Description("O campo {0} permite {1} caracteres.")]
    MoreExpected,
    [Description("{0} não encontrado.")]
    NotFound,
    [Description("{0} já possui um registro no sistema.")]
    Exist,
    [Description("{0} está em um formato inválido.")]
    InvalidFormat,
    [Description("E-mail ou senha inválidos.")]
    InvalidCredentials,
    [Description("Muitas tentativas. Tente novamente em {0}.")]
    LockedOut,
    [Description("O campo {0} exige no mínimo {1} caracteres.")]
    MinLength,
    [Description("Ocorreu um erro inesperado. Tente novamente.")]
    UnexpectedError,
    [Description("Requisição inválida. Atualize a página e tente novamente.")]
    InvalidRequest,
    [Description("Sua sessão expirou. Entre novamente.")]
    SessionExpired
}
