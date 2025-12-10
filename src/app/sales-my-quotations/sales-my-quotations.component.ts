// src/app/sales-my-quotations/sales-my-quotations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Quotation {
  id: string;
  quoteNumber: string;
  customerName: string;
  email: string;
  phone: string;
  elevatorType: string;
  floors: number;
  amount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdDate: Date;
  validUntil: Date;
}

@Component({
  selector: 'app-sales-my-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-my-quotations.component.html',
  styleUrls: ['./sales-my-quotations.component.css']
})
export class SalesMyQuotationsComponent implements OnInit {
  searchTerm: string = '';
  statusFilter: string = '';
  sortBy: string = 'date-desc';

  // Sample data - only quotations created by this sales executive
  quotations: Quotation[] = [
    {
      id: '1',
      quoteNumber: 'QT-2024-001',
      customerName: 'John Smith',
      email: 'john@example.com',
      phone: '+91 9876543210',
      elevatorType: '8-Floor Passenger',
      floors: 8,
      amount: 1829000,
      status: 'sent',
      createdDate: new Date('2024-11-15'),
      validUntil: new Date('2024-12-15')
    },
    {
      id: '2',
      quoteNumber: 'QT-2024-005',
      customerName: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+91 9876543211',
      elevatorType: '5-Floor Home Lift',
      floors: 5,
      amount: 850000,
      status: 'approved',
      createdDate: new Date('2024-11-10'),
      validUntil: new Date('2024-12-10')
    },
    {
      id: '3',
      quoteNumber: 'QT-2024-008',
      customerName: 'Michael Brown',
      email: 'michael@example.com',
      phone: '+91 9876543212',
      elevatorType: '12-Floor Goods',
      floors: 12,
      amount: 2500000,
      status: 'draft',
      createdDate: new Date('2024-11-20'),
      validUntil: new Date('2024-12-20')
    },
    {
      id: '4',
      quoteNumber: 'QT-2024-012',
      customerName: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+91 9876543213',
      elevatorType: '6-Floor Hospital',
      floors: 6,
      amount: 1950000,
      status: 'sent',
      createdDate: new Date('2024-11-18'),
      validUntil: new Date('2024-12-18')
    },
    {
      id: '5',
      quoteNumber: 'QT-2024-015',
      customerName: 'David Wilson',
      email: 'david@example.com',
      phone: '+91 9876543214',
      elevatorType: '10-Floor Commercial',
      floors: 10,
      amount: 2200000,
      status: 'rejected',
      createdDate: new Date('2024-11-12'),
      validUntil: new Date('2024-12-12')
    }
  ];

  filteredQuotations: Quotation[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applyFiltersAndSort();
  }

  // Stats getters
  get draftCount(): number {
    return this.quotations.filter(q => q.status === 'draft').length;
  }

  get sentCount(): number {
    return this.quotations.filter(q => q.status === 'sent').length;
  }

  get approvedCount(): number {
    return this.quotations.filter(q => q.status === 'approved').length;
  }

  get totalValue(): number {
    return this.quotations.reduce((sum, q) => sum + q.amount, 0);
  }

  applyFiltersAndSort(): void {
    // Apply filters
    this.filteredQuotations = this.quotations.filter(quote => {
      const matchesSearch = !this.searchTerm || 
        quote.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        quote.quoteNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        quote.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || quote.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    this.filteredQuotations.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return b.createdDate.getTime() - a.createdDate.getTime();
        case 'date-asc':
          return a.createdDate.getTime() - b.createdDate.getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  }

  createQuotation(): void {
    this.router.navigate(['/quotations/create']);
  }

  viewQuotation(id: string): void {
    this.router.navigate(['/quotations/details', id]);
  }

  editQuotation(id: string): void {
    const quote = this.quotations.find(q => q.id === id);
    if (quote?.status === 'draft') {
      this.router.navigate(['/quotations/edit', id]);
    } else {
      alert('Only draft quotations can be edited');
    }
  }

  downloadPDF(quote: Quotation): void {
    console.log('Downloading PDF for:', quote.quoteNumber);
    alert(`Downloading ${quote.quoteNumber}.pdf`);
  }

  sendEmail(quote: Quotation): void {
    if (quote.status === 'draft') {
      alert('Please complete the quotation before sending');
      return;
    }
    console.log('Sending email for:', quote.quoteNumber);
    alert(`Email sent to ${quote.email}`);
  }

  duplicateQuotation(id: string): void {
    const quote = this.quotations.find(q => q.id === id);
    if (quote) {
      console.log('Duplicating quotation:', quote.quoteNumber);
      alert('Quotation duplicated successfully!');
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Draft',
      'sent': 'Sent',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}