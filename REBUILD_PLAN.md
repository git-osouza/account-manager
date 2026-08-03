# Plano de Reconstrução UX/UI - Account Manager

Este documento descreve detalhadamente a análise de comportamento, o fluxo de negócio, as regras e a nova arquitetura para a reformulação completa de UX/UI da aplicação **Account Manager**. Ele serve como guia para qualquer agente que continue o desenvolvimento.

---

## 1. Análise da Aplicação Atual

A aplicação é um gerenciador de contas a pagar parceladas integrado ao **Supabase** (banco de dados e autenticação) e construído em **Vue 3**.

### Fluxo de Telas e Navegação
- **Login (`LoginView.vue`)**:
  - Permite autenticação com email/senha e OAuth (GitHub).
  - *Problema de UX identificado:* Não há botão de submit no formulário de login por e-mail/senha.
- **Dashboard (`DashboardView.vue`)**:
  - Exibe contas vencidas agrupadas por mês em cards vermelhos simples.
- **Cadastrar (`CadastrarView.vue`)**:
  - Formulário para registrar uma conta e gerar parcelas automaticamente.
- **Listar (`ListarView.vue`)**:
  - Exibe as parcelas do mês/ano filtrado.
  - Permite gerenciar o salário mensal (persistido no `localStorage`).
  - Permite edição inline das parcelas (valor, vencimento, pagamento, status).
  - Permite exclusão de parcelas.

### Estrutura de Banco de Dados (Supabase)
1. **Tabela `account`**:
   - `id` (int8, Primary Key)
   - `ds_nome` (varchar) - Nome da conta
   - `valor_total` (numeric) - Valor total somado de todas as parcelas
   - `dia_vencimento` (int4) - Dia do mês preferencial para vencimento
   - `user_id` (uuid) - ID do usuário autenticado (relacionado a `auth.users`)
   - `categoria` (varchar) - Categoria (ex: `despesas-fixas`, `transporte`, etc.)

2. **Tabela `account_parcelas`**:
   - `id` (int8, Primary Key)
   - `id_account` (int8, Foreign Key para `account.id`)
   - `numero_parcela` (int4) - Número ordinal da parcela (ex: 1, 2, 3...)
   - `valor_parcela` (numeric) - Valor de cada parcela individual
   - `dt_vencimento` (date/timestamp) - Data de vencimento
   - `dt_pagamento` (date/timestamp, nullable) - Data em que foi paga
   - `status` (varchar) - Status da parcela (`Pendente`, `Pago`, `Atrasado`)

---

## 2. Nova Proposta de Design System (Premium Dark Mode)

Para garantir uma interface de alto impacto visual ("WOW factor"), utilizaremos um estilo **Modern Dark SaaS** com elementos de **Glassmorphism**:

- **Cores Principais**:
  - Background Geral: `#0B0F19` (Preto azulado profundo)
  - Superfícies/Cards: `rgba(17, 24, 39, 0.7)` com `backdrop-filter: blur(12px)` e bordas finas `rgba(255, 255, 255, 0.08)`
  - Destaque/Primário: Gradiente de `#6366F1` (Indigo) a `#A855F7` (Purple)
  - Texto Principal: `#F3F4F6` (Cinza claro)
  - Texto Secundário: `#9CA3AF` (Cinza médio)
- **Status Badges**:
  - `Pago`: Fundo verde translúcido (`rgba(16, 185, 129, 0.15)`), texto verde vivo (`#10B981`)
  - `Pendente`: Fundo amarelo translúcido (`rgba(245, 158, 11, 0.15)`), texto amarelo (`#F59E0B`)
  - `Atrasado`: Fundo vermelho translúcido (`rgba(244, 63, 94, 0.15)`), texto vermelho/rosa (`#F43F5E`)

- **Tipografia**: **Inter** (carregada via Google Fonts).
- **Interações**: Micro-animações com `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 3. Guia de Implementação Componente por Componente

### A. Estrutura Global (`index.html`, `App.vue`, `main.js`)
- Limpar CDNs antigos do Bootstrap 4 e jQuery no `index.html`.
- Importar fonte `Inter` no `index.html`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ```
- Criar `src/styles/index.css` contendo resets, variáveis CSS de cores, fontes, e classes utilitárias comuns (ex: `.glass-card`, `.gradient-btn`).
- Importar `index.css` no `main.js`.

### B. Tela de Login (`LoginView.vue`)
- Centralizar o card de login em um contêiner flexbox de tela inteira (`min-height: 100vh`).
- Inserir um botão de submit real no formulário com design moderno e animação de loading ao clicar:
  ```html
  <button type="submit" class="btn-primary-gradient w-100 py-3 rounded-3" @click.prevent="signInPassword">
    Entrar
  </button>
  ```
- Separar o formulário tradicional do login social (GitHub) de forma elegante utilizando um divisor visual "ou entre com".

### C. Dashboard (`DashboardView.vue`)
- Criar cards de resumo em formato de Grid contendo ícones vetoriais modernos.
- **Métricas propostas**:
  1. *Total Vencido*: Valor consolidado de todas as parcelas cuja `dt_vencimento` < hoje e sem pagamento.
  2. *Total Pendente no Mês*: Contas do mês selecionado que ainda estão pendentes.
  3. *Total Pago*: Valor total pago no período selecionado.
- Adicionar um gráfico de barra horizontal simples estilizado em puro CSS para mostrar o percentual de contas pagas vs. pendentes.

### D. Cadastro de Contas (`CadastrarView.vue`)
- Organizar a tela em duas colunas (ou seções flexíveis):
  - **Lado Esquerdo:** Formulário de cadastro tradicional. Estilizar os campos com inputs sem borda de fundo opaco (`rgba(255,255,255,0.05)`) que ganham borda brilhante e colorida ao focar.
  - **Lado Direito:** **Preview em Tempo Real das Parcelas**. Utilizar uma propriedade computada no Vue que monitora:
    - `parcelas.valor_parcela`
    - `parcelas.nr_parcelas`
    - `parcelas.dt_vencimento`
    - `insertVo.dia_vencimento`
    E gera virtualmente a lista de parcelas que seriam criadas, mostrando a data de vencimento calculada exata e o valor de cada uma.
- **Melhoria de Regra de Data no Cadastro**:
  Certificar-se de tratar corretamente os meses ao somar as parcelas, utilizando lógica semelhante à original, mas garantindo formatação amigável no preview.

### E. Listagem de Contas (`ListarView.vue`)
- Desenhar cabeçalho com widgets para o Salário Mensal, Total de Contas não pagas e Saldo Restante em formato de painel flutuante.
- Seletores de Mês e Ano: Substituir os selects tradicionais do Bootstrap por botões estilizados (tabs de meses ou um seletor visual em carrossel horizontal compacto).
- Tabela/Card list:
  - Em telas grandes, usar uma tabela moderna com linhas espaçadas, fundo semi-transparente e cantos arredondados.
  - Em telas pequenas, renderizar em formato de lista de cards expandíveis.
- Edição Inline:
  - Adicionar um pequeno ícone de lápis ou mudança de cursor ao passar o mouse sobre as células editáveis (`valor_parcela`, `dt_vencimento`, `dt_pagamento`, `status`).
  - Ao focar no modo de edição, exibir um input estilizado e salvar imediatamente no evento `blur` ou ao pressionar `Enter`.

---

## 4. Checklist de Desenvolvimento para o Próximo Agente

- [ ] Importar fontes e limpar CDNs antigos em `index.html`.
- [ ] Criar folha de estilos global `src/styles/index.css` com o tema Modern Dark.
- [ ] Refatorar `App.vue` aplicando o container dark global e a tipografia padrão.
- [ ] Atualizar o `HeaderComponent.vue` e `FooterComponent.vue` com o design de vidro translúcido.
- [ ] Atualizar `LoginView.vue` (Adicionar botão de submit convencional, estilizar formulário e login social).
- [ ] Atualizar `DashboardView.vue` (Estruturar novas métricas, aplicar cards modernos de resumo).
- [ ] Atualizar `CadastrarView.vue` (Implementar o layout de duas colunas e o painel de visualização dinâmica de parcelas).
- [ ] Atualizar `ListarView.vue` (Implementar os novos cabeçalhos de orçamento, seletor de data moderno e tabela de alta fidelidade com edição inline polida).
- [ ] Testar todos os fluxos de integração com Supabase: autenticação de e-mail, login social, gravação em lote de parcelas, atualização instantânea de parcelas (edição inline), e exclusão.
