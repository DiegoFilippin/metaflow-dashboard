import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget, Task } from '../../../models/dashboard.models';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">{{ widget.title }}</h3>
        <span class="text-xs text-gray-500">{{ tasks.length }} tarefas</span>
      </div>
      
      <div class="space-y-2 max-h-[300px] overflow-y-auto">
        @for (task of tasks; track task.id) {
          <div class="p-3 bg-gray-50 rounded-lg border-l-4 hover:bg-gray-100 transition-colors"
            [class.border-l-gray-400]="task.status === 'todo'"
            [class.border-l-blue-500]="task.status === 'in_progress'"
            [class.border-l-green-500]="task.status === 'done'"
            [class.border-l-red-500]="task.status === 'blocked'"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  @if (task.jiraKey) {
                    <span class="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {{ task.jiraKey }}
                    </span>
                  }
                  <p class="text-sm font-medium text-gray-900 truncate">{{ task.name }}</p>
                </div>
                @if (task.description) {
                  <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
                }
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="getStatusClass(task.status)">
                    {{ getStatusLabel(task.status) }}
                  </span>
                  @if (task.priority) {
                    <span class="text-xs px-2 py-0.5 rounded-full"
                      [class]="getPriorityClass(task.priority)">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  }
                  @if (task.assignee) {
                    <span class="text-xs text-gray-500">{{ task.assignee }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="text-center py-8 text-gray-400">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            <p class="text-sm">Nenhuma tarefa</p>
          </div>
        }
      </div>

      <!-- Summary -->
      @if (tasks.length > 0) {
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
          </div>
        </div>
      }
    </div>
  `
})
export class TaskListComponent {
  @Input() widget!: Widget;

  get tasks(): Task[] {
    return this.widget.data || [];
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'todo': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700',
      'blocked': 'bg-red-100 text-red-700'
    };
    return classes[status] || classes['todo'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'todo': 'A fazer',
      'in_progress': 'Em andamento',
      'done': 'Concluída',
      'blocked': 'Bloqueada'
    };
    return labels[status] || status;
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-red-100 text-red-700'
    };
    return classes[priority] || classes['medium'];
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'low': 'Baixa',
      'medium': 'Média',
      'high': 'Alta'
    };
    return labels[priority] || priority;
  }

  getCountByStatus(status: string): number {
    return this.tasks.filter(t => t.status === status).length;
  }
}
