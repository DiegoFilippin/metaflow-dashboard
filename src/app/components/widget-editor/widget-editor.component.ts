import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { Widget, TableColumn } from '../../models/dashboard.models';

@Component({
  selector: 'app-widget-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (dashboardService.isEditMode() && selectedWidget) {
      <aside class="w-96 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-gray-900">Editar Widget</h2>
            <p class="text-xs text-gray-500">{{ getWidgetTypeName(selectedWidget.type) }}</p>
          </div>
          <button 
            (click)="dashboardService.selectWidget(null)"
            class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Editor Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
            <input
              type="text"
              [ngModel]="selectedWidget.title"
              (ngModelChange)="updateTitle($event)"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <!-- Column Span -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Largura</label>
            <div class="flex gap-2">
              @for (span of colSpanOptions; track span) {
                <button
                  (click)="updateColSpan(span)"
                  [class]="selectedWidget.colSpan === span ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {{ span }}/3
                </button>
              }
            </div>
          </div>

          <!-- KPI Card Config -->
          @if (selectedWidget.type === 'kpi-card') {
            <div class="space-y-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs font-semibold text-gray-500 uppercase">Configuração KPI</p>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Valor</label>
                <input type="number" [(ngModel)]="kpiValue" (ngModelChange)="updateKpiData()"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <input type="text" [(ngModel)]="kpiLabel" (ngModelChange)="updateKpiData()"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Prefixo</label>
                  <input type="text" [(ngModel)]="kpiPrefix" (ngModelChange)="updateKpiData()" placeholder="R$ "
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Sufixo</label>
                  <input type="text" [(ngModel)]="kpiSuffix" (ngModelChange)="updateKpiData()" placeholder="%"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Cor de Fundo</label>
                <div class="flex gap-2 flex-wrap">
                  @for (color of colorOptions; track color.value) {
                    <button
                      (click)="updateConfig({ backgroundColor: color.value })"
                      [class.ring-2]="selectedWidget.config.backgroundColor === color.value"
                      [class.ring-offset-2]="selectedWidget.config.backgroundColor === color.value"
                      class="w-7 h-7 rounded-lg ring-brand-500 transition-all"
                      [style.backgroundColor]="color.value"
                    ></button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Data Table Config -->
          @if (selectedWidget.type === 'data-table') {
            <div class="space-y-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-gray-500 uppercase">Colunas da Tabela</p>
                <button (click)="addColumn()" class="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  + Adicionar
                </button>
              </div>
              
              @for (col of tableColumns; track $index) {
                <div class="p-2 bg-white rounded-lg border border-gray-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-gray-500">Coluna {{ $index + 1 }}</span>
                    <button (click)="removeColumn($index)" class="text-red-500 hover:text-red-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <input type="text" [(ngModel)]="col.key" (ngModelChange)="updateTableColumns()" placeholder="Chave (ex: nome)"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-xs" />
                  <input type="text" [(ngModel)]="col.label" (ngModelChange)="updateTableColumns()" placeholder="Rótulo (ex: Nome)"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-xs" />
                  <select [(ngModel)]="col.type" (ngModelChange)="updateTableColumns()"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-xs">
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="currency">Moeda</option>
                    <option value="percent">Percentual</option>
                    <option value="status">Status (cor)</option>
                  </select>
                </div>
              }
            </div>
            
            <!-- Table Data Editor -->
            <div class="space-y-3">
              <!-- Input Mode Toggle -->
              <div class="flex items-center gap-2 border-b border-gray-200 pb-3">
                <button 
                  (click)="tableInputMode = 'manual'"
                  [class]="tableInputMode === 'manual' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Manual
                </button>
                <button 
                  (click)="tableInputMode = 'paste'"
                  [class]="tableInputMode === 'paste' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Colar Dados
                </button>
              </div>

              @if (tableInputMode === 'manual') {
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">Dados da Tabela</label>
                  <button (click)="addTableRow()" class="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    + Linha
                  </button>
                </div>
                
                @for (row of tableData; track $index) {
                  <div class="p-2 bg-gray-50 rounded-lg space-y-1.5">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs text-gray-500">Linha {{ $index + 1 }}</span>
                      <button (click)="removeTableRow($index)" class="text-red-500 hover:text-red-600">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    @for (col of tableColumns; track col.key) {
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500 w-16 truncate">{{ col.label }}:</span>
                        @if (col.type === 'status') {
                          <select [(ngModel)]="row[col.key]" (ngModelChange)="updateTableData()"
                            class="flex-1 px-2 py-1 border border-gray-200 rounded text-xs">
                            <option value="green">Verde</option>
                            <option value="yellow">Amarelo</option>
                            <option value="red">Vermelho</option>
                          </select>
                        } @else {
                          <input [type]="col.type === 'number' || col.type === 'currency' || col.type === 'percent' ? 'number' : 'text'"
                            [(ngModel)]="row[col.key]" (ngModelChange)="updateTableData()"
                            class="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
                        }
                      </div>
                    }
                  </div>
                }
              } @else {
                <div class="space-y-3">
                  <p class="text-xs text-gray-500">Cole dados do Excel ou texto (uma linha por registro, colunas separadas por TAB ou vírgula):</p>
                  <p class="text-xs text-gray-400 italic">Ordem: {{ getColumnLabels() }}</p>
                  <textarea 
                    [(ngModel)]="tablePasteData"
                    rows="6"
                    placeholder="Valor1	Valor2	Valor3&#10;Valor4	Valor5	Valor6"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                  ></textarea>
                  <button 
                    (click)="importTableData()"
                    [disabled]="tableColumns.length === 0"
                    class="w-full px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Importar Dados
                  </button>
                  @if (tableColumns.length === 0) {
                    <p class="text-xs text-amber-600">⚠️ Configure as colunas primeiro antes de importar dados</p>
                  }
                </div>
              }
            </div>
          }

          <!-- Chart Config (Bar, Pie, Line) -->
          @if (selectedWidget.type === 'bar-chart' || selectedWidget.type === 'pie-chart' || selectedWidget.type === 'line-chart') {
            <div class="space-y-4 p-3 bg-gray-50 rounded-lg">
              <!-- Input Mode Toggle -->
              <div class="flex items-center gap-2 border-b border-gray-200 pb-3">
                <button 
                  (click)="chartInputMode = 'manual'"
                  [class]="chartInputMode === 'manual' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Manual
                </button>
                <button 
                  (click)="chartInputMode = 'paste'"
                  [class]="chartInputMode === 'paste' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Colar Dados
                </button>
              </div>

              @if (chartInputMode === 'manual') {
                <div class="flex items-center justify-between">
                  <p class="text-xs font-semibold text-gray-500 uppercase">Dados do Gráfico</p>
                  <button (click)="addChartItem()" class="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    + Item
                  </button>
                </div>
                
                @for (item of chartData; track $index) {
                  <div class="flex items-center gap-2">
                    <input type="text" [(ngModel)]="item.label" (ngModelChange)="updateChartData()" placeholder="Label"
                      class="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                    <input type="number" [(ngModel)]="item.value" (ngModelChange)="updateChartData()" placeholder="Valor"
                      class="w-20 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                    <button (click)="removeChartItem($index)" class="text-red-500 hover:text-red-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              } @else {
                <div class="space-y-3">
                  <p class="text-xs text-gray-500">Cole dados do Excel ou texto (uma linha por item, separado por TAB ou vírgula):</p>
                  <p class="text-xs text-gray-400 italic">Formato: Label, Valor</p>
                  <textarea 
                    [(ngModel)]="chartPasteData"
                    rows="6"
                    placeholder="Janeiro	100&#10;Fevereiro	150&#10;Março	200"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                  ></textarea>
                  <button 
                    (click)="importChartData()"
                    class="w-full px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors"
                  >
                    Importar Dados
                  </button>
                </div>
              }
            </div>
          }

          <!-- Gauge Config -->
          @if (selectedWidget.type === 'gauge-chart') {
            <div class="space-y-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs font-semibold text-gray-500 uppercase">Configuração Gauge</p>
              
              <div>
                <label class="block text-xs text-gray-600 mb-1">Valor Atual</label>
                <input type="number" [(ngModel)]="gaugeValue" (ngModelChange)="updateGaugeData()"
                  class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Mínimo</label>
                  <input type="number" [(ngModel)]="gaugeMin" (ngModelChange)="updateGaugeData()"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Máximo</label>
                  <input type="number" [(ngModel)]="gaugeMax" (ngModelChange)="updateGaugeData()"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-600 mb-1">Meta</label>
                <input type="number" [(ngModel)]="gaugeTarget" (ngModelChange)="updateGaugeData()"
                  class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
              </div>
              
              <div>
                <label class="block text-xs text-gray-600 mb-1">Descrição</label>
                <input type="text" [(ngModel)]="gaugeLabel" (ngModelChange)="updateGaugeData()"
                  class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
              </div>
            </div>
          }

          <!-- Progress Card Config -->
          @if (selectedWidget.type === 'progress-card') {
            <div class="space-y-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs font-semibold text-gray-500 uppercase">Configuração Progresso</p>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Atual</label>
                  <input type="number" [(ngModel)]="progressCurrent" (ngModelChange)="updateProgressData()"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Meta</label>
                  <input type="number" [(ngModel)]="progressTarget" (ngModelChange)="updateProgressData()"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-600 mb-1">Descrição</label>
                <input type="text" [(ngModel)]="progressLabel" (ngModelChange)="updateProgressData()"
                  class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
              </div>
            </div>
          }

          <!-- Comparison Card Config -->
          @if (selectedWidget.type === 'comparison-card') {
            <div class="space-y-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs font-semibold text-gray-500 uppercase">Configuração Comparativo</p>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Valor Atual</label>
                  <input type="number" [(ngModel)]="compCurrent" (ngModelChange)="updateComparisonData()"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Valor Anterior</label>
                  <input type="number" [(ngModel)]="compPrevious" (ngModelChange)="updateComparisonData()"
                    class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-600 mb-1">Prefixo</label>
                <input type="text" [(ngModel)]="compPrefix" (ngModelChange)="updateComparisonData()" placeholder="R$ "
                  class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
              </div>
            </div>
          }

          <!-- Text Block Config -->
          @if (selectedWidget.type === 'text-block') {
            <div class="space-y-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs font-semibold text-gray-500 uppercase">Conteúdo do Texto</p>
              
              <div>
                <label class="block text-xs text-gray-600 mb-1">Texto (suporta formatação básica)</label>
                <textarea [(ngModel)]="textContent" (ngModelChange)="updateTextData()" rows="10"
                  placeholder="Digite seu texto aqui...&#10;&#10;Use **negrito** e *itálico*&#10;- Lista com hífen"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono resize-none"></textarea>
                <p class="mt-1 text-xs text-gray-400">
                  **negrito**, *itálico*, - lista
                </p>
              </div>
            </div>
          }

          <!-- Delete Widget -->
          <div class="pt-4 border-t border-gray-100">
            <button
              (click)="deleteWidget()"
              class="w-full py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Remover Widget
            </button>
          </div>
        </div>
      </aside>
    }
  `
})
export class WidgetEditorComponent {
  dashboardService = inject(DashboardService);
  private lastWidgetId: string | null = null;

  colSpanOptions: (1 | 2 | 3)[] = [1, 2, 3];

  colorOptions = [
    { value: '#7c3aed', label: 'Roxo' },
    { value: '#06b6d4', label: 'Ciano' },
    { value: '#84cc16', label: 'Lima' },
    { value: '#f59e0b', label: 'Âmbar' },
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#6366f1', label: 'Índigo' },
    { value: '#14b8a6', label: 'Teal' }
  ];

  // KPI Card
  kpiValue = 0;
  kpiLabel = '';
  kpiPrefix = '';
  kpiSuffix = '';

  // Table
  tableColumns: TableColumn[] = [];
  tableData: any[] = [];

  // Charts
  chartData: { label: string; value: number }[] = [];
  chartInputMode: 'manual' | 'paste' = 'manual';
  chartPasteData = '';

  // Table import
  tableInputMode: 'manual' | 'paste' = 'manual';
  tablePasteData = '';

  // Gauge
  gaugeValue = 0;
  gaugeMin = 0;
  gaugeMax = 100;
  gaugeTarget = 80;
  gaugeLabel = '';

  // Progress
  progressCurrent = 0;
  progressTarget = 100;
  progressLabel = '';

  // Comparison
  compCurrent = 0;
  compPrevious = 0;
  compPrefix = '';

  // Text Block
  textContent = '';

  constructor() {
    effect(() => {
      const widgetId = this.dashboardService.currentWidgetId();
      if (widgetId !== this.lastWidgetId) {
        this.lastWidgetId = widgetId;
        this.loadWidgetData();
      }
    });
  }

  get selectedWidget(): Widget | null {
    const widgetId = this.dashboardService.currentWidgetId();
    if (!widgetId) return null;
    const report = this.dashboardService.currentReport();
    if (!report) return null;
    return report.widgets.find(w => w.id === widgetId) || null;
  }

  private loadWidgetData(): void {
    const widget = this.selectedWidget;
    if (!widget) return;

    switch (widget.type) {
      case 'kpi-card':
        this.kpiValue = widget.data?.value || 0;
        this.kpiLabel = widget.data?.label || '';
        this.kpiPrefix = widget.data?.prefix || '';
        this.kpiSuffix = widget.data?.suffix || '';
        break;
      case 'data-table':
        this.tableColumns = widget.config?.columns ? [...widget.config.columns] : [];
        this.tableData = Array.isArray(widget.data) ? widget.data.map(r => ({...r})) : [];
        break;
      case 'bar-chart':
      case 'pie-chart':
      case 'line-chart':
        this.chartData = Array.isArray(widget.data) ? widget.data.map(d => ({...d})) : [];
        break;
      case 'gauge-chart':
        this.gaugeValue = widget.data?.value || 0;
        this.gaugeMin = widget.data?.min || 0;
        this.gaugeMax = widget.data?.max || 100;
        this.gaugeTarget = widget.data?.target || 80;
        this.gaugeLabel = widget.data?.label || '';
        break;
      case 'progress-card':
        this.progressCurrent = widget.data?.current || 0;
        this.progressTarget = widget.data?.target || 100;
        this.progressLabel = widget.data?.label || '';
        break;
      case 'comparison-card':
        this.compCurrent = widget.data?.current || 0;
        this.compPrevious = widget.data?.previous || 0;
        this.compPrefix = widget.data?.prefix || '';
        break;
      case 'text-block':
        this.textContent = widget.data?.content || '';
        break;
    }
  }

  getWidgetTypeName(type: string): string {
    const names: Record<string, string> = {
      'kpi-card': 'Card KPI',
      'bar-chart': 'Gráfico de Barras',
      'pie-chart': 'Gráfico de Pizza',
      'line-chart': 'Gráfico de Linha',
      'data-table': 'Tabela de Dados',
      'gauge-chart': 'Indicador Gauge',
      'progress-card': 'Card de Progresso',
      'comparison-card': 'Card Comparativo',
      'text-block': 'Bloco de Texto'
    };
    return names[type] || type;
  }

  updateTitle(title: string): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetTitle(widgetId, title);
    }
  }

  updateColSpan(span: 1 | 2 | 3): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetColSpan(widgetId, span);
    }
  }

  updateConfig(config: Partial<Widget['config']>): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetConfig(widgetId, config);
    }
  }

  // KPI Methods
  updateKpiData(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetData(widgetId, {
        value: this.kpiValue,
        label: this.kpiLabel,
        prefix: this.kpiPrefix,
        suffix: this.kpiSuffix
      });
    }
  }

  // Table Methods
  addColumn(): void {
    this.tableColumns.push({ key: '', label: '', type: 'text' });
  }

  removeColumn(index: number): void {
    this.tableColumns.splice(index, 1);
    this.updateTableColumns();
  }

  updateTableColumns(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetConfig(widgetId, { columns: [...this.tableColumns] });
    }
  }

  addTableRow(): void {
    const newRow: any = {};
    this.tableColumns.forEach(col => {
      newRow[col.key] = col.type === 'status' ? 'green' : '';
    });
    this.tableData.push(newRow);
    this.updateTableData();
  }

  removeTableRow(index: number): void {
    this.tableData.splice(index, 1);
    this.updateTableData();
  }

  updateTableData(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetData(widgetId, [...this.tableData]);
    }
  }

  // Chart Methods
  addChartItem(): void {
    this.chartData.push({ label: '', value: 0 });
  }

  removeChartItem(index: number): void {
    this.chartData.splice(index, 1);
    this.updateChartData();
  }

  updateChartData(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetData(widgetId, [...this.chartData]);
    }
  }

  // Gauge Methods
  updateGaugeData(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetData(widgetId, {
        value: this.gaugeValue,
        min: this.gaugeMin,
        max: this.gaugeMax,
        target: this.gaugeTarget,
        label: this.gaugeLabel
      });
    }
  }

  // Progress Methods
  updateProgressData(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetData(widgetId, {
        current: this.progressCurrent,
        target: this.progressTarget,
        label: this.progressLabel
      });
    }
  }

  // Comparison Methods
  updateComparisonData(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetData(widgetId, {
        current: this.compCurrent,
        previous: this.compPrevious,
        prefix: this.compPrefix
      });
    }
  }

  // Text Block Methods
  updateTextData(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId) {
      this.dashboardService.updateWidgetData(widgetId, {
        content: this.textContent
      });
    }
  }

  deleteWidget(): void {
    const widgetId = this.dashboardService.currentWidgetId();
    if (widgetId && confirm('Tem certeza que deseja remover este widget?')) {
      this.dashboardService.removeWidget(widgetId);
    }
  }

  getColumnLabels(): string {
    return this.tableColumns.map(c => c.label).join(', ') || 'Nenhuma coluna definida';
  }

  // Import Methods
  importChartData(): void {
    if (!this.chartPasteData.trim()) return;

    const lines = this.chartPasteData.trim().split('\n');
    const newData: { label: string; value: number }[] = [];

    for (const line of lines) {
      // Try tab separator first, then comma, then semicolon
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split(',');
      if (parts.length < 2) parts = line.split(';');

      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value = parseFloat(parts[1].trim().replace(',', '.'));
        if (label && !isNaN(value)) {
          newData.push({ label, value });
        }
      }
    }

    if (newData.length > 0) {
      this.chartData = newData;
      this.updateChartData();
      this.chartPasteData = '';
      this.chartInputMode = 'manual';
    }
  }

  importTableData(): void {
    if (!this.tablePasteData.trim() || this.tableColumns.length === 0) return;

    const lines = this.tablePasteData.trim().split('\n');
    const newData: any[] = [];

    for (const line of lines) {
      // Try tab separator first, then comma, then semicolon
      let parts = line.split('\t');
      if (parts.length < this.tableColumns.length) parts = line.split(',');
      if (parts.length < this.tableColumns.length) parts = line.split(';');

      const row: any = {};
      this.tableColumns.forEach((col, index) => {
        if (parts[index] !== undefined) {
          let value: any = parts[index].trim();
          if (col.type === 'number' || col.type === 'currency' || col.type === 'percent') {
            value = parseFloat(value.replace(',', '.')) || 0;
          }
          row[col.key] = value;
        }
      });

      if (Object.keys(row).length > 0) {
        newData.push(row);
      }
    }

    if (newData.length > 0) {
      this.tableData = newData;
      this.updateTableData();
      this.tablePasteData = '';
      this.tableInputMode = 'manual';
    }
  }
}
