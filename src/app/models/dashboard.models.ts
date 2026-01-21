export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  panels: Panel[];
}

export interface Panel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  reports: Report[];
}

export interface Report {
  id: string;
  panelId: string;
  month: number;
  year: number;
  title: string;
  widgets: Widget[];
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  colSpan: 1 | 2 | 3;
  position?: number;
  data: any;
  config: WidgetConfig;
}

export type WidgetType = 'kpi-card' | 'bar-chart' | 'pie-chart' | 'data-table' | 'gauge-chart' | 'line-chart' | 'progress-card' | 'comparison-card' | 'text-block' | 'task-list' | 'jira-sprint';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: UserRole;
}

export interface WidgetConfig {
  backgroundColor?: string;
  textColor?: string;
  showLegend?: boolean;
  columns?: TableColumn[];
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'status' | 'currency' | 'percent';
}

export interface KpiData {
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TableRow {
  [key: string]: string | number | 'green' | 'yellow' | 'red';
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
  jiraKey?: string;
}
