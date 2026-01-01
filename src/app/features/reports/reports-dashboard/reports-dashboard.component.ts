// src/app/features/reports/reports-dashboard/reports-dashboard.component.ts - FIXED VERSION
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  PieController,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ReportService } from '../../../services/report.service';
import { ProjectService } from '../../../services/project.service';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  PieController,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface StatCard {
  label: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.css']
})
export class ReportsDashboardComponent implements OnInit {
  @ViewChild('revenueChart') revenueChart?: BaseChartDirective;

  loading: boolean = false;
  dateFilter: string = 'thisMonth';
  
  // Stats Cards
  statCards: StatCard[] = [];
  
  // Revenue Chart Data
  public revenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Monthly Revenue (₹L)',
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
          color: 'rgba(255, 255, 255, 0.7)',
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
        grid: { color: 'rgba(212, 179, 71, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)' }
      },
      y: {
        grid: { color: 'rgba(212, 179, 71, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        beginAtZero: true
      }
    }
  };

  public revenueChartType: ChartType = 'line';

  constructor(
    private reportService: ReportService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.loading = true;
    
    Promise.all([
      this.reportService.getAdminReports().toPromise(),
      this.projectService.getAllProjects().toPromise()
    ]).then(([reportData, projects]) => {
      this.processReportData(reportData);
      this.processRevenueData(projects || []);
      this.loading = false;
    }).catch(error => {
      console.error('❌ Error loading report data:', error);
      this.loading = false;
    });
  }

  private processReportData(data: any): void {
    // Process Stats Cards
    this.statCards = [
      {
        label: 'Total Revenue',
        value: this.formatCurrency(data.totalRevenue || 0),
        subtitle: `${data.projectsWon || 0} projects completed`,
        icon: 'fa-rupee-sign',
        color: '#22c55e'
      },
      {
        label: 'Total Projects',
        value: data.totalProjects || 0,
        subtitle: `${data.projectsWon || 0} won`,
        icon: 'fa-project-diagram',
        color: '#3b82f6'
      },
      {
        label: 'Conversion Rate',
        value: `${data.conversionRate || 0}%`,
        subtitle: 'Overall performance',
        icon: 'fa-chart-line',
        color: '#f59e0b'
      },
      {
        label: 'Avg Deal Size',
        value: this.formatCurrency(data.avgDealSize || 0),
        subtitle: 'Per completed project',
        icon: 'fa-money-bill-wave',
        color: '#8b5cf6'
      }
    ];

    // Update charts
    setTimeout(() => {
      this.revenueChart?.update();
    }, 100);
  }

  private processRevenueData(projects: any[]): void {
    const completedProjects = projects.filter(p => p.projectStatus === 'completed');
    
    // Get last 6 months
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
        label: 'Monthly Revenue (₹L)',
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

  onDateFilterChange(): void {
    this.loadReportData();
  }

  viewProjects(): void {
    this.router.navigate(['/projects']);
  }

  viewDeals(): void {
    this.router.navigate(['/deals']);
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}