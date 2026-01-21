import { Injectable, signal } from '@angular/core';

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  sprintId?: string;
}

export interface JiraIssue {
  key: string;
  summary: string;
  description?: string;
  status: string;
  statusCategory: 'todo' | 'in_progress' | 'done';
  priority?: string;
  assignee?: string;
  issueType: string;
  created: string;
  updated: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JiraService {
  private syncIntervals = new Map<string, any>();

  async testConnection(config: JiraConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(config, '/rest/api/3/myself');
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: `Conectado como ${data.displayName}` };
      }
      return { success: false, message: 'Falha na autenticação' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  }

  async getSprints(config: JiraConfig): Promise<JiraSprint[]> {
    try {
      const boardResponse = await this.makeRequest(
        config, 
        `/rest/agile/1.0/board?projectKeyOrId=${config.projectKey}`
      );
      
      if (!boardResponse.ok) return [];
      
      const boardData = await boardResponse.json();
      if (!boardData.values || boardData.values.length === 0) return [];
      
      const boardId = boardData.values[0].id;
      
      const sprintResponse = await this.makeRequest(
        config,
        `/rest/agile/1.0/board/${boardId}/sprint?state=active,future`
      );
      
      if (!sprintResponse.ok) return [];
      
      const sprintData = await sprintResponse.json();
      return (sprintData.values || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        state: s.state,
        startDate: s.startDate,
        endDate: s.endDate
      }));
    } catch (error) {
      console.error('Error fetching sprints:', error);
      return [];
    }
  }

  async getSprintIssues(config: JiraConfig, sprintId: string): Promise<JiraIssue[]> {
    try {
      const jql = `sprint = ${sprintId} ORDER BY status ASC, priority DESC`;
      const response = await this.makeRequest(
        config,
        `/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,description,status,priority,assignee,issuetype,created,updated`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.issues || []).map((issue: any) => this.mapIssue(issue));
    } catch (error) {
      console.error('Error fetching sprint issues:', error);
      return [];
    }
  }

  async getProjectIssues(config: JiraConfig): Promise<JiraIssue[]> {
    try {
      const jql = `project = ${config.projectKey} AND sprint in openSprints() ORDER BY status ASC, priority DESC`;
      const response = await this.makeRequest(
        config,
        `/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,description,status,priority,assignee,issuetype,created,updated&maxResults=50`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.issues || []).map((issue: any) => this.mapIssue(issue));
    } catch (error) {
      console.error('Error fetching project issues:', error);
      return [];
    }
  }

  startSync(widgetId: string, config: JiraConfig, sprintId: string, onUpdate: (issues: JiraIssue[]) => void): void {
    this.stopSync(widgetId);
    
    const fetchAndUpdate = async () => {
      const issues = await this.getSprintIssues(config, sprintId);
      onUpdate(issues);
    };
    
    fetchAndUpdate();
    
    const intervalId = setInterval(fetchAndUpdate, 30000);
    this.syncIntervals.set(widgetId, intervalId);
  }

  stopSync(widgetId: string): void {
    const intervalId = this.syncIntervals.get(widgetId);
    if (intervalId) {
      clearInterval(intervalId);
      this.syncIntervals.delete(widgetId);
    }
  }

  private async makeRequest(config: JiraConfig, endpoint: string): Promise<Response> {
    const auth = btoa(`${config.email}:${config.apiToken}`);
    const url = `${config.baseUrl.replace(/\/$/, '')}${endpoint}`;
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  private mapIssue(issue: any): JiraIssue {
    const statusCategory = this.getStatusCategory(issue.fields?.status?.statusCategory?.key);
    
    return {
      key: issue.key,
      summary: issue.fields?.summary || '',
      description: issue.fields?.description?.content?.[0]?.content?.[0]?.text || '',
      status: issue.fields?.status?.name || 'Unknown',
      statusCategory,
      priority: issue.fields?.priority?.name,
      assignee: issue.fields?.assignee?.displayName,
      issueType: issue.fields?.issuetype?.name || 'Task',
      created: issue.fields?.created,
      updated: issue.fields?.updated
    };
  }

  private getStatusCategory(category: string): 'todo' | 'in_progress' | 'done' {
    switch (category) {
      case 'done':
        return 'done';
      case 'indeterminate':
        return 'in_progress';
      default:
        return 'todo';
    }
  }
}
