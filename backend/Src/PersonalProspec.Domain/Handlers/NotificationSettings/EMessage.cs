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
    SessionExpired,
    [Description("A campanha está {0} e não pode ser {1}.")]
    CampaignInvalidTransition,
    [Description("A campanha está {0}. Só é possível alterar em Rascunho ou Pausada; pause antes.")]
    CampaignNotEditable,
    [Description("O campo {0} deve estar entre {1} e {2}.")]
    OutOfRange,
    [Description("CNAE {0} não encontrado.")]
    CnaeNotFound,
    [Description("O município {0} não pertence à UF {1}.")]
    MunicipalityNotInState,
    [Description("O campo {0} exige de {1} a {2} itens.")]
    ItemCountOutOfRange,
    [Description("{0} repetido.")]
    DuplicateItem,
    [Description("Já existe uma campanha com esta chave de solicitação e dados diferentes.")]
    CampaignIdInUse,
    [Description("O registro foi alterado por outra ação. Atualize a página e tente novamente.")]
    ConcurrencyConflict,
    [Description("As cidades devem pertencer à mesma UF.")]
    LocationsMustShareState
}
