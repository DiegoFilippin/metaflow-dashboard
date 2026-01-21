import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/dashboard.models';
import { JiraService, JiraIssue } from '../../../services/jira.service';

@Component({
  selector: 'app-jira-sprint',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 23.013 0z"/>
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-900">{{ widget.title }}</h3>
        </div>
        <div class="flex items-center gap-2">
          @if (isLoading) {
            <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          }
          @if (lastSync) {
            <span class="text-xs text-gray-400">{{ lastSync }}</span>
          }
        </div>
      </div>

      @if (!isConfigured) {
        <div class="text-center py-8 text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p class="text-sm font-medium text-gray-500">Jira não configurado</p>
          <p class="text-xs text-gray-400 mt-1">Configure no modo de edição</p>
        </div>
      } @else {
        <div class="space-y-2 max-h-[350px] overflow-y-auto">
          @for (issue of issues; track issue.key) {
            <a [href]="getIssueUrl(issue.key)" target="_blank"
              class="block p-3 bg-gray-50 rounded-lg border-l-4 hover:bg-gray-100 transition-colors cursor-pointer"
              [class.border-l-gray-400]="issue.statusCategory === 'todo'"
              [class.border-l-blue-500]="issue.statusCategory === 'in_progress'"
              [class.border-l-green-500]="issue.statusCategory === 'done'"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                      {{ issue.key }}
                    </span>
                    <span class="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                      {{ issue.issueType }}
                    </span>
                  </div>
                  <p class="text-sm font-medium text-gray-900 line-clamp-2">{{ issue.summary }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="getStatusClass(issue.statusCategory)">
                      {{ issue.status }}
                    </span>
                    @if (issue.priority) {
                      <span class="text-xs text-gray-500">{{ issue.priority }}</span>
                    }
                    @if (issue.assignee) {
                      <span class="text-xs text-gray-400">• {{ issue.assignee }}</span>
                    }
                  </div>
                </div>
              </div>
            </a>
          } @empty {
            @if (!isLoading) {
              <div class="text-center py-8 text-gray-400">
                <p class="text-sm">Nenhuma issue encontrada</p>
              </div>
            }
          }
        </div>

        <!-- Summary -->
        @if (issues.length > 0) {
          <div class="mt-4 pt-3 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                  {{ getCountByStatus('todo') }} A fazer
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  {{ getCountByStatus('in_progress') }} Em andamento
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  {{ getCountByStatus('done') }} Concluídas
                </span>
              </div>
              <span class="text-gray-400">{{ issues.length }} issues</span>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class JiraSprintComponent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  
  private jiraService = inject(JiraService);
  
  issues: JiraIssue[] = [];
  isLoading = false;
  lastSync = '';
  
  get isConfigured(): boolean {
    const config = this.widget.data?.jiraConfig;
    return !!(config?.baseUrl && config?.email && config?.apiToken && config?.projectKey && config?.sprintId);
  }

  ngOnInit(): void {
    if (this.isConfigured) {
      this.startSync();
    }
  }

  ngOnDestroy(): void {
    this.jiraService.stopSync(this.widget.id);
  }

  private startSync(): void {
    const config = this.widget.data?.jiraConfig;
    if (!config) return;

    this.isLoading = true;
    
    this.jiraService.startSync(
      this.widget.id,
      config,
      config.sprintId,
      (issues) => {
        this.issues = issues;
        this.isLoading = false;
        this.lastSync = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
    );
  }

  getIssueUrl(key: string): string {
    const baseUrl = this.widget.data?.jiraConfig?.baseUrl || '';
    return `${baseUrl.replace(/\/$/, '')}/browse/${key}`;
  }

  getStatusClass(category: string): string {
    const classes: Record<string, string> = {
      'todo': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700'
    };
    return classes[category] || classes['todo'];
  }

  getCountByStatus(category: string): number {
    return this.issues.filter(i => i.statusCategory === category).length;
  }
}
