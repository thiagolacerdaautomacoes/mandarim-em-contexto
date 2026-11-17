# Materiais da Chrome Web Store

## Campos da ficha

- **Título:** Mandarim em Contexto
- **Resumo:** Pinyin, significados em português e revisão espaçada para estudar
  chinês durante a leitura.
- **Categoria:** Educação
- **Conteúdo adulto:** desativado
- **Página inicial:**
  `https://github.com/thiagolacerdaautomacoes/mandarim-em-contexto`
- **Suporte:**
  `https://github.com/thiagolacerdaautomacoes/mandarim-em-contexto/issues`

### Descrição

Mandarim em Contexto transforma páginas em chinês em material de estudo, sem
tirar você da leitura.

**Leia com apoio.** Ative as anotações para ver pinyin ou zhuyin sobre os
caracteres, inclusive em conteúdo dinâmico e legendas compatíveis.

**Entenda no contexto.** Passe o mouse sobre uma palavra anotada para consultar
pinyin, significado em português, classe gramatical, nível HSK e exemplo. A
consulta prioriza palavras completas — por exemplo, `银行` é mostrado como
“banco”, em vez de explicar apenas o caractere `行`.

**Transforme leitura em revisão.** Salve palavras relevantes como cartões locais
com definição, contexto e origem. A área Estudar traz repetição espaçada,
coleção de cartões, prática de ordem de frases e um registro diário em Markdown
para você revisar antes de colocá-lo no GitHub.

**Privacidade primeiro.** Esta versão não usa conta, análise de uso, anúncios
nem serviços próprios de tradução. O conteúdo da página é processado no
navegador; os cartões e as preferências ficam no perfil do navegador. Nenhum
texto de navegação é enviado automaticamente a servidores do desenvolvedor.

O vocabulário em português desta primeira versão é uma base inicial curada e
expansível. O projeto é open source sob GPL-3.0.

## Imagens para enviar

| Campo da Store                | Arquivo                            | Especificação            |
| ----------------------------- | ---------------------------------- | ------------------------ |
| Ícone                         | `icon-128.png`                     | 128 × 128                |
| Captura 1                     | `screenshot-contexto-1280x800.png` | 1280 × 800, PNG sem alfa |
| Captura 2                     | `screenshot-pratica-1280x800.png`  | 1280 × 800, PNG sem alfa |
| Bloco promocional pequeno     | `promo-small-440x280.png`          | 440 × 280, PNG sem alfa  |
| Bloco promocional de letreiro | `promo-marquee-1400x560.png`       | 1400 × 560, PNG sem alfa |

Não envie o antigo `assets/promo-small-440x280.png`: ele ainda exibe a marca
Pinyin Annotator.

## Respostas para a aba Privacidade

- **Finalidade única:** anotar caracteres chineses em páginas web com pinyin ou
  zhuyin e ajudar a pessoa a estudar vocabulário contextual com cartões locais.
- **Categorias a selecionar no formulário:** `Conteúdo do site` e `Histórico
da Web`. A Chrome Web Store exige a divulgação mesmo para dados processados
  apenas no dispositivo.
- **Transmissão de dados ao desenvolvedor:** não. O texto e os dados de origem
  são tratados localmente e não são enviados a servidores do desenvolvedor.
- **Dados de navegação:** o texto da página é lido localmente para produzir
  anotações. A URL e o título de origem só são salvos quando a pessoa adiciona
  um cartão de revisão explicitamente.
- **Cartões:** somente o item que a pessoa adiciona explicitamente é salvo no
  armazenamento local do Chrome, junto de palavra, pinyin, definição, contexto,
  URL e título de origem.
- **Dados pessoais ou sensíveis:** não são vendidos, usados para anúncios,
  analytics ou perfil de usuários.
- **Links de dicionário externos:** se a pessoa escolher abrir um dicionário
  externo configurado pela extensão, a consulta abre no site escolhido e fica
  sujeita à política daquele site; não há envio automático.

## Instruções de teste para o revisor

1. Instale a extensão e abra uma página que contenha chinês.
2. Abra o popup e acione a anotação. Pinyin deve aparecer sobre os hanzi.
3. Passe o mouse sobre `银行` em uma página que o contenha. A consulta deve
   mostrar “banco; instituição financeira”; ela não faz chamadas de rede.
4. Clique em **Adicionar à revisão** e depois em **Estudar** no popup.
5. Na área Estudar, revele o cartão e escolha uma avaliação. Em **Praticar**,
   monte `我今天在银行工作`.

Não há login, credenciais de teste nem conta de usuário necessários.
