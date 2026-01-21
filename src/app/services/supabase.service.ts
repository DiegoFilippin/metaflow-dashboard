import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Project, Panel, Report, Widget } from '../models/dashboard.models';

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface DbProject {
  id: string;
  name: string;
  description?: string;
  color: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DbPanel {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DbReport {
  id: string;
  panel_id: string;
  month: number;
  year: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbWidget {
  id: string;
  report_id: string;
  type: string;
  title: string;
  col_span: number;
  position: number;
  data: any;
  config: any;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Auth methods
  async signUp(email: string, password: string, name: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) return null;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    return this.supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
  }

  // Projects methods
  async getProjects(): Promise<DbProject[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProjectWithPanels(projectId: string): Promise<Project | null> {
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) return null;

    const { data: panels } = await this.supabase
      .from('panels')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    const panelsWithReports: Panel[] = [];

    for (const panel of panels || []) {
      const { data: reports } = await this.supabase
        .from('reports')
        .select('*')
        .eq('panel_id', panel.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      const reportsWithWidgets: Report[] = [];

      for (const report of reports || []) {
        const { data: widgets } = await this.supabase
          .from('widgets')
          .select('*')
          .eq('report_id', report.id)
          .order('position');

        reportsWithWidgets.push({
          id: report.id,
          panelId: report.panel_id,
          month: report.month,
          year: report.year,
          title: report.title,
          widgets: (widgets || []).map(w => ({
            id: w.id,
            type: w.type,
            title: w.title,
            colSpan: w.col_span,
            data: w.data,
            config: w.config
          }))
        });
      }

      panelsWithReports.push({
        id: panel.id,
        projectId: panel.project_id,
        name: panel.name,
        description: panel.description,
        reports: reportsWithWidgets
      });
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      panels: panelsWithReports
    };
  }

  async createProject(data: { name: string; description?: string; color: string }): Promise<DbProject> {
    const user = await this.getUser();
    
    const { data: project, error } = await this.supabase
      .from('projects')
      .insert({
        name: data.name,
        description: data.description,
        color: data.color,
        owner_id: user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    if (user) {
      await this.supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'admin'
        });
    }

    return project;
  }

  async updateProject(projectId: string, data: Partial<DbProject>) {
    return this.supabase
      .from('projects')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', projectId);
  }

  async deleteProject(projectId: string) {
    return this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
  }

  // Panels methods
  async createPanel(projectId: string, name: string, description?: string): Promise<DbPanel> {
    const { data, error } = await this.supabase
      .from('panels')
      .insert({
        project_id: projectId,
        name,
        description
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePanel(panelId: string, data: Partial<DbPanel>) {
    return this.supabase
      .from('panels')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', panelId);
  }

  async deletePanel(panelId: string) {
    return this.supabase
      .from('panels')
      .delete()
      .eq('id', panelId);
  }

  // Reports methods
  async createReport(panelId: string, month: number, year: number, title: string): Promise<DbReport> {
    const { data, error } = await this.supabase
      .from('reports')
      .insert({
        panel_id: panelId,
        month,
        year,
        title
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async duplicateReport(sourceReportId: string, targetMonth: number, targetYear: number): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('duplicate_report', {
        source_report_id: sourceReportId,
        target_month: targetMonth,
        target_year: targetYear
      });

    if (error) throw error;
    return data;
  }

  async deleteReport(reportId: string) {
    return this.supabase
      .from('reports')
      .delete()
      .eq('id', reportId);
  }

  // Widgets methods
  async createWidget(reportId: string, widget: Omit<Widget, 'id'>): Promise<DbWidget> {
    const { data: maxPos } = await this.supabase
      .from('widgets')
      .select('position')
      .eq('report_id', reportId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position ?? -1) + 1;

    const { data, error } = await this.supabase
      .from('widgets')
      .insert({
        report_id: reportId,
        type: widget.type,
        title: widget.title,
        col_span: widget.colSpan,
        position,
        data: widget.data,
        config: widget.config
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWidget(widgetId: string, updates: Partial<Widget>) {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.colSpan !== undefined) dbUpdates.col_span = updates.colSpan;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.config !== undefined) dbUpdates.config = updates.config;

    return this.supabase
      .from('widgets')
      .update(dbUpdates)
      .eq('id', widgetId);
  }

  async deleteWidget(widgetId: string) {
    return this.supabase
      .from('widgets')
      .delete()
      .eq('id', widgetId);
  }

  // Project members
  async addProjectMember(projectId: string, userId: string, role: 'admin' | 'editor' | 'viewer') {
    return this.supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role
      });
  }

  async removeProjectMember(projectId: string, userId: string) {
    return this.supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
  }

  async getProjectMembers(projectId: string) {
    return this.supabase
      .from('project_members')
      .select(`
        *,
        profiles (id, name, avatar_url)
      `)
      .eq('project_id', projectId);
  }

  // Admin methods
  async getAllUsers(): Promise<(Profile & { email?: string })[]> {
    const { data: profiles, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;

    // Try to get emails from auth.users via RPC (admin only)
    let emailMap = new Map<string, string>();
    try {
      const { data: usersWithEmail, error: rpcError } = await this.supabase
        .rpc('get_users_with_email');
      
      if (!rpcError && usersWithEmail) {
        usersWithEmail.forEach((u: any) => emailMap.set(u.id, u.email));
      }
    } catch (e) {
      console.warn('Could not fetch user emails:', e);
    }

    return (profiles || []).map(p => ({
      ...p,
      email: emailMap.get(p.id)
    }));
  }

  async createUser(email: string, password: string, name: string, role: 'admin' | 'editor' | 'viewer'): Promise<{ userId: string }> {
    // Create user via regular signUp (user will need to confirm email)
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Erro ao criar usuário');

    // Update the profile with the correct role (trigger creates profile with 'viewer')
    const { error: updateError } = await this.supabase
      .from('profiles')
      .update({ name, role })
      .eq('id', data.user.id);

    if (updateError) throw updateError;

    return { userId: data.user.id };
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete profile (cascade will handle related data)
    // Note: This won't delete from auth.users without admin API
    const { error: profileError } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;
  }

  // User Project Permissions
  async getUserPermissions(userId: string): Promise<{ projectId: string; permission: string }[]> {
    const { data, error } = await this.supabase
      .from('user_project_permissions')
      .select('project_id, permission')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(p => ({ projectId: p.project_id, permission: p.permission }));
  }

  async setUserPermissions(userId: string, permissions: { projectId: string; permission: 'view' | 'edit' }[]): Promise<void> {
    // Delete existing permissions
    const { error: deleteError } = await this.supabase
      .from('user_project_permissions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Insert new permissions
    if (permissions.length > 0) {
      const { error: insertError } = await this.supabase
        .from('user_project_permissions')
        .insert(permissions.map(p => ({
          user_id: userId,
          project_id: p.projectId,
          permission: p.permission
        })));

      if (insertError) throw insertError;
    }
  }

  async getAllProjectsForAdmin(): Promise<{ id: string; name: string; color: string }[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('id, name, color')
      .order('name');

    if (error) throw error;
    return data || [];
  }
}
