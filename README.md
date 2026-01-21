# MetaFlow Dashboard

Plataforma web dinâmica (SPA) para acompanhamento de metas corporativas e relatórios gerenciais mensais.

## Tecnologias

- **Angular 17+** - Framework SPA
- **Tailwind CSS** - Estilização utilitária
- **D3.js** - Gráficos vetoriais de alta performance

## Funcionalidades

### Navegação
- **Sidebar Lateral**: Lista de projetos ativos com seleção visual
- **Barra Superior**: Seletor de mês/relatório e controles de edição
- **Grid Responsivo**: Layout flexível com widgets de 1, 2 ou 3 colunas

### Catálogo de Widgets
- **KPI Card**: Cartões de destaque para números grandes com cores customizáveis
- **Gráfico de Barras**: Comparação de valores ao longo do tempo (D3.js)
- **Gráfico de Pizza**: Visualização de proporções e distribuição (D3.js)
- **Tabela de Dados**: Listas com semáforo visual (verde/amarelo/vermelho)

### Modo de Edição (Self-Service)
- Botão "Editar Painel" para ativar modo de edição
- Editor lateral com validação JSON para entrada de dados
- Adicionar/remover widgets via menu flutuante (FAB)
- Personalização de títulos e cores em tempo real

## Estrutura do Projeto

```
src/app/
├── components/
│   ├── sidebar/           # Navegação lateral
│   ├── topbar/            # Barra superior
│   ├── dashboard-grid/    # Grid de widgets
│   ├── widget-editor/     # Editor de dados JSON
│   ├── add-widget-menu/   # Menu FAB para adicionar widgets
│   └── widgets/
│       ├── kpi-card/      # Widget KPI
│       ├── bar-chart/     # Gráfico de barras D3
│       ├── pie-chart/     # Gráfico de pizza D3
│       └── data-table/    # Tabela com status
├── models/                # Interfaces TypeScript
└── services/              # Estado da aplicação (signals)
```

## Executar

```bash
npm install
npm start
```

Acesse `http://localhost:4200`

## Paleta de Cores

- **Brand (Roxo)**: `#7c3aed`
- **Ciano**: `#06b6d4`
- **Lima**: `#84cc16`
- **Fundo**: `bg-gray-100`
