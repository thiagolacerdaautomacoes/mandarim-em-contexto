# Mandarim em Contexto

> Um fork pessoal do Pinyin Annotator, licenciado sob GPL-3.0, para transformar
> leitura de chinês em consulta contextual, cartões de revisão e prática ativa
> em português brasileiro.

## O que foi acrescentado neste fork

- Consulta ao passar o mouse: prioriza a palavra no contexto (`银行`, “banco”)
  antes de explicar um caractere isolado (`行`).
- Cartões locais: a captura guarda palavra, pinyin, significado, contexto e a
  origem da leitura, sem enviar o conteúdo da página a um serviço externo.
- Página **Estudar**: revisão espaçada, coleção de cartões e prática de ordem
  de palavras.
- Plano de evolução para correção, fala, conversação, PWA mobile e registro
  deliberado no GitHub: [STUDY_SYSTEM_PLAN.md](STUDY_SYSTEM_PLAN.md).

O léxico pt-BR atual é uma semente curada para demonstrar o fluxo. Antes de
distribuir uma versão ampla, substitua-o por uma fonte de dicionário licenciada
e mantenha as atribuições exigidas.

## Testar localmente

O pacote Chrome MV3 já foi gerado em `build/chrome-mv3-prod`. Para carregá-lo
no Chrome, abra `chrome://extensions`, ative o **Modo do desenvolvedor**,
escolha **Carregar sem compactação** e selecione essa pasta. Em uma página com
chinês, acione a anotação, passe o mouse sobre uma entrada do léxico e use
**Adicionar à revisão**. O botão **Estudar** no popup abre a revisão, a prática
e o registro Markdown copiável.

Para recompilar depois de mudar o código:

```sh
pnpm install --frozen-lockfile
pnpm build
```

## Privacidade e suporte

- [Política de privacidade](PRIVACY.md)
- [Relatar problema ou sugerir melhoria](https://github.com/thiagolacerdaautomacoes/mandarim-em-contexto/issues)
- [Materiais da ficha da Chrome Web Store](assets/store-listing/STORE_LISTING.md)

## Créditos e licença

Este projeto deriva do
[Pinyin Annotator](https://github.com/fixicelo/pinyin-annotator), de fixicelo.
Ele preserva o histórico, os avisos de copyright e a licença GPL-3.0 da base.
As modificações deste fork também são distribuídas sob GPL-3.0.
