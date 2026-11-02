# /front:fix

Ao receber este comando, executar sem explorar o projeto além do arquivo e dos que ele importa diretamente. Corrigir só o que foi descrito, nunca refatorar o resto do arquivo "já que está ali".

```
front:fix
arquivo:   [caminho em frontend/]
problema:  [descrição do bug ou comportamento errado]
```

Ao terminar: listar o que foi alterado e por quê, e indicar se algum teste em `frontend/tests/` cobre esse comportamento (rodar se cobrir e se as dependências estiverem instaladas).
