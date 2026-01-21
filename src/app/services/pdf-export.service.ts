import { Injectable, inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private dashboardService = inject(DashboardService);

  async exportToPdf(): Promise<void> {
    const project = this.dashboardService.currentProject();
    const panel = this.dashboardService.currentPanel();
    const report = this.dashboardService.currentReport();
    
    if (!project || !report) {
      console.error('No project or report selected');
      return;
    }

    const dashboardElement = document.querySelector('app-dashboard-grid > div') as HTMLElement;
    if (!dashboardElement) {
      console.error('Dashboard element not found');
      return;
    }

    try {
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f3f4f6'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFillColor(124, 58, 237); // brand-700
      pdf.rect(0, 0, pageWidth, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(project.name, 10, 13);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const panelName = panel?.name || 'Painel Principal';
      pdf.text(`${panelName} - ${report.title}`, pageWidth - 10, 13, { align: 'right' });

      // Dashboard image
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxImgHeight = pageHeight - 35;
      
      const finalImgHeight = Math.min(imgHeight, maxImgHeight);
      const finalImgWidth = (finalImgHeight === maxImgHeight) 
        ? (canvas.width * finalImgHeight) / canvas.height 
        : imgWidth;

      pdf.addImage(imgData, 'PNG', 10, 25, finalImgWidth, finalImgHeight);

      // Footer
      pdf.setTextColor(128, 128, 128);
      pdf.setFontSize(8);
      const date = new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Gerado em ${date} - MetaFlow Dashboard`, pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Save
      const fileName = `${project.name}_${panelName}_${report.title}`.replace(/\s+/g, '_');
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }
}
