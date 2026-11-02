#!/usr/bin/env node
// Gera .claude/rules/{geral,backend,frontend} a partir da memória do Obsidian (fonte de verdade
// do padrão C#) e das rules globais ~/.claude/rules (fonte de verdade do padrão React, origem Ponto-Front).
// Uso: node .claude/scripts/sync-obsidian-rules.mjs
// Variáveis opcionais: OBSIDIAN_MEMORY_DIR, GLOBAL_RULES_DIR.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rulesDir = path.join(projectDir, '.claude', 'rules');
const obsidianDir =
   process.env.OBSIDIAN_MEMORY_DIR ??
   path.join(os.homedir(), 'OneDrive', 'Documentos', 'Obsidian Vault', 'Claude Memory');
const globalRulesDir = process.env.GLOBAL_RULES_DIR ?? path.join(os.homedir(), '.claude', 'rules');

const GENERATED_MARKER = 'Gerado por .claude/scripts/sync-obsidian-rules.mjs';

const BACKEND_NOTE =
   '> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). ' +
   'Todo caminho citado é relativo a `backend/`.';
const FRONTEND_NOTE =
   '> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a ' +
   '`frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do ' +
   'padrão, não como inventário deste projeto.';

const groups = [
   {
      folder: 'geral',
      source: 'obsidian',
      paths: null,
      files: ['doc-style-001-sem-travessao', 'feedback-sigilo-somente-leitura'],
   },
   {
      folder: 'geral',
      source: 'global',
      paths: null,
      files: ['git-conventional-commit-messages'],
   },
   {
      folder: 'backend',
      source: 'obsidian',
      paths: ['backend/**'],
      note: BACKEND_NOTE,
      files: [
         'padrao-projeto-csharp',
         'backend-arquitetura-referencia',
         'backend-stack-ferramentas',
         'backend-estrutura-pastas',
         'backend-codigo-domain',
         'backend-codigo-infra',
         'backend-codigo-application',
         'backend-codigo-api',
         'backend-codigo-testes',
         'backend-testes-padrao',
         'backend-seguranca-identity',
         'backend-regra-segredos',
         'backend-cicd-azure-iis',
      ],
   },
   {
      folder: 'frontend',
      source: 'obsidian',
      paths: ['frontend/**'],
      note: FRONTEND_NOTE,
      files: ['padrao-projeto-react-front', 'frontend-regra-segredos-env'],
   },
   {
      folder: 'frontend',
      source: 'global',
      paths: ['frontend/**'],
      note: FRONTEND_NOTE,
      files: [
         'access-control',
         'aliases-imports',
         'api-integration',
         'checklist-revisao',
         'dtos-e-validacao',
         'estrutura-pastas',
         'figma-integration',
         'formatacao',
         'forms-validation',
         'infinite-scroll-pagination',
         'mvvm-pages-components',
         'nomenclatura',
         'principios-codigo',
         'react-router',
         'redux-toolkit',
         'security-frontend',
         'services-di-ioc',
         'solid',
         'styled-components',
         'tests-pattern',
         'typescript',
      ],
   },
];

const generatedFolderBySlug = new Map(groups.flatMap((group) => group.files.map((slug) => [slug, group.folder])));

const stripFrontmatter = (content) => content.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

const convertWikiLinks = (content, currentFolder) =>
   content.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_match, rawSlug, alias) => {
      const slug = rawSlug.trim();
      const label = alias?.trim() ?? slug;
      const targetFolder = generatedFolderBySlug.get(slug);
      if (!targetFolder) return `\`${label}\` (nota Obsidian)`;

      const relativeDir = targetFolder === currentFolder ? '.' : `../${targetFolder}`;
      return `[${label}](${relativeDir}/${slug}.md)`;
   });

const buildHeader = (group, originLabel) => {
   const parts = [];
   if (group.paths) parts.push(['---', 'paths:', ...group.paths.map((glob) => `  - "${glob}"`), '---'].join('\n'));
   parts.push(`<!-- ${GENERATED_MARKER} a partir de ${originLabel}. Não editar aqui: editar a origem e rodar o script. -->`);
   if (group.note) parts.push(group.note);
   return `${parts.join('\n\n')}\n\n`;
};

const readSource = (group, slug) => {
   const baseDir = group.source === 'obsidian' ? obsidianDir : globalRulesDir;
   const sourcePath = path.join(baseDir, `${slug}.md`);
   if (!fs.existsSync(sourcePath)) throw new Error(`Origem não encontrada: ${sourcePath}`);

   const originLabel =
      group.source === 'obsidian' ? `Obsidian "Claude Memory/${slug}.md"` : `~/.claude/rules/${slug}.md (origem Ponto-Front)`;
   return { content: fs.readFileSync(sourcePath, 'utf8'), originLabel };
};

const removePreviouslyGenerated = () => {
   if (!fs.existsSync(rulesDir)) return 0;

   let removed = 0;
   for (const entry of fs.readdirSync(rulesDir, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

      const filePath = path.join(entry.parentPath ?? entry.path, entry.name);
      if (fs.readFileSync(filePath, 'utf8').includes(GENERATED_MARKER)) {
         fs.rmSync(filePath);
         removed += 1;
      }
   }
   return removed;
};

const main = () => {
   for (const dir of [obsidianDir, globalRulesDir]) {
      if (!fs.existsSync(dir)) throw new Error(`Pasta de origem inexistente: ${dir}`);
   }

   const removed = removePreviouslyGenerated();
   const written = [];

   for (const group of groups) {
      const targetDir = path.join(rulesDir, group.folder);
      fs.mkdirSync(targetDir, { recursive: true });

      for (const slug of group.files) {
         const { content, originLabel } = readSource(group, slug);
         const body = convertWikiLinks(stripFrontmatter(content), group.folder).trim();
         fs.writeFileSync(path.join(targetDir, `${slug}.md`), `${buildHeader(group, originLabel)}${body}\n`, 'utf8');
         written.push(`${group.folder}/${slug}.md`);
      }
   }

   console.log(`Rules removidas (geradas antes): ${removed}`);
   console.log(`Rules geradas: ${written.length}`);
   for (const file of written) console.log(`  ${file}`);
};

try {
   main();
} catch (error) {
   console.error(error instanceof Error ? error.message : error);
   process.exit(1);
}
