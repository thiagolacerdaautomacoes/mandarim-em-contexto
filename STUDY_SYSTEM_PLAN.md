# Mandarim em Contexto — plano do sistema

## Objetivo

Transformar leitura de chinês em um ciclo de estudo pessoal: ler, consultar uma
palavra **no contexto**, salvar o que importa, produzir frases, revisar em
intervalos e registrar somente um resumo deliberado no GitHub.

O fork preserva o motor de anotação do Pinyin Annotator e sua licença GPL-3.0.
Os recursos acrescentados nesta primeira entrega são locais: não transmitem
texto de navegação nem exigem chave de IA.

## O que esta entrega implementa

1. Um cartão de consulta ao passar o mouse sobre um hanzi anotado. Ele procura
   primeiro a palavra conhecida ao redor do caractere e cai para o caractere
   individual quando não há uma palavra local.
2. Um léxico pt-BR inicial, extensível, com sentidos, classe gramatical, HSK e
   exemplos. O desenho evita a tradução enganosa de cada caractere isolado.
3. Captura explícita para cartões persistidos em `chrome.storage.local`, com
   contexto, URL, título e data. Repetir a mesma captura atualiza o encontro em
   vez de duplicar o cartão.
4. Uma página `Estudar` com revisão espaçada local, lista de cartões e prática
   de ordenação de frase.
5. Um agendador pequeno, testável e determinístico. É deliberadamente simples
   neste MVP e pode ser substituído por FSRS depois de acumular dados reais.
6. Um registro diário em Markdown, pronto para revisão e cópia. Ele exclui URL,
   título e texto das páginas; publicar no GitHub continua sendo uma decisão
   explícita do usuário.

## Limites deliberados do MVP

- O léxico ainda é curado e pequeno; a camada completa exigirá uma fonte de
  dicionário licenciada e revisão das traduções em português.
- Não há tradução remota, geração de frases por IA, análise fonética nem login.
  Cada uma dessas ações deve ser opt-in e informar qual texto será enviado.
- O GitHub não é banco de cartões nem mecanismo de sincronização. Esta versão
  só prepara uma prévia de Markdown e nunca faz commit, push ou autenticação em
  seu nome.
- A página de estudo é desktop-first. A experiência mobile é um PWA companheiro
  futuro, que compartilhará os mesmos modelos de cartão e de revisão.

## Arquitetura

```
conteúdo da página
  -> anotador de pinyin
  -> inspetor contextual (hover)
  -> mensagem ao service worker
  -> storage local: cartões + agendamento
  -> página Estudar: revisão, coleção, prática, registro Markdown
  -> futuro sync privado <-> PWA
  -> resumo aprovado pelo usuário -> GitHub
```

### Dados essenciais

`StudyCard` guarda hanzi, pinyin, definição pt-BR, sentidos, frase de origem,
fonte, tags, data, contagem de encontros e estado da revisão. `ReviewRating`
é `again`, `hard`, `good` ou `easy`; o agendador calcula a próxima data e
atualiza repetições, lapsos e facilidade.

## Fluxos de experiência

### 1. Leitura e consulta

1. A pessoa aciona a anotação da extensão na página atual.
2. O pinyin aparece sobre os hanzi como no Pinyin Annotator original.
3. Após 280 ms sobre um hanzi, surge um cartão compacto. O resolvedor procura
   a entrada mais longa que contém aquele hanzi: em `银行`, tanto `银` quanto
   `行` são ignorados em favor de `银行`.
4. O cartão mostra palavra, pinyin, definição principal, classe/HSK quando
   houver e uma frase curta. “Adicionar à revisão” é a única ação que persiste
   dados.
5. Se a palavra ainda não existe no léxico local, nada é enviado à rede nem uma
   tradução inventada é exibida. A evolução correta é ampliar a base licenciada
   ou oferecer uma consulta opt-in.

### 2. Revisão espaçada

- Cartões novos entram imediatamente na fila. A resposta fica oculta até
  “Mostrar significado”, para evitar reconhecimento passivo.
- **Errei** volta em 10 minutos e reduz a facilidade; **Difícil** começa com
  6 horas; **Bom** inicia em 1 dia; **Fácil** inicia em 3 dias.
- Após a primeira revisão, a duração cresce de modo conservador conforme a
  facilidade. Esta transparência é preferível a fingir precisão algorítmica.
- O estado está separado da UI para a futura migração a FSRS sem reescrever a
  coleção nem o conteúdo dos cartões.

### 3. Produção, correção e conversa

A primeira atividade de produção é ordenar palavras, seguida de explicação
curta em português. As próximas modalidades devem compartilhar o mesmo ciclo:
**tentativa do aluno → feedback explicável → escolha do aluno → cartão de
contraste opcional**. Uma correção não deve substituir silenciosamente o texto
original; guardará original, proposta, explicação e se o aluno a aceitou.

### 4. Registro no GitHub

A aba **Registro** gera uma fotografia local: totais, pendências, novos,
revisados e vocabulário tocado no dia. Ela não inclui as fontes de navegação.
O fluxo proposto é `prévia → revisão/edição humana → colar em um arquivo
Markdown versionado → commit normal`. Uma integração GitHub posterior só deve
existir se houver um repositório escolhido e uma confirmação por envio.

## Interface e decisões visuais

- **Leitura:** o cartão flutuante é estreito, com hierarquia `hanzi → pinyin →
significado → exemplo → ação`; não cobre a página inteira e fecha ao sair ou
  com `Esc`.
- **Estudar:** uma página de largura confortável, fundo suave, verde-jade como
  cor de ação e tipografia de alto contraste. As quatro áreas são Revisar,
  Cartões, Praticar e Registro.
- **Feedback:** ações de revisão dizem o que muda (por exemplo, “10 min” em
  Errei). A prática mantém a tentativa visível e explica a ordem correta.
- **Tema e tamanho:** a página respeita modo escuro do sistema e se reduz em
  telas estreitas; os controles mantêm rótulos escritos, não só ícones.
- **Acessibilidade a evoluir:** a próxima iteração deve tornar cada hanzi
  consultável por teclado e expor rótulos de pronúncia para leitor de tela.

## Contratos técnicos e bordas

| Área         | Regra desta versão                                      | Evolução segura                                                      |
| ------------ | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Dicionário   | Léxico pt-BR local, entrada mais longa ganha            | Pipeline de importação com licença, atribuição e versão da fonte     |
| Captura      | Deduplicação por `hanzi + definição`; atualiza encontro | Edição de sentido, tags e fusão manual de duplicatas                 |
| Persistência | `chrome.storage.local` no perfil do navegador           | Exportar/importar JSON validado e sync privado criptografado         |
| IA/tradução  | Ausentes; nenhuma página é enviada                      | Provedor por ação, texto mínimo, consentimento e indicador de custo  |
| Áudio/fala   | Ausentes no MVP                                         | Gravar por botão, transcrever `zh-CN`, permitir apagar áudio e texto |
| GitHub       | Só Markdown copiado manualmente                         | Repositório explícito, diff visível e confirmação por commit         |

## Modelo de entrega e qualidade

- **Unidade:** léxico contextual, agendador e gerador de registro recebem
  testes determinísticos.
- **Integração:** a build Chrome MV3 precisa conter o popup e a página Estudar;
  mensagens de captura são tratadas no service worker.
- **Regressão:** a suíte herdada de anotação continua passando; a anotação é
  preservada e as interações novas só observam seus wrappers.
- **Privacidade:** nenhuma chamada de rede é adicionada no MVP. Uma revisão de
  permissões e dados enviados é requisito para cada integração futura.
- **Distribuição:** por ser um fork de GPL-3.0, código distribuído e as
  modificações correspondentes precisam continuar disponíveis sob GPL-3.0.

### Privacidade

O conteúdo fica no perfil do navegador. Ao adicionar tradução, correção ou
fala remota, cada provedor será uma integração isolada, habilitada pelo
usuário, com cache local e limite de chamadas. Não haverá chave de API embutida
no pacote nem envio automático de toda a página.

## Próximas entregas, nesta ordem

1. **Qualidade do léxico:** importar uma base licenciada, manter atribuição e
   oferecer edição manual do significado e dos exemplos.
2. **Produção escrita:** prompts graduados, correção em pt-BR, comparação entre
   original e sugestão, e cartões de contraste para erros recorrentes.
3. **Fala e conversa:** gravação explícita, transcrição `zh-CN`, comparação de
   palavras reconhecidas e cenários por turnos. Uma nota de pronúncia detalhada
   só será exibida se houver um provedor capaz de justificá-la.
4. **PWA mobile:** revisão offline, frases e fala; o Chrome mobile não executa
   a extensão de desktop. A anotação móvel poderá vir depois via Safari Web
   Extension no iOS ou por compatibilidade de navegador.
5. **Sincronização e GitHub:** exportação/importação primeiro; depois sync
   privado para cartões e, se desejado, integração com repositório escolhido,
   diff visível e confirmação antes de gravar.

## Critérios de aceitação

- Passar o mouse por `行` em `银行` mostra `银行`, e não apenas a leitura de
  `行`.
- Capturar a palavra cria somente um cartão; a segunda captura não duplica.
- Uma avaliação “Bom” agenda o cartão no futuro; “Errei” o devolve a curto
  prazo.
- O registro em Markdown não revela URL nem título da página de origem.
- O anotador existente segue removendo suas próprias marcações corretamente.
- Nenhum recurso do MVP faz requisição de rede para traduzir ou estudar texto.
