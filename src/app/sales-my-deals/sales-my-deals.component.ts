// src/app/sales-my-deals/sales-my-deals.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Deal {
  id: string;
  title: string;
  company: string;
  amount: number;
  elevatorType: string;
  probability: number;
  closeDate: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: string;
}

interface Column {
  title: string;
  status: string;
  color: string;
  deals: Deal[];
}

@Component({
  selector: 'app-sales-my-deals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-my-deals.component.html',
  styleUrls: ['./sales-my-deals.component.css']
})
export class SalesMyDealsComponent implements OnInit {
  allDeals: Deal[] = [];
  columns: Column[] = [];
  draggedDeal: Deal | null = null;
  
  // Filters
  filterValue: string = '';
  filterDate: string = '';

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadMyDeals();
  }

  initializeColumns(): void {
    this.columns = [
      { title: 'Lead', status: 'lead', color: '#3b82f6', deals: [] },
      { title: 'Qualified', status: 'qualified', color: '#8b5cf6', deals: [] },
      { title: 'Proposal', status: 'proposal', color: '#f59e0b', deals: [] },
      { title: 'Negotiation', status: 'negotiation', color: '#ec4899', deals: [] },
      { title: 'Won', status: 'won', color: '#10b981', deals: [] },
      { title: 'Lost', status: 'lost', color: '#ef4444', deals: [] }
    ];
  }

  loadMyDeals(): void {
    // Sample data - only deals assigned to current sales executive
    this.allDeals = [
      {
        id: '1',
        title: 'Luxury Apartment Complex',
        company: 'Prestige Group',
        amount: 2500000,
        elevatorType: 'Passenger Elevator',
        probability: 75,
        closeDate: '2024-12-15',
        contactPerson: 'Raj Kumar',
        phone: '+91 9876543210',
        email: 'raj@prestige.com',
        status: 'proposal'
      },
      {
        id: '2',
        title: 'Corporate Office Building',
        company: 'Tech Park Ltd',
        amount: 3200000,
        elevatorType: 'High-Speed Elevator',
        probability: 90,
        closeDate: '2024-11-30',
        contactPerson: 'Suresh Reddy',
        phone: '+91 9876543211',
        email: 'suresh@techpark.com',
        status: 'negotiation'
      },
      {
        id: '3',
        title: 'Shopping Mall Expansion',
        company: 'Phoenix Mills',
        amount: 1800000,
        elevatorType: 'Freight Elevator',
        probability: 50,
        closeDate: '2025-01-20',
        contactPerson: 'Amit Shah',
        phone: '+91 9876543212',
        email: 'amit@phoenixmalls.com',
        status: 'qualified'
      },
      {
        id: '4',
        title: 'Sunrise Mall',
        company: 'Sunrise Mall Pvt Ltd',
        amount: 4500000,
        elevatorType: '15-Floor Passenger Elevator',
        probability: 100,
        closeDate: '2024-10-18',
        contactPerson: 'John Smith',
        phone: '+91 9876543215',
        email: 'john@sunrisemall.com',
        status: 'won'
      },
      {
        id: '5',
        title: 'Residential Tower Project',
        company: 'Skyline Developers',
        amount: 3500000,
        elevatorType: 'Passenger Elevator',
        probability: 25,
        closeDate: '2025-02-10',
        contactPerson: 'Vijay Singh',
        phone: '+91 9876543214',
        email: 'vijay@skyline.com',
        status: 'lead'
      }
    ];

    this.organizeDeals();
  }

  organizeDeals(): void {
    // Clear all columns first
    this.columns.forEach(column => {
      column.deals = [];
    });

    // Apply filters
    let filteredDeals = this.allDeals;

    if (this.filterValue) {
      const minValue = parseFloat(this.filterValue);
      filteredDeals = filteredDeals.filter(deal => deal.amount >= minValue);
    }

    if (this.filterDate) {
      filteredDeals = filteredDeals.filter(deal => deal.closeDate <= this.filterDate);
    }

    // Distribute deals to columns
    filteredDeals.forEach(deal => {
      const column = this.columns.find(col => col.status === deal.status);
      if (column) {
        column.deals.push(deal);
      }
    });
  }

  applyFilters(): void {
    this.organizeDeals();
  }

  clearFilters(): void {
    this.filterValue = '';
    this.filterDate = '';
    this.organizeDeals();
  }

  // Drag and Drop Methods
  onDragStart(event: DragEvent, deal: Deal): void {
    this.draggedDeal = deal;
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    
    if (this.draggedDeal) {
      // Update the deal status
      this.draggedDeal.status = newStatus;
      
      // Update probability based on status
      if (newStatus === 'won') {
        this.draggedDeal.probability = 100;
      } else if (newStatus === 'lost') {
        this.draggedDeal.probability = 0;
      }
      
      // Reorganize deals into columns
      this.organizeDeals();
      
      // Clear dragged deal
      this.draggedDeal = null;
      
      alert('Deal status updated successfully!');
    }
  }

  // Navigation Methods
  viewDealDetails(deal: Deal): void {
    this.router.navigate(['/deals', deal.id]);
  }

  createNewDeal(): void {
    this.router.navigate(['/deals/create']);
  }

  convertToProject(deal: Deal, event: Event): void {
    event.stopPropagation();
    
    const confirmConvert = confirm(`Convert "${deal.title}" to project?`);
    if (confirmConvert) {
      this.router.navigate(['/projects/create'], { 
        state: { 
          deal: {
            id: deal.id,
            title: deal.title,
            company: deal.company,
            amount: deal.amount,
            elevatorType: deal.elevatorType,
            contactPerson: deal.contactPerson,
            phone: deal.phone,
            email: deal.email
          }
        } 
      });
    }
  }

  // Utility Methods
  getColumnCount(column: Column): number {
    return column.deals.length;
  }

  getColumnTotal(column: Column): number {
    return column.deals.reduce((sum, deal) => sum + deal.amount, 0);
  }

  getTotalPipelineValue(): number {
    return this.allDeals
      .filter(deal => deal.status !== 'won' && deal.status !== 'lost')
      .reduce((sum, deal) => sum + deal.amount, 0);
  }

  getWonDealsValue(): number {
    return this.allDeals
      .filter(deal => deal.status === 'won')
      .reduce((sum, deal) => sum + deal.amount, 0);
  }

  getActiveDealsCount(): number {
    return this.allDeals.filter(deal => deal.status !== 'won' && deal.status !== 'lost').length;
  }

  getWinRate(): number {
    const totalClosed = this.allDeals.filter(deal => 
      deal.status === 'won' || deal.status === 'lost'
    ).length;
    
    if (totalClosed === 0) return 0;
    
    const wonDeals = this.allDeals.filter(deal => deal.status === 'won').length;
    return Math.round((wonDeals / totalClosed) * 100);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}