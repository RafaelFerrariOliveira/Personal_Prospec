# /front:refactorSolid

Ao receber este comando, aplicar `.claude/rules/frontend/solid.md` e `principios-codigo.md` no arquivo indicado, sem mudar comportamento externo (mesma interface pública, mesmas props). Se a refatoração exigir separar `.view.tsx` e `.controller.tsx` que ainda não seguem MVVM, aplicar também `mvvm-pages-components.md`.

```
front:refactorSolid
arquivo: [caminho em frontend/]
```

Ao terminar: listar o que mudou e rodar os testes existentes do arquivo (se houver em `frontend/tests/`) para confirmar que o comportamento não mudou.
