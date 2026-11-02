#!/usr/bin/env node
// Hook PreToolUse (matcher: Bash): bloqueia `dotnet ef database update/drop` que referencie HML/PRD
// ou uma connection string explícita. Recomendação da nota backend-cicd-azure-iis (Obsidian):
// alteração de banco em ambiente real exige confirmação do Rafael, fora do agente.
// Bloqueio = exit 2 com o motivo no stderr (o Claude recebe a mensagem). Liberação = exit 0.
import { readFileSync } from 'node:fs';

const readCommand = () => {
   try {
      const input = JSON.parse(readFileSync(0, 'utf8'));
      return typeof input?.tool_input?.command === 'string' ? input.tool_input.command : '';
   } catch {
      return '';
   }
};

const command = readCommand();
const isDatabaseChange = /\bdotnet\s+ef\s+database\s+(update|drop)\b/i.test(command);
const targetsRemoteEnvironment =
   /\b(hml|prd|prod|production|homolog|homologacao|staging)\b/i.test(command) || /--connection\b/i.test(command);

if (isDatabaseChange && targetsRemoteEnvironment) {
   console.error(
      'Bloqueado pelo hook block-remote-database: `dotnet ef database update/drop` contra HML/PRD ou com --connection ' +
         'explícita não roda pelo agente. Gere o script (`dotnet ef migrations script --idempotent`) e peça ao Rafael ' +
         'para aplicar com confirmação.',
   );
   process.exit(2);
}

process.exit(0);
