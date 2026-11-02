// Nome de cada controller da API .NET (rota api/<Controller>/<acao_snake_case>).
// Uma entrada por controller, adicionada junto com o primeiro Service que o consome; nunca string solta no Service.
export const ApiControllers = {
   Authentication: 'Authentication',
   Antiforgery: 'Antiforgery',
   Campaign: 'Campaign',
   Reference: 'Reference',
} as const;

export type ApiControllerName = (typeof ApiControllers)[keyof typeof ApiControllers];
