import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget, TableRow, TableColumn } from '../../../models/dashboard.models';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-white rounded-xl p-6 flex flex-col">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ widget.title }}</h3>
      <div class="flex-1 overflow-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              @for (col of columns; track col.key) {
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                  {{ col.label }}
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of data; track $index) {
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                @for (col of columns; track col.key) {
                  <td class="py-3 px-4">
                    @if (col.type === 'status') {
                      <span [class]="getStatusClass(row[col.key])">
                        {{ getStatusLabel(row[col.key]) }}
                      </span>
                    } @else if (col.type === 'number') {
                      <span class="text-sm text-gray-900 font-medium">
                        {{ formatNumber(row[col.key]) }}
                      </span>
                    } @else {
                      <span class="text-sm text-gray-700">{{ row[col.key] }}</span>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DataTableComponent {
  @Input({ required: true }) widget!: Widget;

  get data(): TableRow[] {
    return this.widget.data as TableRow[];
  }

  get columns(): TableColumn[] {
    return this.widget.config.columns || [];
  }

  getStatusClass(status: any): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'green':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'yellow':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'red':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatusLabel(status: any): string {
    switch (status) {
      case 'green':
        return 'OK';
      case 'yellow':
        return 'Atenção';
      case 'red':
        return 'Crítico';
      default:
        return String(status);
    }
  }

  formatNumber(value: any): string {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR');
    }
    return String(value);
  }
}
