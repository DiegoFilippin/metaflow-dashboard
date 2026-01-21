import { Injectable, signal, computed, inject } from '@angular/core';
import { Project, Panel, Report, Widget, WidgetType } from '../models/dashboard.models';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  private projects = signal<Project[]>([]);
  private selectedProjectId = signal<string>('');
  private selectedPanelId = signal<string>('');
  private selectedReportId = signal<string>('');
  private editMode = signal<boolean>(false);
  private selectedWidgetId = signal<string | null>(null);
  private projectModalOpen = signal<boolean>(false);
  private panelModalOpen = signal<boolean>(false);
  private reportModalOpen = signal<boolean>(false);
  private isLoading = signal<boolean>(false);
  private isOnline = signal<boolean>(false);

  readonly loading = computed(() => this.isLoading());
  readonly online = computed(() => this.isOnline());

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    this.isLoading.set(true);
    
    // Wait for auth to initialize
    await new Promise<void>(resolve => {
      const checkAuth = () => {
        if (!this.auth.isLoading()) {
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });

    if (this.auth.isAuthenticated()) {
      await this.loadFromSupabase();
    } else {
      this.loadDemoData();
    }
    
    this.isLoading.set(false);
  }

  private async loadFromSupabase() {
    try {
      const dbProjects = await this.supabase.getProjects();
      const fullProjects: Project[] = [];

      for (const dbProject of dbProjects) {
        const project = await this.supabase.getProjectWithPanels(dbProject.id);
        if (project) {
          fullProjects.push(project);
        }
      }

      this.projects.set(fullProjects);
      this.isOnline.set(true);

      if (fullProjects.length > 0) {
        this.selectProject(fullProjects[0].id);
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      this.loadDemoData();
    }
  }

  private loadDemoData() {
    const demoData = this.getInitialData();
    this.projects.set(demoData);
    this.isOnline.set(false);
    
    if (demoData.length > 0) {
      this.selectedProjectId.set(demoData[0].id);
      if (demoData[0].panels.length > 0) {
        this.selectedPanelId.set(demoData[0].panels[0].id);
        if (demoData[0].panels[0].reports.length > 0) {
          this.selectedReportId.set(demoData[0].panels[0].reports[0].id);
        }
      }
    }
  }

  async refreshData() {
    if (this.auth.isAuthenticated()) {
      this.isLoading.set(true);
      await this.loadFromSupabase();
      this.isLoading.set(false);
    }
  }

  readonly projectList = computed(() => this.projects());
  readonly isEditMode = computed(() => this.editMode());
  readonly currentWidgetId = computed(() => this.selectedWidgetId());
  readonly isProjectModalOpen = computed(() => this.projectModalOpen());
  readonly isPanelModalOpen = computed(() => this.panelModalOpen());
  readonly isReportModalOpen = computed(() => this.reportModalOpen());

  readonly currentProject = computed(() => {
    return this.projects().find(p => p.id === this.selectedProjectId()) || null;
  });

  readonly currentPanel = computed(() => {
    const project = this.currentProject();
    if (!project) return null;
    return project.panels.find(p => p.id === this.selectedPanelId()) || null;
  });

  readonly currentReport = computed(() => {
    const panel = this.currentPanel();
    if (!panel) return null;
    return panel.reports.find(r => r.id === this.selectedReportId()) || null;
  });

  readonly availablePanels = computed(() => {
    const project = this.currentProject();
    return project?.panels || [];
  });

  readonly availableReports = computed(() => {
    const panel = this.currentPanel();
    return panel?.reports || [];
  });

  selectProject(projectId: string): void {
    this.selectedProjectId.set(projectId);
    const project = this.projects().find(p => p.id === projectId);
    if (project && project.panels.length > 0) {
      this.selectedPanelId.set(project.panels[0].id);
      if (project.panels[0].reports.length > 0) {
        this.selectedReportId.set(project.panels[0].reports[0].id);
      }
    }
  }

  selectPanel(panelId: string): void {
    this.selectedPanelId.set(panelId);
    const panel = this.currentProject()?.panels.find(p => p.id === panelId);
    if (panel && panel.reports.length > 0) {
      this.selectedReportId.set(panel.reports[0].id);
    }
  }

  selectReport(reportId: string): void {
    this.selectedReportId.set(reportId);
  }

  toggleEditMode(): void {
    this.editMode.update(v => !v);
    if (!this.editMode()) {
      this.selectedWidgetId.set(null);
    }
  }

  selectWidget(widgetId: string | null): void {
    this.selectedWidgetId.set(widgetId);
  }

  updateWidgetData(widgetId: string, data: any): boolean {
    try {
      this.projects.update(projects => {
        return projects.map(project => ({
          ...project,
          panels: project.panels.map(panel => ({
            ...panel,
            reports: panel.reports.map(report => ({
              ...report,
              widgets: report.widgets.map(widget =>
                widget.id === widgetId ? { ...widget, data } : widget
              )
            }))
          }))
        }));
      });
      
      if (this.isOnline()) {
        this.supabase.updateWidget(widgetId, { data }).catch(console.error);
      }
      return true;
    } catch {
      return false;
    }
  }

  updateWidgetTitle(widgetId: string, title: string): void {
    this.projects.update(projects => {
      return projects.map(project => ({
        ...project,
        panels: project.panels.map(panel => ({
          ...panel,
          reports: panel.reports.map(report => ({
            ...report,
            widgets: report.widgets.map(widget =>
              widget.id === widgetId ? { ...widget, title } : widget
            )
          }))
        }))
      }));
    });
    
    if (this.isOnline()) {
      this.supabase.updateWidget(widgetId, { title }).catch(console.error);
    }
  }

  updateWidgetConfig(widgetId: string, config: Partial<Widget['config']>): void {
    this.projects.update(projects => {
      return projects.map(project => ({
        ...project,
        panels: project.panels.map(panel => ({
          ...panel,
          reports: panel.reports.map(report => ({
            ...report,
            widgets: report.widgets.map(widget =>
              widget.id === widgetId ? { ...widget, config: { ...widget.config, ...config } } : widget
            )
          }))
        }))
      }));
    });
    
    if (this.isOnline()) {
      const widget = this.findWidget(widgetId);
      if (widget) {
        this.supabase.updateWidget(widgetId, { config: widget.config }).catch(console.error);
      }
    }
  }

  updateWidgetColSpan(widgetId: string, colSpan: 1 | 2 | 3): void {
    this.projects.update(projects => {
      return projects.map(project => ({
        ...project,
        panels: project.panels.map(panel => ({
          ...panel,
          reports: panel.reports.map(report => ({
            ...report,
            widgets: report.widgets.map(widget =>
              widget.id === widgetId ? { ...widget, colSpan } : widget
            )
          }))
        }))
      }));
    });
    
    if (this.isOnline()) {
      this.supabase.updateWidget(widgetId, { colSpan }).catch(console.error);
    }
  }

  private findWidget(widgetId: string): Widget | null {
    for (const project of this.projects()) {
      for (const panel of project.panels) {
        for (const report of panel.reports) {
          const widget = report.widgets.find(w => w.id === widgetId);
          if (widget) return widget;
        }
      }
    }
    return null;
  }

  async addWidget(type: WidgetType): Promise<void> {
    const reportId = this.selectedReportId();
    const widgetData = {
      type,
      title: this.getDefaultTitle(type),
      colSpan: (type === 'kpi-card' || type === 'progress-card' || type === 'comparison-card' ? 1 : 2) as 1 | 2 | 3,
      data: this.getDefaultData(type),
      config: this.getDefaultConfig(type)
    };

    let widgetId = `widget-${Date.now()}`;

    if (this.isOnline()) {
      try {
        const dbWidget = await this.supabase.createWidget(reportId, widgetData);
        widgetId = dbWidget.id;
      } catch (error) {
        console.error('Error creating widget:', error);
      }
    }

    const newWidget: Widget = { id: widgetId, ...widgetData };

    this.projects.update(projects => {
      return projects.map(project => ({
        ...project,
        panels: project.panels.map(panel => ({
          ...panel,
          reports: panel.reports.map(report =>
            report.id === reportId
              ? { ...report, widgets: [...report.widgets, newWidget] }
              : report
          )
        }))
      }));
    });
  }

  async removeWidget(widgetId: string): Promise<void> {
    this.projects.update(projects => {
      return projects.map(project => ({
        ...project,
        panels: project.panels.map(panel => ({
          ...panel,
          reports: panel.reports.map(report => ({
            ...report,
            widgets: report.widgets.filter(w => w.id !== widgetId)
          }))
        }))
      }));
    });
    
    if (this.selectedWidgetId() === widgetId) {
      this.selectedWidgetId.set(null);
    }

    if (this.isOnline()) {
      this.supabase.deleteWidget(widgetId).catch(console.error);
    }
  }

  async reorderWidgets(widgetIds: string[]): Promise<void> {
    const reportId = this.selectedReportId();
    
    this.projects.update(projects => {
      return projects.map(project => ({
        ...project,
        panels: project.panels.map(panel => ({
          ...panel,
          reports: panel.reports.map(report => {
            if (report.id !== reportId) return report;
            
            // Reorder widgets based on the new order
            const widgetMap = new Map(report.widgets.map(w => [w.id, w]));
            const reorderedWidgets: Widget[] = [];
            widgetIds.forEach((id, index) => {
              const widget = widgetMap.get(id);
              if (widget) {
                reorderedWidgets.push({ ...widget, position: index });
              }
            });
            
            return { ...report, widgets: reorderedWidgets };
          })
        }))
      }));
    });

    // Save to database
    if (this.isOnline()) {
      for (let i = 0; i < widgetIds.length; i++) {
        this.supabase.updateWidget(widgetIds[i], { position: i }).catch(console.error);
      }
    }
  }

  moveWidget(widgetId: string, direction: 'up' | 'down'): void {
    const report = this.currentReport();
    if (!report) return;

    const widgets = [...report.widgets];
    const currentIndex = widgets.findIndex(w => w.id === widgetId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;

    // Swap widgets
    [widgets[currentIndex], widgets[newIndex]] = [widgets[newIndex], widgets[currentIndex]];
    
    // Get new order of IDs
    const newOrder = widgets.map(w => w.id);
    this.reorderWidgets(newOrder);
  }

  // Project Management
  openProjectModal(): void {
    this.projectModalOpen.set(true);
  }

  closeProjectModal(): void {
    this.projectModalOpen.set(false);
  }

  // Panel Management
  openPanelModal(): void {
    this.panelModalOpen.set(true);
  }

  closePanelModal(): void {
    this.panelModalOpen.set(false);
  }

  openReportModal(): void {
    this.reportModalOpen.set(true);
  }

  closeReportModal(): void {
    this.reportModalOpen.set(false);
  }

  async createProject(data: { name: string; description?: string; color: string; initialMonth: number; initialYear: number }): Promise<void> {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let projectId = `proj-${Date.now()}`;
    let panelId = `panel-${Date.now()}`;
    let reportId = `rep-${Date.now()}`;

    // Template widgets for new projects
    const templateWidgets: Widget[] = [
      {
        id: `widget-${Date.now()}-1`,
        type: 'kpi-card',
        title: 'Indicador Principal',
        colSpan: 1,
        data: { value: 0, label: 'Valor atual', prefix: '', suffix: '' },
        config: { backgroundColor: data.color, textColor: '#ffffff' }
      },
      {
        id: `widget-${Date.now()}-2`,
        type: 'kpi-card',
        title: 'Meta',
        colSpan: 1,
        data: { value: 100, label: 'Objetivo', prefix: '', suffix: '%' },
        config: { backgroundColor: '#06b6d4', textColor: '#ffffff' }
      },
      {
        id: `widget-${Date.now()}-3`,
        type: 'kpi-card',
        title: 'Progresso',
        colSpan: 1,
        data: { value: 0, label: 'Realizado', prefix: '', suffix: '%' },
        config: { backgroundColor: '#84cc16', textColor: '#ffffff' }
      },
      {
        id: `widget-${Date.now()}-4`,
        type: 'text-block',
        title: 'Resumo',
        colSpan: 3,
        data: { content: `# ${data.name}\n\nBem-vindo ao seu novo projeto!\n\n**Dicas para começar:**\n- Clique em "Modo Edição" para personalizar os widgets\n- Use o botão + para adicionar novos widgets\n- Clique em um widget para editá-lo` },
        config: {}
      },
      {
        id: `widget-${Date.now()}-5`,
        type: 'bar-chart',
        title: 'Evolução Mensal',
        colSpan: 2,
        data: [
          { label: 'Jan', value: 0 },
          { label: 'Fev', value: 0 },
          { label: 'Mar', value: 0 },
          { label: 'Abr', value: 0 },
          { label: 'Mai', value: 0 },
          { label: 'Jun', value: 0 }
        ],
        config: { showLegend: false }
      },
      {
        id: `widget-${Date.now()}-6`,
        type: 'pie-chart',
        title: 'Distribuição',
        colSpan: 1,
        data: [
          { label: 'Categoria A', value: 40, color: data.color },
          { label: 'Categoria B', value: 35, color: '#06b6d4' },
          { label: 'Categoria C', value: 25, color: '#84cc16' }
        ],
        config: { showLegend: true }
      }
    ];

    if (this.isOnline()) {
      try {
        const dbProject = await this.supabase.createProject({
          name: data.name,
          description: data.description,
          color: data.color
        });
        projectId = dbProject.id;

        const dbPanel = await this.supabase.createPanel(projectId, 'Painel Principal');
        panelId = dbPanel.id;

        const dbReport = await this.supabase.createReport(
          panelId,
          data.initialMonth,
          data.initialYear,
          `${monthNames[data.initialMonth - 1]} ${data.initialYear}`
        );
        reportId = dbReport.id;

        // Create template widgets in database
        for (const widget of templateWidgets) {
          try {
            const dbWidget = await this.supabase.createWidget(reportId, {
              type: widget.type,
              title: widget.title,
              colSpan: widget.colSpan,
              data: widget.data,
              config: widget.config
            });
            widget.id = dbWidget.id;
          } catch (e) {
            console.warn('Error creating template widget:', e);
          }
        }
      } catch (error) {
        console.error('Error creating project:', error);
      }
    }
    
    const newProject: Project = {
      id: projectId,
      name: data.name,
      description: data.description,
      color: data.color,
      panels: [{
        id: panelId,
        projectId: projectId,
        name: 'Painel Principal',
        reports: [{
          id: reportId,
          panelId: panelId,
          month: data.initialMonth,
          year: data.initialYear,
          title: `${monthNames[data.initialMonth - 1]} ${data.initialYear}`,
          widgets: templateWidgets
        }]
      }]
    };

    this.projects.update(projects => [...projects, newProject]);
    this.selectedProjectId.set(projectId);
    this.selectedPanelId.set(panelId);
    this.selectedReportId.set(reportId);
  }

  async updateProject(projectId: string, data: { name?: string; description?: string; color?: string }): Promise<void> {
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, ...data } : p)
    );

    if (this.isOnline()) {
      this.supabase.updateProject(projectId, data).catch(console.error);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    this.projects.update(projects => projects.filter(p => p.id !== projectId));
    const remaining = this.projects();
    if (remaining.length > 0) {
      this.selectProject(remaining[0].id);
    }

    if (this.isOnline()) {
      this.supabase.deleteProject(projectId).catch(console.error);
    }
  }

  async createPanel(name: string, description?: string): Promise<void> {
    const projectId = this.selectedProjectId();
    const now = new Date();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    let panelId = `panel-${Date.now()}`;
    let reportId = `rep-${Date.now()}`;

    if (this.isOnline()) {
      try {
        const dbPanel = await this.supabase.createPanel(projectId, name, description);
        panelId = dbPanel.id;

        const dbReport = await this.supabase.createReport(
          panelId,
          now.getMonth() + 1,
          now.getFullYear(),
          `${monthNames[now.getMonth()]} ${now.getFullYear()}`
        );
        reportId = dbReport.id;
      } catch (error) {
        console.error('Error creating panel:', error);
      }
    }

    const newPanel: Panel = {
      id: panelId,
      projectId: projectId,
      name: name,
      description: description,
      reports: [{
        id: reportId,
        panelId: panelId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        title: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
        widgets: []
      }]
    };

    this.projects.update(projects => 
      projects.map(p => p.id === projectId 
        ? { ...p, panels: [...p.panels, newPanel] }
        : p
      )
    );
    this.selectedPanelId.set(panelId);
    this.selectedReportId.set(reportId);
  }

  async createReport(month: number, year: number, copyFromPrevious: boolean = false): Promise<void> {
    const panelId = this.selectedPanelId();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const currentReport = this.currentReport();
    let reportId = `rep-${Date.now()}`;
    let widgets: Widget[] = [];

    if (this.isOnline()) {
      try {
        if (copyFromPrevious && currentReport) {
          reportId = await this.supabase.duplicateReport(currentReport.id, month, year);
          // Reload to get the duplicated widgets
          await this.refreshData();
          return;
        } else {
          const dbReport = await this.supabase.createReport(
            panelId,
            month,
            year,
            `${monthNames[month - 1]} ${year}`
          );
          reportId = dbReport.id;
        }
      } catch (error) {
        console.error('Error creating report:', error);
      }
    } else if (copyFromPrevious && currentReport) {
      widgets = currentReport.widgets.map(w => ({
        ...w,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
    }

    const newReport: Report = {
      id: reportId,
      panelId: panelId,
      month: month,
      year: year,
      title: `${monthNames[month - 1]} ${year}`,
      widgets: widgets
    };

    this.projects.update(projects => 
      projects.map(project => ({
        ...project,
        panels: project.panels.map(panel => 
          panel.id === panelId 
            ? { ...panel, reports: [newReport, ...panel.reports] }
            : panel
        )
      }))
    );
    this.selectReport(reportId);
  }

  private getDefaultTitle(type: WidgetType): string {
    const titles: Record<WidgetType, string> = {
      'kpi-card': 'Novo KPI',
      'bar-chart': 'Novo Gráfico de Barras',
      'pie-chart': 'Novo Gráfico de Pizza',
      'data-table': 'Nova Tabela',
      'gauge-chart': 'Novo Indicador',
      'line-chart': 'Novo Gráfico de Linha',
      'progress-card': 'Nova Barra de Progresso',
      'comparison-card': 'Novo Comparativo',
      'text-block': 'Resumo',
      'task-list': 'Lista de Tarefas'
    };
    return titles[type];
  }

  private getDefaultData(type: WidgetType): any {
    switch (type) {
      case 'kpi-card':
        return { value: 0, label: 'Descrição', prefix: '', suffix: '' };
      case 'bar-chart':
      case 'pie-chart':
      case 'line-chart':
        return [
          { label: 'Item 1', value: 30 },
          { label: 'Item 2', value: 50 },
          { label: 'Item 3', value: 20 }
        ];
      case 'data-table':
        return [
          { nome: 'Exemplo', status: 'green' }
        ];
      case 'gauge-chart':
        return { value: 75, min: 0, max: 100, target: 80, label: 'Meta mensal' };
      case 'progress-card':
        return { current: 750000, target: 1000000, label: 'Meta de vendas', unit: '' };
      case 'comparison-card':
        return { 
          current: 2450000, 
          previous: 2200000, 
          currentLabel: 'Este mês', 
          previousLabel: 'Mês anterior',
          prefix: 'R$ '
        };
      case 'text-block':
        return { 
          content: 'Digite seu resumo aqui...\n\nUse **negrito** e *itálico* para destacar.\n\n- Item de lista\n- Outro item'
        };
      case 'task-list':
        return [];
      default:
        return {};
    }
  }

  private getDefaultConfig(type: WidgetType): Widget['config'] {
    switch (type) {
      case 'kpi-card':
        return { backgroundColor: '#7c3aed', textColor: '#ffffff' };
      case 'bar-chart':
      case 'pie-chart':
      case 'line-chart':
        return { showLegend: true };
      case 'data-table':
        return {
          columns: [
            { key: 'nome', label: 'Nome', type: 'text' },
            { key: 'status', label: 'Status', type: 'status' }
          ]
        };
      default:
        return {};
    }
  }

  private getInitialData(): Project[] {
    return [
      {
        id: 'proj-1',
        name: 'Plataforma Apoio',
        description: 'Sistema de apoio corporativo',
        color: '#7c3aed',
        panels: [
          {
            id: 'panel-1',
            projectId: 'proj-1',
            name: 'Painel Financeiro',
            description: 'Indicadores financeiros e transações',
            reports: [
              {
                id: 'rep-dec-2024',
                panelId: 'panel-1',
                month: 12,
                year: 2024,
                title: 'Dezembro 2024',
                widgets: [
                  {
                    id: 'w1',
                    type: 'kpi-card',
                    title: 'Valor Transacionado',
                    colSpan: 1,
                    data: { value: 2450000, label: 'Total do mês', prefix: 'R$ ', suffix: '' },
                    config: { backgroundColor: '#7c3aed', textColor: '#ffffff' }
                  },
                  {
                    id: 'w2',
                    type: 'kpi-card',
                    title: 'Transações',
                    colSpan: 1,
                    data: { value: 1847, label: 'Operações realizadas', prefix: '', suffix: '' },
                    config: { backgroundColor: '#06b6d4', textColor: '#ffffff' }
                  },
                  {
                    id: 'w3',
                    type: 'kpi-card',
                    title: 'Ticket Médio',
                    colSpan: 1,
                    data: { value: 1326, label: 'Por transação', prefix: 'R$ ', suffix: '' },
                    config: { backgroundColor: '#84cc16', textColor: '#ffffff' }
                  },
                  {
                    id: 'w4',
                    type: 'bar-chart',
                    title: 'Valor Transacionado Mensal',
                    colSpan: 2,
                    data: [
                      { label: 'Jul', value: 1800000 },
                      { label: 'Ago', value: 2100000 },
                      { label: 'Set', value: 1950000 },
                      { label: 'Out', value: 2300000 },
                      { label: 'Nov', value: 2200000 },
                      { label: 'Dez', value: 2450000 }
                    ],
                    config: { showLegend: false }
                  },
                  {
                    id: 'w5',
                    type: 'pie-chart',
                    title: 'Horas por Departamento',
                    colSpan: 1,
                    data: [
                      { label: 'Desenvolvimento', value: 45, color: '#7c3aed' },
                      { label: 'Design', value: 20, color: '#06b6d4' },
                      { label: 'QA', value: 15, color: '#84cc16' },
                      { label: 'Gestão', value: 20, color: '#f59e0b' }
                    ],
                    config: { showLegend: true }
                  },
                  {
                    id: 'w6',
                    type: 'data-table',
                    title: 'Status da Equipe',
                    colSpan: 2,
                    data: [
                      { nome: 'Ana Silva', cargo: 'Dev Senior', horas: 168, status: 'green' },
                      { nome: 'Carlos Santos', cargo: 'Designer', horas: 152, status: 'yellow' },
                      { nome: 'Maria Oliveira', cargo: 'QA Lead', horas: 170, status: 'green' },
                      { nome: 'João Costa', cargo: 'Dev Pleno', horas: 140, status: 'red' },
                      { nome: 'Paula Mendes', cargo: 'PM', horas: 165, status: 'green' }
                    ],
                    config: {
                      columns: [
                        { key: 'nome', label: 'Nome', type: 'text' },
                        { key: 'cargo', label: 'Cargo', type: 'text' },
                        { key: 'horas', label: 'Horas', type: 'number' },
                        { key: 'status', label: 'Status', type: 'status' }
                      ]
                    }
                  }
                ]
              },
              {
                id: 'rep-nov-2024',
                panelId: 'panel-1',
                month: 11,
                year: 2024,
                title: 'Novembro 2024',
                widgets: [
                  {
                    id: 'w7',
                    type: 'kpi-card',
                    title: 'Valor Transacionado',
                    colSpan: 1,
                    data: { value: 2200000, label: 'Total do mês', prefix: 'R$ ', suffix: '' },
                    config: { backgroundColor: '#7c3aed', textColor: '#ffffff' }
                  },
                  {
                    id: 'w8',
                    type: 'kpi-card',
                    title: 'Transações',
                    colSpan: 1,
                    data: { value: 1650, label: 'Operações realizadas', prefix: '', suffix: '' },
                    config: { backgroundColor: '#06b6d4', textColor: '#ffffff' }
                  }
                ]
              }
            ]
          },
          {
            id: 'panel-2',
            projectId: 'proj-1',
            name: 'Painel de Equipe',
            description: 'Acompanhamento de horas e produtividade',
            reports: [
              {
                id: 'rep-team-dec-2024',
                panelId: 'panel-2',
                month: 12,
                year: 2024,
                title: 'Dezembro 2024',
                widgets: [
                  {
                    id: 'w9',
                    type: 'gauge-chart',
                    title: 'Meta de Horas',
                    colSpan: 1,
                    data: { value: 85, min: 0, max: 100, target: 90, label: 'Utilização' },
                    config: {}
                  },
                  {
                    id: 'w10',
                    type: 'progress-card',
                    title: 'Entregas do Mês',
                    colSpan: 1,
                    data: { current: 18, target: 20, label: 'Features entregues', unit: '' },
                    config: {}
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'proj-2',
        name: 'Portal RH',
        description: 'Sistema de recursos humanos',
        color: '#06b6d4',
        panels: [
          {
            id: 'panel-3',
            projectId: 'proj-2',
            name: 'Painel Principal',
            reports: [
              {
                id: 'rep-rh-dec-2024',
                panelId: 'panel-3',
                month: 12,
                year: 2024,
                title: 'Dezembro 2024',
                widgets: [
                  {
                    id: 'w11',
                    type: 'kpi-card',
                    title: 'Colaboradores Ativos',
                    colSpan: 1,
                    data: { value: 127, label: 'Total', prefix: '', suffix: '' },
                    config: { backgroundColor: '#06b6d4', textColor: '#ffffff' }
                  },
                  {
                    id: 'w12',
                    type: 'kpi-card',
                    title: 'Novas Contratações',
                    colSpan: 1,
                    data: { value: 8, label: 'Este mês', prefix: '', suffix: '' },
                    config: { backgroundColor: '#84cc16', textColor: '#ffffff' }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }
}
