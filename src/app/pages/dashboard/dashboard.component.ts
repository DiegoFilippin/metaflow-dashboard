import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { DashboardGridComponent } from '../../components/dashboard-grid/dashboard-grid.component';
import { WidgetEditorComponent } from '../../components/widget-editor/widget-editor.component';
import { AddWidgetMenuComponent } from '../../components/add-widget-menu/add-widget-menu.component';
import { ProjectModalComponent } from '../../components/project-modal/project-modal.component';
import { PanelModalComponent } from '../../components/panel-modal/panel-modal.component';
import { ReportModalComponent } from '../../components/report-modal/report-modal.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    DashboardGridComponent,
    WidgetEditorComponent,
    AddWidgetMenuComponent,
    ProjectModalComponent,
    PanelModalComponent,
    ReportModalComponent
  ],
  template: `
    <div class="h-screen flex bg-gray-100">
      <!-- Sidebar -->
      <app-sidebar />
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <app-topbar />
        
        <!-- Dashboard Grid + Widget Editor -->
        <main class="flex-1 flex overflow-hidden">
          <app-dashboard-grid class="flex-1 overflow-auto" />
          <app-widget-editor />
        </main>
      </div>
      
      <!-- Add Widget FAB -->
      <app-add-widget-menu />
      
      <!-- Modals -->
      <app-project-modal />
      <app-panel-modal />
      <app-report-modal />
    </div>
  `
})
export class DashboardPageComponent {}
