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
import { ProjectService } from '../services/project.service';
import { DealService } from '../services/deal.service';

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
  
  public revenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'My Monthly Revenue (₹L)',
      fill: true,
      tension: 0.4,
      borderColor: '#d4b347',
      backgroundColor: 'rgba(212, 179, 71, 0.1)',
      pointBackgroundColor: '#d4b347',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#d4b347',
      pointRadius: 5,
      pointHoverRadius: 7,
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

  public revenueChartType: ChartType = 'line';

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private projectService: ProjectService,
    private dealService: DealService,
    private router: Router
  ) {}

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
      this.reportService.getSalesReports(this.currentUserId).toPromise(),
      this.projectService.getProjectsBySalesExecutive(this.currentUserId).toPromise(),
      this.dealService.getDealsBySalesExecutive(this.currentUserId).toPromise()
    ]).then(([reportData, projects, deals]) => {
      this.processSalesReportData(reportData, projects || [], deals || []);
      this.loading = false;
    }).catch(error => {
      console.error('❌ Error loading sales reports:', error);
      this.loading = false;
    });
  }

  private processSalesReportData(data: any, projects: any[], deals: any[]): void {
    const completedProjects = projects.filter(p => p.projectStatus === 'completed');
    const totalRevenue = completedProjects.reduce((sum, p) => sum + p.projectValue, 0);

    this.stats = [
      {
        label: 'My Total Revenue',
        value: this.formatCurrency(totalRevenue),
        icon: 'fa-rupee-sign',
        color: '#22c55e',
        subtitle: `${completedProjects.length} projects completed`
      },
      {
        label: 'My Total Projects',
        value: projects.length,
        icon: 'fa-project-diagram',
        color: '#3b82f6',
        subtitle: `${completedProjects.length} completed`
      }
    ];

    this.processRevenueTrend(completedProjects);

    setTimeout(() => {
      this.revenueChart?.update();
    }, 100);
  }

  private processRevenueTrend(completedProjects: any[]): void {
    const months = this.getLast6Months();
    const revenueByMonth = months.map(month => {
      const monthProjects = completedProjects.filter(p => {
        const completeDate = new Date(p.actualCompletionDate || p.updatedAt);
        return completeDate.getMonth() === month.index && 
               completeDate.getFullYear() === month.year;
      });
      return monthProjects.reduce((sum, p) => sum + p.projectValue, 0);
    });

    this.revenueChartData = {
      labels: months.map(m => m.label),
      datasets: [{
        data: revenueByMonth.map(r => parseFloat((r / 100000).toFixed(1))),
        label: 'My Monthly Revenue (₹L)',
        fill: true,
        tension: 0.4,
        borderColor: '#d4b347',
        backgroundColor: 'rgba(212, 179, 71, 0.1)',
        pointBackgroundColor: '#d4b347',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#d4b347',
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    };
  }

  private getLast6Months(): { label: string; index: number; year: number }[] {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleString('en-US', { month: 'short' }),
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