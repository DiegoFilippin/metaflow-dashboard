# MetaFlow Dashboard - Schema do Banco de Dados

Este documento descreve a estrutura do banco de dados para integração com **Supabase** (PostgreSQL).

## Tabelas

### 1. `users` (Gerenciado pelo Supabase Auth)

```sql
-- Tabela gerenciada automaticamente pelo Supabase Auth
-- Campos adicionais podem ser adicionados via profiles
```

### 2. `profiles`

Informações adicionais dos usuários.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 3. `projects`

Projetos/iniciativas corporativas.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#7c3aed',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
```

### 4. `project_members`

Controle de acesso por projeto (quem pode ver/editar).

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- RLS Policies
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their projects" ON project_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage members" ON project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role = 'admin'
    )
  );
```

### 5. `reports`

Relatórios mensais por projeto.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, month, year)
);

CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_reports_date ON reports(year, month);
```

### 6. `widgets`

Widgets/painéis dentro de cada relatório.

```sql
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'kpi-card', 'bar-chart', 'pie-chart', 'data-table',
    'gauge-chart', 'line-chart', 'progress-card', 'comparison-card'
  )),
  title TEXT NOT NULL,
  col_span INTEGER DEFAULT 1 CHECK (col_span IN (1, 2, 3)),
  position INTEGER DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_widgets_report ON widgets(report_id);
CREATE INDEX idx_widgets_position ON widgets(report_id, position);
```

### 7. `widget_history` (Opcional - para comparação mês a mês)

Histórico de valores para análise temporal.

```sql
CREATE TABLE widget_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_widget_history_widget ON widget_history(widget_id);
CREATE INDEX idx_widget_history_date ON widget_history(snapshot_date);
```

## Views Úteis

### Comparativo Mês a Mês

```sql
CREATE VIEW v_monthly_comparison AS
SELECT 
  w.id as widget_id,
  w.title,
  r.project_id,
  r.month,
  r.year,
  w.data,
  LAG(w.data) OVER (
    PARTITION BY w.title, r.project_id 
    ORDER BY r.year, r.month
  ) as previous_data
FROM widgets w
JOIN reports r ON w.report_id = r.id;
```

## Funções RPC

### Duplicar Relatório

```sql
CREATE OR REPLACE FUNCTION duplicate_report(
  source_report_id UUID,
  target_month INTEGER,
  target_year INTEGER
) RETURNS UUID AS $$
DECLARE
  new_report_id UUID;
  source_project_id UUID;
BEGIN
  -- Get source project
  SELECT project_id INTO source_project_id 
  FROM reports WHERE id = source_report_id;
  
  -- Create new report
  INSERT INTO reports (project_id, month, year, title)
  VALUES (
    source_project_id, 
    target_month, 
    target_year,
    TO_CHAR(TO_DATE(target_month::text, 'MM'), 'TMMonth') || ' ' || target_year
  )
  RETURNING id INTO new_report_id;
  
  -- Copy widgets
  INSERT INTO widgets (report_id, type, title, col_span, position, data, config)
  SELECT new_report_id, type, title, col_span, position, data, config
  FROM widgets WHERE report_id = source_report_id;
  
  RETURN new_report_id;
END;
$$ LANGUAGE plpgsql;
```

## Integração com Angular

### Supabase Client Setup

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
};

// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get client() {
    return this.supabase;
  }

  // Auth
  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  // Projects
  async getProjects() {
    return this.supabase
      .from('projects')
      .select(`
        *,
        reports (
          id, month, year, title,
          widgets (*)
        )
      `)
      .order('created_at', { ascending: false });
  }

  // Widgets
  async updateWidget(widgetId: string, data: any) {
    return this.supabase
      .from('widgets')
      .update({ data, updated_at: new Date().toISOString() })
      .eq('id', widgetId);
  }
}
```

## Permissões por Role

| Ação | Admin | Editor | Viewer |
|------|-------|--------|--------|
| Ver projetos | ✅ | ✅ | ✅ |
| Criar projetos | ✅ | ❌ | ❌ |
| Editar projetos | ✅ | ❌ | ❌ |
| Criar relatórios | ✅ | ✅ | ❌ |
| Editar widgets | ✅ | ✅ | ❌ |
| Gerenciar membros | ✅ | ❌ | ❌ |
| Exportar dados | ✅ | ✅ | ✅ |

## Próximos Passos

1. **Criar projeto no Supabase**
2. **Executar migrations** (SQL acima)
3. **Configurar RLS policies**
4. **Instalar `@supabase/supabase-js`**
5. **Criar `SupabaseService`**
6. **Migrar `DashboardService` para usar Supabase**
7. **Implementar autenticação**
8. **Adicionar real-time subscriptions** para colaboração
