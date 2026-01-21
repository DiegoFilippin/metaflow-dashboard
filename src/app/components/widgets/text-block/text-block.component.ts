import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/dashboard.models';

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {{ widget.title }}
      </h3>
      <div class="flex-1 overflow-auto">
        <div 
          class="prose prose-sm max-w-none text-gray-700"
          [innerHTML]="formattedContent"
        ></div>
      </div>
    </div>
  `
})
export class TextBlockComponent {
  @Input({ required: true }) widget!: Widget;

  get formattedContent(): string {
    const content = this.widget.data?.content || '';
    // Convert line breaks to <br> and basic markdown-like formatting
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }
}
