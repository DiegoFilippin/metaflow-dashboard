import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">MetaFlow</h1>
            <p class="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      <!-- Projects List -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projetos</h2>
          <button 
            (click)="dashboardService.openProjectModal()"
            class="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
            title="Novo Projeto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
        <nav class="space-y-1">
          @for (project of dashboardService.projectList(); track project.id) {
            <div class="group relative">
              <button
                (click)="selectProject(project.id)"
                [class]="getProjectClass(project.id)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
              >
                <div 
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  [style.backgroundColor]="project.color"
                ></div>
                <span class="font-medium truncate flex-1">{{ project.name }}</span>
              </button>
              <button
                (click)="editProject(project.id); $event.stopPropagation()"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                title="Editar projeto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </div>
          }
        </nav>
      </div>

      <!-- Admin Menu -->
      @if (authService.isAdmin()) {
        <div class="p-4 border-t border-gray-100">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administração</h2>
          <button 
            (click)="goToAdminUsers()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span class="font-medium">Gerenciar Usuários</span>
          </button>
        </div>
      }

      <!-- User Profile -->
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 px-3 py-2">
          <div class="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">{{ getUserInitials() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ authService.profile()?.name || 'Usuário' }}</p>
            <p class="text-xs text-gray-500 truncate capitalize">{{ getRoleLabel() }}</p>
          </div>
          <button 
            (click)="authService.signOut()"
            class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Sair"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  dashboardService = inject(DashboardService);
  authService = inject(AuthService);
  private router = inject(Router);

  getProjectClass(projectId: string): string {
    const isSelected = this.dashboardService.currentProject()?.id === projectId;
    return isSelected 
      ? 'bg-brand-50 text-brand-700' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  }

  getUserInitials(): string {
    const name = this.authService.profile()?.name || '';
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.authService.profile()?.role;
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      default: return 'Visualizador';
    }
  }

  selectProject(projectId: string): void {
    this.dashboardService.selectProject(projectId);
    this.router.navigate(['/']);
  }

  editProject(projectId: string): void {
    this.dashboardService.openEditProjectModal(projectId);
  }

  goToAdminUsers(): void {
    this.router.navigate(['/admin/users']);
  }
}
