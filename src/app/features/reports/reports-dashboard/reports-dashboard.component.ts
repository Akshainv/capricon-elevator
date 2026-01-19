// src/app/features/reports/reports-dashboard/reports-dashboard.component.ts - REDESIGNED
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
  Legend,
  Filler
} from 'chart.js';
import { ReportService } from '../../../services/report.service';
import { ProjectService, Project } from '../../../services/project.service';
import { LeadsService, Lead } from '../../../lead.service';
import { QuotationService, Quotation } from '../../../services/quotation.service';
import { EmployeeService, Employee } from '../../../../employee/employee.service';

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
  Legend,
  Filler
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

  // Selection Controls
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployeeId: string = 'all';
  analysisType: 'monthly' | 'total' = 'monthly';
  employeeSearchQuery: string = '';
  showEmployeeDropdown: boolean = false;

  // Stats Cards
  statCards: StatCard[] = [];

  // Performance Trend Chart Data
  public revenueChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Monthly Revenue (₹L)',
      backgroundColor: '#d4b347',
      hoverBackgroundColor: '#c9a642',
      borderRadius: 6,
      borderWidth: 0,
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
          font: { size: 12, family: "'Inter', sans-serif", weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#d4b347',
        bodyColor: '#fff',
        borderColor: '#d4b347',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` Revenue: ₹${context.parsed.y} L`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: this.getChartTextColor(), font: { size: 11 } }
      },
      y: {
        grid: { color: this.getChartGridColor(), drawTicks: false },
        ticks: { color: this.getChartTextColor(), padding: 10 },
        beginAtZero: true
      }
    }
  };

  public revenueChartType: ChartType = 'bar';

  constructor(
    private reportService: ReportService,
    private projectService: ProjectService,
    private leadsService: LeadsService,
    private quotationService: QuotationService,
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadReportData();
    this.setupThemeListener();
  }

  loadEmployees(): void {
    this.employeeService.getEmployeesByStatus('accept').subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  filterEmployees(): void {
    const query = this.employeeSearchQuery.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.fullName.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    );
  }

  selectEmployee(emp: Employee | 'all'): void {
    if (emp === 'all') {
      this.selectedEmployeeId = 'all';
      this.employeeSearchQuery = 'All Sales Executives';
    } else {
      this.selectedEmployeeId = emp._id;
      this.employeeSearchQuery = emp.fullName;
    }
    this.showEmployeeDropdown = false;
    this.loadReportData();
  }

  toggleAnalysisType(type: 'monthly' | 'total'): void {
    this.analysisType = type;
    this.loadReportData();
  }

  loadReportData(): void {
    this.loading = true;

    // Concurrently fetch data from all relevant services with type safety
    const leads$ = this.leadsService.getAllLeads().toPromise();
    const quotes$ = this.quotationService.getAllQuotations().toPromise();
    const projects$ = this.projectService.getAllProjects().toPromise();

    Promise.all([leads$, quotes$, projects$]).then(([leads, quotationResponse, projects]) => {
      // Extract quotations array from response object
      const quotations = (quotationResponse as any)?.data;
      const quotationArray = Array.isArray(quotations) ? quotations : (quotations ? [quotations] : []);

      this.processAggregatedData(leads || [], quotationArray, projects || []);
      this.loading = false;
    }).catch(error => {
      console.error('❌ Error loading dashboard data:', error);
      this.loading = false;
    });
  }

  private processAggregatedData(leads: Lead[], quotations: Quotation[], projects: Project[]): void {
    // 1. Filter by Employee if selected
    let filteredLeads = leads;
    let filteredQuotes = quotations;
    let filteredProjects = projects;

    if (this.selectedEmployeeId !== 'all') {
      filteredLeads = leads.filter(l => l.assignedTo === this.selectedEmployeeId);
      filteredQuotes = quotations.filter(q => q.createdBy === this.selectedEmployeeId);
      filteredProjects = projects.filter(p => p.assignedTo === this.selectedEmployeeId || p.createdBy === this.selectedEmployeeId);
    }

    // 2. Separate data for Stat Cards (potentially period-filtered) and Trend Chart (always 6-month trend)
    const trendProjects = filteredProjects; // Trend chart data should only be filtered by employee

    // Apply period filtering only for Stat Cards if "Monthly" selected
    if (this.analysisType === 'monthly') {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filteredLeads = filteredLeads.filter(l => new Date(l.createdAt!) >= firstDayOfMonth);
      filteredQuotes = filteredQuotes.filter(q => new Date(q.createdAt!) >= firstDayOfMonth);
      filteredProjects = filteredProjects.filter(p => new Date(p.createdAt!) >= firstDayOfMonth);
    }

    // 3. Calculate Metrics for Stat Cards
    const totalLeads = filteredLeads.length;
    const totalQuotes = filteredQuotes.length;
    const totalProjects = filteredProjects.length;

    const currentCompletedProjects = filteredProjects.filter(p => p.projectStatus === 'completed');
    const totalRevenue = currentCompletedProjects.reduce((sum, p) => sum + (p.projectValue || 0), 0);

    const winRate = totalProjects > 0 ? Math.round((currentCompletedProjects.length / totalProjects) * 100) : 0;

    // 4. Update Stat Cards
    this.statCards = [
      {
        label: 'Lead Flow',
        value: totalLeads,
        subtitle: this.analysisType === 'monthly' ? 'New leads this month' : 'Lifetime leads',
        icon: 'fa-users',
        color: '#22d3ee'
      },
      {
        label: 'Proposals',
        value: totalQuotes,
        subtitle: 'Quotations generated',
        icon: 'fa-file-invoice',
        color: '#818cf8'
      },
      {
        label: 'Project Win Rate',
        value: `${winRate}%`,
        subtitle: `${currentCompletedProjects.length} projects won`,
        icon: 'fa-project-diagram',
        color: '#a855f7'
      },
      {
        label: 'Realized Revenue',
        value: this.formatCurrency(totalRevenue),
        subtitle: 'From completed deals',
        icon: 'fa-rupee-sign',
        color: '#d4b347'
      }
    ];

    // 5. Update Trend Chart using all employee projects (for 6-month history)
    const trendCompletedProjects = trendProjects.filter(p => p.projectStatus === 'completed');
    this.updateTrendChart(trendCompletedProjects);
  }

  private updateTrendChart(completedProjects: Project[]): void {
    const months = this.getTrendMonths(completedProjects);
    const revenueByMonth = months.map(month => {
      const monthProjects = completedProjects.filter(p => {
        // Use createdAt to reflect "Revenue Created" in that month
        const date = new Date(p.createdAt || p.updatedAt!);
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

    setTimeout(() => {
      this.revenueChart?.update();
    }, 100);
  }

  private getTrendMonths(projects: Project[] = []): { label: string; index: number; year: number }[] {
    const months = [];
    const now = new Date();

    let count = 6; // Default for "Monthly Status"

    if (this.analysisType === 'total' && projects.length > 0) {
      // Find the earliest project date to determine how many months to show
      const earliestProjectDate = projects.reduce((earliest, p) => {
        const date = new Date(p.createdAt || p.updatedAt!);
        return date < earliest ? date : earliest;
      }, new Date());

      const diffMonths = (now.getFullYear() - earliestProjectDate.getFullYear()) * 12 + (now.getMonth() - earliestProjectDate.getMonth());
      count = Math.max(12, diffMonths + 1); // Show at least 12 months or all if more

      // Limit to 24 months to keep the graph readable
      if (count > 24) count = 24;
    } else if (this.analysisType === 'total') {
      count = 12; // Fallback
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
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  getChartTextColor(): string {
    const isLightMode = document.documentElement.classList.contains('light-theme');
    return isLightMode ? '#1f2937' : 'rgba(255, 255, 255, 0.6)';
  }

  getChartGridColor(): string {
    const isLightMode = document.documentElement.classList.contains('light-theme');
    return isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(212, 179, 71, 0.1)';
  }

  setupThemeListener(): void {
    const observer = new MutationObserver(() => this.updateChartColors());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  updateChartColors(): void {
    if (this.revenueChartOptions?.plugins?.legend?.labels) {
      this.revenueChartOptions.plugins.legend.labels.color = this.getChartTextColor();
    }
    if (this.revenueChartOptions?.scales) {
      const scales = this.revenueChartOptions.scales as any;
      if (scales.x) {
        scales.x.grid.color = this.getChartGridColor();
        scales.x.ticks.color = this.getChartTextColor();
      }
      if (scales.y) {
        scales.y.grid.color = this.getChartGridColor();
        scales.y.ticks.color = this.getChartTextColor();
      }
    }
    this.revenueChart?.update();
  }
}