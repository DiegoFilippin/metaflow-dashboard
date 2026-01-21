import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService, Profile } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private currentUser = signal<User | null>(null);
  private currentProfile = signal<Profile | null>(null);
  private loading = signal<boolean>(true);

  readonly user = computed(() => this.currentUser());
  readonly profile = computed(() => this.currentProfile());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isLoading = computed(() => this.loading());
  readonly isAdmin = computed(() => this.currentProfile()?.role === 'admin');

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    this.loading.set(true);
    
    try {
      const session = await this.supabase.getSession();
      if (session?.user) {
        this.currentUser.set(session.user);
        try {
          const profile = await this.supabase.getProfile(session.user.id);
          this.currentProfile.set(profile);
        } catch (e) {
          console.warn('Could not load profile:', e);
        }
      }
    } catch (e) {
      console.warn('Auth init error:', e);
    }
    
    this.loading.set(false);

    this.supabase.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUser.set(session.user);
        try {
          const profile = await this.supabase.getProfile(session.user.id);
          this.currentProfile.set(profile);
        } catch (e) {
          console.warn('Could not load profile:', e);
        }
      } else if (event === 'SIGNED_OUT') {
        this.currentUser.set(null);
        this.currentProfile.set(null);
      }
    });
  }

  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.signUp(email, password, name);
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Erro ao criar conta' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.signIn(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser.set(data.user);
        const profile = await this.supabase.getProfile(data.user.id);
        this.currentProfile.set(profile);
        return { success: true };
      }

      return { success: false, error: 'Erro ao fazer login' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.signOut();
    this.currentUser.set(null);
    this.currentProfile.set(null);
    this.router.navigate(['/login']);
  }
}
