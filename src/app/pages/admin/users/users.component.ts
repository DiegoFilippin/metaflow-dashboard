import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService, Profile } from '../../../services/supabase.service';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { ProjectModalComponent } from '../../../components/project-modal/project-modal.component';
import { PanelModalComponent } from '../../../components/panel-modal/panel-modal.component';

interface UserWithEmail extends Profile {
  email?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ProjectModalComponent, PanelModalComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <app-sidebar />
      
      <!-- Modals -->
      <app-project-modal />
      <app-panel-modal />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                <p class="text-sm text-gray-500">Administração do sistema</p>
              </div>
              <button 
                (click)="openCreateModal()"
                class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Novo Usuário
              </button>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-auto p-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        } @else {
          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <p class="text-sm text-gray-500">Total de Usuários</p>
              <p class="text-3xl font-bold text-gray-900">{{ users().length }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6">
              <p class="text-sm text-gray-500">Administradores</p>
              <p class="text-3xl font-bold text-purple-600">{{ countByRole('admin') }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6">
              <p class="text-sm text-gray-500">Editores</p>
              <p class="text-3xl font-bold text-blue-600">{{ countByRole('editor') }}</p>
            </div>
          </div>

          <!-- Users Table -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Usuários</h2>
                <input 
                  type="text" 
                  [(ngModel)]="searchTerm"
                  placeholder="Buscar por nome ou email..."
                  class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Função</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
                          <span class="text-white text-sm font-semibold">{{ getInitials(user.name) }}</span>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-gray-600">{{ user.email || '-' }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="getRoleBadgeClass(user.role)" class="px-2.5 py-1 rounded-full text-xs font-medium">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button 
                          (click)="openEditModal(user)"
                          class="p-2 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                          title="Editar"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button 
                          (click)="confirmDelete(user)"
                          class="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        </main>
      </div>

      <!-- Edit/Create Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-xl font-bold text-gray-900">
                {{ editingUser() ? 'Editar Usuário' : 'Novo Usuário' }}
              </h2>
            </div>
            
            <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              @if (modalError()) {
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {{ modalError() }}
                </div>
              }

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  type="text" 
                  [(ngModel)]="formName"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              @if (!editingUser()) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    [(ngModel)]="formEmail"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input 
                    type="password" 
                    [(ngModel)]="formPassword"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              }

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Função Global</label>
                <select 
                  [(ngModel)]="formRole"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="viewer">Visualizador</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Administradores têm acesso total a todos os projetos</p>
              </div>

              <!-- Project Permissions -->
              @if (formRole !== 'admin' && projects().length > 0) {
                <div class="pt-4 border-t border-gray-200">
                  <label class="block text-sm font-medium text-gray-700 mb-3">Permissões por Projeto</label>
                  <div class="space-y-2 max-h-48 overflow-y-auto">
                    @for (project of projects(); track project.id) {
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center gap-2">
                          <div class="w-3 h-3 rounded-full" [style.backgroundColor]="project.color"></div>
                          <span class="text-sm font-medium text-gray-700">{{ project.name }}</span>
                        </div>
                        <select 
                          [ngModel]="getProjectPermission(project.id)"
                          (ngModelChange)="setProjectPermission(project.id, $event)"
                          class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="none">Sem acesso</option>
                          <option value="view">Visualizar</option>
                          <option value="edit">Editar</option>
                        </select>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                (click)="closeModal()"
                class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                (click)="saveUser()"
                [disabled]="saving()"
                class="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluir Usuário</h3>
              <p class="text-sm text-gray-600 mb-6">
                Tem certeza que deseja excluir <strong>{{ userToDelete()?.name }}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div class="flex gap-3">
                <button 
                  (click)="showDeleteModal.set(false)"
                  class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  (click)="deleteUser()"
                  [disabled]="saving()"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {{ saving() ? 'Excluindo...' : 'Excluir' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  users = signal<UserWithEmail[]>([]);
  projects = signal<{ id: string; name: string; color: string }[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showDeleteModal = signal(false);
  editingUser = signal<UserWithEmail | null>(null);
  userToDelete = signal<UserWithEmail | null>(null);
  saving = signal(false);
  modalError = signal('');
  searchTerm = '';

  formName = '';
  formEmail = '';
  formPassword = '';
  formRole: 'admin' | 'editor' | 'viewer' = 'viewer';
  formPermissions: Map<string, 'none' | 'view' | 'edit'> = new Map();

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [users, projects] = await Promise.all([
        this.supabase.getAllUsers(),
        this.supabase.getAllProjectsForAdmin()
      ]);
      this.users.set(users);
      this.projects.set(projects);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    this.loading.set(false);
  }

  async loadUsers() {
    try {
      const users = await this.supabase.getAllUsers();
      this.users.set(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  filteredUsers() {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u => 
      u.name.toLowerCase().includes(term) || 
      (u.email && u.email.toLowerCase().includes(term))
    );
  }

  countByRole(role: string): number {
    return this.users().filter(u => u.role === role).length;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      default: return 'Visualizador';
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openCreateModal() {
    this.editingUser.set(null);
    this.formName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formRole = 'viewer';
    this.formPermissions = new Map();
    this.modalError.set('');
    this.showModal.set(true);
  }

  async openEditModal(user: UserWithEmail) {
    this.editingUser.set(user);
    this.formName = user.name;
    this.formRole = user.role;
    this.formPermissions = new Map();
    this.modalError.set('');
    
    // Load user permissions
    try {
      const permissions = await this.supabase.getUserPermissions(user.id);
      permissions.forEach(p => {
        this.formPermissions.set(p.projectId, p.permission as 'view' | 'edit');
      });
    } catch (e) {
      console.warn('Could not load permissions:', e);
    }
    
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  getProjectPermission(projectId: string): string {
    return this.formPermissions.get(projectId) || 'none';
  }

  setProjectPermission(projectId: string, permission: string) {
    if (permission === 'none') {
      this.formPermissions.delete(projectId);
    } else {
      this.formPermissions.set(projectId, permission as 'view' | 'edit');
    }
  }

  async saveUser() {
    if (!this.formName.trim()) {
      this.modalError.set('Nome é obrigatório');
      return;
    }

    this.saving.set(true);
    this.modalError.set('');

    try {
      let userId: string;
      
      if (this.editingUser()) {
        userId = this.editingUser()!.id;
        await this.supabase.updateProfile(userId, {
          name: this.formName,
          role: this.formRole
        });
      } else {
        if (!this.formEmail.trim() || !this.formPassword.trim()) {
          this.modalError.set('Email e senha são obrigatórios');
          this.saving.set(false);
          return;
        }
        const result = await this.supabase.createUser(this.formEmail, this.formPassword, this.formName, this.formRole);
        userId = result.userId;
      }

      // Save permissions if not admin
      if (this.formRole !== 'admin') {
        const permissions: { projectId: string; permission: 'view' | 'edit' }[] = [];
        this.formPermissions.forEach((permission, projectId) => {
          if (permission === 'view' || permission === 'edit') {
            permissions.push({ projectId, permission });
          }
        });
        await this.supabase.setUserPermissions(userId, permissions);
      }

      await this.loadUsers();
      this.closeModal();
    } catch (error: any) {
      this.modalError.set(error.message || 'Erro ao salvar usuário');
    }

    this.saving.set(false);
  }

  confirmDelete(user: UserWithEmail) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  async deleteUser() {
    if (!this.userToDelete()) return;

    this.saving.set(true);
    try {
      await this.supabase.deleteUser(this.userToDelete()!.id);
      await this.loadUsers();
      this.showDeleteModal.set(false);
      this.userToDelete.set(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
    }
    this.saving.set(false);
  }
}
