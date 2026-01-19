// src/app/sales-reports/sales-reports.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ReportService } from '../services/report.service';
import { AuthService } from '../services/auth.service';
import { ProjectService, Project } from '../services/project.service';
import { QuotationService } from '../services/quotation.service';
import { LeadsService } from '../lead.service';


Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface ReportStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle: string;
}

@Component({
  selector: 'app-sales-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './sales-reports.component.html',
  styleUrls: ['./sales-reports.component.css']
})
export class SalesReportsComponent implements OnInit {
  @ViewChild('revenueChart') revenueChart?: BaseChartDirective;

  loading: boolean = false;
  currentUserId: string = '';
  currentUserName: string = '';

  stats: ReportStat[] = [];
  analysisType: 'monthly' | 'total' = 'monthly';

  public revenueChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Monthly Revenue (₹L)',
      backgroundColor: '#d4b347',
      hoverBackgroundColor: '#c9a642',
      borderRadius: 6,
      borderWidth: 0
    }]
  };

  public revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: this.getChartTextColor(),
          font: { size: 12, family: "'Inter', sans-serif" }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#d4b347',
        bodyColor: '#fff',
        borderColor: '#d4b347',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: this.getChartGridColor() },
        ticks: { color: this.getChartTextColor() }
      },
      y: {
        grid: { color: this.getChartGridColor() },
        ticks: { color: this.getChartTextColor() },
        beginAtZero: true
      }
    }
  };

  public revenueChartType: ChartType = 'bar';

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private projectService: ProjectService,
    private quotationService: QuotationService,
    private leadsService: LeadsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUserId = user.userId || '';
      this.currentUserName = user.fullName || user.email || 'Sales User';
      this.loadReportsData();
    }
    this.setupThemeListener();
  }

  loadReportsData(): void {
    if (!this.currentUserId) {
      console.error('No user ID found');
      return;
    }

    this.loading = true;

    Promise.all([
      this.leadsService.getLeadsAssignedToMe().toPromise(),
      this.quotationService.getAllQuotations().toPromise(),
      this.projectService.getProjectsBySalesExecutive(this.currentUserId).toPromise()
    ]).then(([leads, quotesResponse, projects]) => {
      const allQuotes = quotesResponse?.data || [];
      const myQuotes = Array.isArray(allQuotes)
        ? allQuotes.filter((q: any) => q.createdBy === this.currentUserId || q.userId === this.currentUserId)
        : [];

      this.processSalesReportData(leads || [], myQuotes, projects || []);
      this.loading = false;
    }).catch(error => {
      console.error('❌ Error loading sales reports:', error);
      this.loading = false;
    });
  }

  setAnalysisType(type: 'monthly' | 'total'): void {
    this.analysisType = type;
    this.loadReportsData();
  }

  private processSalesReportData(leads: any[], quotes: any[], projects: any[]): void {
    let filteredLeads = [...leads];
    let filteredQuotes = [...quotes];
    let filteredProjects = [...projects];

    // Period filtering for Stat Cards
    if (this.analysisType === 'monthly') {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filteredLeads = filteredLeads.filter(l => new Date(l.createdAt!) >= firstDayOfMonth);
      filteredQuotes = filteredQuotes.filter(q => new Date(q.createdAt || q.date) >= firstDayOfMonth);
      filteredProjects = filteredProjects.filter(p => new Date(p.createdAt || p.startDate) >= firstDayOfMonth);
    }

    const completedProjects = filteredProjects.filter(p => p.projectStatus === 'completed');
    const totalRevenue = completedProjects.reduce((sum, p) => sum + (p.projectValue || 0), 0);

    this.stats = [
      {
        label: this.analysisType === 'monthly' ? 'Monthly Revenue' : 'Total Revenue',
        value: this.formatCurrency(totalRevenue),
        icon: 'fa-rupee-sign',
        color: '#22c55e',
        subtitle: `${completedProjects.length} projects completed`
      },
      {
        label: this.analysisType === 'monthly' ? 'New Leads' : 'Total Leads',
        value: filteredLeads.length,
        icon: 'fa-users',
        color: '#3b82f6',
        subtitle: `${filteredLeads.filter(l => l.status === 'CS Executed').length} executed`
      },
      {
        label: this.analysisType === 'monthly' ? 'Quotations' : 'Total Quotations',
        value: filteredQuotes.length,
        icon: 'fa-file-invoice',
        color: '#d4b347',
        subtitle: `${filteredQuotes.filter(q => q.status === 'Approved').length} approved`
      },
      {
        label: this.analysisType === 'monthly' ? 'Project Load' : 'Total Projects',
        value: filteredProjects.length,
        icon: 'fa-project-diagram',
        color: '#94a3b8',
        subtitle: `${filteredProjects.filter(p => p.projectStatus === 'ongoing').length} ongoing`
      }
    ];

    // Chart logic (always shows 6+ months trend, but based on all my projects)
    const trendProjects = projects.filter(p => p.projectStatus === 'completed');
    this.processRevenueTrend(trendProjects, projects);

    setTimeout(() => {
      this.revenueChart?.update();
    }, 100);
  }

  private processRevenueTrend(completedProjects: any[], allProjects: any[]): void {
    const months = this.getTrendMonths(allProjects);
    const revenueByMonth = months.map(month => {
      const monthProjects = completedProjects.filter(p => {
        // Use createdAt for revenue tracking as per Admin logic
        const date = new Date(p.createdAt || p.startDate);
        return date.getMonth() === month.index &&
          date.getFullYear() === month.year;
      });
      return monthProjects.reduce((sum, p) => sum + (p.projectValue || 0), 0);
    });

    this.revenueChartData = {
      labels: months.map(m => m.label),
      datasets: [{
        data: revenueByMonth.map(r => parseFloat((r / 100000).toFixed(1))),
        label: this.analysisType === 'total' ? 'Total Revenue Growth (₹L)' : 'Monthly Revenue (₹L)',
        backgroundColor: '#d4b347',
        hoverBackgroundColor: '#c9a642',
        borderRadius: 6,
        borderWidth: 0
      }]
    };
  }

  private getTrendMonths(projects: any[] = []): { label: string; index: number; year: number }[] {
    const months = [];
    const now = new Date();

    let count = 6;

    if (this.analysisType === 'total' && projects.length > 0) {
      const earliestProjectDate = projects.reduce((earliest, p) => {
        const date = new Date(p.createdAt || p.startDate);
        return date < earliest ? date : earliest;
      }, new Date());

      const diffMonths = (now.getFullYear() - earliestProjectDate.getFullYear()) * 12 + (now.getMonth() - earliestProjectDate.getMonth());
      count = Math.max(12, diffMonths + 1);
      if (count > 24) count = 24;
    } else if (this.analysisType === 'total') {
      count = 12;
    }

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleString('en-US', { month: 'short' }) +
          (count > 6 ? ` ${date.getFullYear().toString().slice(-2)}` : ''),
        index: date.getMonth(),
        year: date.getFullYear()
      });
    }
    return months;
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // ==========================================
  // LIGHT MODE SUPPORT METHODS
  // ==========================================

  getChartTextColor(): string {
    const isLightMode = document.documentElement.classList.contains('light-theme') ||
      document.documentElement.getAttribute('data-theme') === 'light';
    return isLightMode ? '#1f2937' : 'rgba(255, 255, 255, 0.6)';
  }

  getChartGridColor(): string {
    const isLightMode = document.documentElement.classList.contains('light-theme') ||
      document.documentElement.getAttribute('data-theme') === 'light';
    return isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(212, 179, 71, 0.1)';
  }

  setupThemeListener(): void {
    const observer = new MutationObserver(() => {
      this.updateChartColors();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
  }

  updateChartColors(): void {
    if (this.revenueChartOptions && this.revenueChartOptions.plugins && this.revenueChartOptions.scales) {
      // Update legend color
      if (this.revenueChartOptions.plugins.legend && this.revenueChartOptions.plugins.legend.labels) {
        this.revenueChartOptions.plugins.legend.labels.color = this.getChartTextColor();
      }

      // Update axis colors
      if (this.revenueChartOptions.scales['x']) {
        this.revenueChartOptions.scales['x'].grid = { color: this.getChartGridColor() };
        if (this.revenueChartOptions.scales['x'].ticks) {
          this.revenueChartOptions.scales['x'].ticks.color = this.getChartTextColor();
        }
      }

      if (this.revenueChartOptions.scales['y']) {
        this.revenueChartOptions.scales['y'].grid = { color: this.getChartGridColor() };
        if (this.revenueChartOptions.scales['y'].ticks) {
          this.revenueChartOptions.scales['y'].ticks.color = this.getChartTextColor();
        }
      }

      // Update chart
      if (this.revenueChart) {
        this.revenueChart.update();
      }
    }
  }
}