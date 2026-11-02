---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-regra-segredos.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

**REGRA do [padrao-projeto-csharp](./padrao-projeto-csharp.md) (definida pelo Rafael em 2026-10-19):** segredo fica sempre em local fora do código-fonte e fora do repositório; a aplicação só o recebe pela configuração em tempo de execução, e não sobe se ele faltar.

**É segredo:** connection strings, chave de assinatura JWT (`JwtToken:JwtKey`), pepper (`Pepper:Secret`), senha de SMTP (`EmailSettings:Password`), certificados (`*.pfx`), chaves de API.

## Onde cada ambiente guarda

| Ambiente | Local do segredo | Como chega na aplicação |
|---|---|---|
| Dev local | Secret Manager do .NET (`dotnet user-secrets`), em `%APPDATA%\Microsoft\UserSecrets\<UserSecretsId>\secrets.json`, fora da pasta do projeto | `WebApplication.CreateBuilder` carrega automaticamente no ambiente `Development` quando o csproj tem `UserSecretsId` |
| Testes de integração | Valores falsos definidos pelo host de teste (configuração em memória na factory) | Nunca reaproveitar segredo real |
| HML/PRD | Azure DevOps Library: variable group com as variáveis marcadas como secretas (ex.: `<Projeto>-Hml-VG`, `<Projeto>-Prd-VG`). Evolução opcional: Azure Key Vault ligado ao variable group | `FileTransform@2` substitui as chaves do `appsettings.json` no pacote durante o deploy; a pasta do site no IIS deve ter acesso restrito à identidade do app pool e administradores |

## Padrão no código

- `appsettings.json` versionado guarda só a **estrutura**: chave de segredo com valor vazio (`""`).
- Classe de Options em `Domain/Providers/` com `SectionName`, sem valor default.
- **Todo** segredo registrado com validação na subida (`.Validate(...)` + `.ValidateOnStart()`), não só alguns.
- Nunca: valor hardcoded, log de Options, segredo em resposta HTTP ou em mensagem de exceção, commit de `appsettings*.json` com valor real.
- `.gitignore` com `*.pfx`, `secrets.json`, `.env`, `appsettings.*.local.json`.
- Projeto novo já nasce com `UserSecretsId` no csproj da Api.

```csharp
// Domain/Providers/PepperOptions.cs: só a forma da configuração
public sealed class PepperOptions
{
    public const string SectionName = "Pepper";
    public required string Secret { get; set; }
}

// Api/Extensions/CustomSectionExtension.cs (C# 14 extension members)
public void SetConfigureOptionsWithValidation<T>(
    IConfiguration configuration,
    string sectionName,
    Func<T, bool> validate,
    string errorMessage) where T : class
{
    services.AddOptions<T>()
        .Bind(configuration.GetSection(sectionName))
        .Validate(validate, errorMessage)
        .ValidateOnStart();

    services.AddTransient(sp => sp.GetRequiredService<IOptionsMonitor<T>>().CurrentValue);
}

// Api/Settings/Handlers/ProviderSettings.cs: aplicar em TODO segredo
services.SetConfigureOptionsWithValidation<PepperOptions>(
    configuration, PepperOptions.SectionName,
    o => !string.IsNullOrWhiteSpace(o.Secret),
    "Pepper:Secret não configurado.");
```

```json
{
  "ConnectionStrings": { "DefaultConnection": "" },
  "JwtToken": { "JwtKey": "" },
  "EmailSettings": { "Password": "" },
  "Pepper": { "Secret": "" }
}
```

```bash
# Dev: uma vez por máquina (o init grava UserSecretsId no csproj)
dotnet user-secrets init --project Src/Projeto.Api
dotnet user-secrets set "Pepper:Secret" "<valor>" --project Src/Projeto.Api
dotnet user-secrets list --project Src/Projeto.Api
```

**Se um segredo real já foi commitado:** rotacionar o valor (trocar no provedor) é obrigatório; limpar o histórico do git exige reescrita e é decisão do Rafael.

**Why:** O Rafael definiu que segredo tem que ficar inacessível pelo código-fonte e seguro, em qualquer projeto C#.
**How to apply:** Em backend novo ou alteração, aplicar a tabela e o padrão de Options. Em revisão, apontar qualquer segredo em arquivo versionado. O Claude nunca lê nem exibe valores ([feedback-sigilo-somente-leitura](../geral/feedback-sigilo-somente-leitura.md)): para verificar, só nomes de chave e vazio/preenchido. Ver [backend-seguranca-identity](./backend-seguranca-identity.md).
