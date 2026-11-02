#!/usr/bin/env node
// Hook PreToolUse (matcher: Bash): bloqueia `git add`/`git commit` que cite arquivo de ambiente ou credencial.
// Regras de origem: backend-regra-segredos e frontend-regra-segredos-env (Obsidian).
// Bloqueio = exit 2 com o motivo no stderr (o Claude recebe a mensagem). Liberação = exit 0.
import { readFileSync } from 'node:fs';

const SENSITIVE_FILE_PATTERNS = [
   /(^|[\s/\\'"=])\.env(\.(?!example\b)[\w.-]+)?(?=$|[\s'"])/i, // .env, .env.local, .env.production (exceto .env.example)
   /\.(pfx|pem|p12|key)(?=$|[\s'"])/i,
   /(^|[\s/\\'"])secrets\.json(?=$|[\s'"])/i,
   /appsettings\.[\w-]+\.local\.json/i,
   /credentials?\.(json|ts|js)(?=$|[\s'"])/i,
];

const readCommand = () => {
   try {
      const input = JSON.parse(readFileSync(0, 'utf8'));
      return typeof input?.tool_input?.command === 'string' ? input.tool_input.command : '';
   } catch {
      return '';
   }
};

const command = readCommand();
const isGitStagingOrCommit = /\bgit\s+(add|commit)\b/i.test(command);
const mentionsSensitiveFile = SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(command));

if (isGitStagingOrCommit && mentionsSensitiveFile) {
   console.error(
      'Bloqueado pelo hook block-secrets-commit: o comando git add/commit cita arquivo de ambiente ou credencial ' +
         '(.env*, .pfx, .pem, secrets.json, appsettings.*.local.json, credentials). Segredo nunca vai para o repositório: ' +
         'backend usa user-secrets (dev) e variable group secreto (HML/PRD); frontend usa .env fora do git. ' +
         'Revise manualmente antes de versionar.',
   );
   process.exit(2);
}

process.exit(0);
