// src/app/sales-reports/sales-reports.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProductSales {
  product: string;
  quantity: number;
  revenue: number;
  percentage: number;
  color: string;
}

interface SourceAnalysis {
  source: string;
  leads: number;
  converted: number;
  conversionRate: number;
  revenue: number;
  color: string;
}

interface PeriodComparison {
  period: string;
  revenue: number;
  deals: number;
  leads: number;
}

@Component({
  selector: 'app-sales-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-reports.component.html',
  styleUrls: ['./sales-reports.component.css']
})
export class SalesReportsComponent implements OnInit {
  selectedPeriod: string = 'month';
  comparisonPeriod: string = 'last-month';
  
  // Product-wise Sales
  productSales: ProductSales[] = [
    { product: 'Passenger Elevators', quantity: 12, revenue: 6500000, percentage: 58, color: '#3b82f6' },
    { product: 'Goods Elevators', quantity: 8, revenue: 2800000, percentage: 25, color: '#22c55e' },
    { product: 'Home Lifts', quantity: 6, revenue: 1200000, percentage: 11, color: '#f59e0b' },
    { product: 'Hospital Lifts', quantity: 3, revenue: 700000, percentage: 6, color: '#a855f7' }
  ];

  // Source Analysis
  sourceAnalysis: SourceAnalysis[] = [
    { source: 'Website', leads: 98, converted: 42, conversionRate: 43, revenue: 4200000, color: '#3b82f6' },
    { source: 'Walk-in', leads: 74, converted: 35, conversionRate: 47, revenue: 3800000, color: '#22c55e' },
    { source: 'Reference', leads: 49, converted: 28, conversionRate: 57, revenue: 2500000, color: '#f59e0b' },
    { source: 'Phone Call', leads: 27, converted: 15, conversionRate: 56, revenue: 1200000, color: '#a855f7' }
  ];

  // Time Period Comparison
  periodComparison: PeriodComparison[] = [
    { period: 'This Month', revenue: 4500000, deals: 18, leads: 62 },
    { period: 'Last Month', revenue: 3900000, deals: 14, leads: 58 },
    { period: 'Same Month Last Year', revenue: 3200000, deals: 12, leads: 45 }
  ];

  // Monthly Sales Trend
  monthlyTrend = [
    { month: 'Jul', revenue: 3200000, deals: 12, avgDeal: 266667 },
    { month: 'Aug', revenue: 3800000, deals: 15, avgDeal: 253333 },
    { month: 'Sep', revenue: 4200000, deals: 16, avgDeal: 262500 },
    { month: 'Oct', revenue: 3900000, deals: 14, avgDeal: 278571 },
    { month: 'Nov', revenue: 4500000, deals: 18, avgDeal: 250000 },
    { month: 'Dec', revenue: 4500000, deals: 18, avgDeal: 250000 }
  ];

  // Regional Performance
  regionalPerformance = [
    { region: 'Kochi', revenue: 5200000, deals: 22, share: 46 },
    { region: 'Thrissur', revenue: 3100000, deals: 13, share: 27 },
    { region: 'Calicut', revenue: 2200000, deals: 9, share: 19 },
    { region: 'Others', revenue: 900000, deals: 4, share: 8 }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadReportsData();
  }

  loadReportsData(): void {
    console.log('Loading sales reports for period:', this.selectedPeriod);
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadReportsData();
  }

  changeComparison(period: string): void {
    this.comparisonPeriod = period;
    this.loadReportsData();
  }

  exportToExcel(): void {
    alert('Exporting to Excel...');
  }

  exportToPDF(): void {
    alert('Exporting to PDF...');
  }

  formatCurrency(amount: number): string {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  getTotalRevenue(): number {
    return this.productSales.reduce((sum, item) => sum + item.revenue, 0);
  }

  getTotalQuantity(): number {
    return this.productSales.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalLeads(): number {
    return this.sourceAnalysis.reduce((sum, item) => sum + item.leads, 0);
  }

  getTotalConversions(): number {
    return this.sourceAnalysis.reduce((sum, item) => sum + item.converted, 0);
  }

  getOverallConversionRate(): number {
    const total = this.getTotalLeads();
    const converted = this.getTotalConversions();
    return total === 0 ? 0 : Math.round((converted / total) * 100);
  }

  getMaxRevenue(): number {
    return Math.max(...this.monthlyTrend.map(m => m.revenue));
  }

  getBarHeight(value: number): number {
    const max = this.getMaxRevenue();
    return max === 0 ? 0 : (value / max) * 100;
  }

  // FIXED: Safe growth calculation with zero check
  getGrowthPercentage(current: number, previous: number): number {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  // NEW: Returns absolute value for display (e.g., "15%" instead of "-15%")
  getAbsoluteGrowthPercentage(current: number, previous: number): number {
    return Math.abs(this.getGrowthPercentage(current, previous));
  }

  // NEW: Returns rounded value for consistency
  getRoundedGrowthPercentage(current: number, previous: number): number {
    return Math.round(this.getGrowthPercentage(current, previous));
  }

  getGrowthColor(percentage: number): string {
    return percentage >= 0 ? '#22c55e' : '#ef4444';
  }
}